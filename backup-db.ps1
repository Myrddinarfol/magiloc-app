# ============================================================
# MagiLoc - Sauvegarde locale de la base de donnees PostgreSQL
# ============================================================
# Usage : clic droit > Executer avec PowerShell
#         ou en terminal :  .\backup-db.ps1
#
# - Lit DATABASE_URL dans backend\.env
# - Cree un dump SQL complet horodate dans backups\
# - Conserve les 10 sauvegardes les plus recentes
#
# Restauration (vers une base vide) :
#   psql "postgresql://postgres:MOTDEPASSE@localhost:5432/magiloc_dev" -f backups\magiloc_backup_XXXX.sql
# ============================================================

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$envFile = Join-Path $projectRoot 'backend\.env'
$backupDir = Join-Path $projectRoot 'backups'
$keepCount = 10

# 1. Trouver pg_dump (PATH, sinon installation PostgreSQL standard)
$pgDump = $null
$cmd = Get-Command pg_dump -ErrorAction SilentlyContinue
if ($cmd) {
    $pgDump = $cmd.Source
} else {
    $candidates = Get-ChildItem 'C:\Program Files\PostgreSQL\*\bin\pg_dump.exe' -ErrorAction SilentlyContinue |
        Sort-Object FullName -Descending
    if ($candidates) { $pgDump = $candidates[0].FullName }
}
if (-not $pgDump) {
    Write-Host "ERREUR: pg_dump introuvable. Installez les outils clients PostgreSQL." -ForegroundColor Red
    exit 1
}

# 2. Lire DATABASE_URL depuis backend\.env
if (-not (Test-Path $envFile)) {
    Write-Host "ERREUR: $envFile introuvable." -ForegroundColor Red
    exit 1
}
$urlLine = Get-Content $envFile | Where-Object { $_ -match '^\s*DATABASE_URL\s*=' } | Select-Object -First 1
if (-not $urlLine) {
    Write-Host "ERREUR: DATABASE_URL absente de backend\.env" -ForegroundColor Red
    exit 1
}
$databaseUrl = ($urlLine -replace '^\s*DATABASE_URL\s*=', '').Trim().Trim('"').Trim("'")

# Affichage sans le mot de passe
$safeUrl = $databaseUrl -replace '(://[^:]+:)[^@]+(@)', '$1*****$2'
Write-Host "Base ciblee : $safeUrl"

# 3. Preparer le dossier et le nom du fichier
if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir | Out-Null
}
$timestamp = Get-Date -Format 'yyyy-MM-dd_HHmm'
$backupFile = Join-Path $backupDir "magiloc_backup_$timestamp.sql"

# 4. Lancer pg_dump (SQL complet : schema + donnees)
Write-Host "Sauvegarde en cours..."
& $pgDump --no-owner --no-privileges --format=plain --file=$backupFile $databaseUrl
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERREUR: pg_dump a echoue (code $LASTEXITCODE)." -ForegroundColor Red
    if (Test-Path $backupFile) { Remove-Item $backupFile -Force }
    exit 1
}

$size = [math]::Round((Get-Item $backupFile).Length / 1KB, 1)
Write-Host "OK : $backupFile ($size Ko)" -ForegroundColor Green

# 5. Rotation : garder les $keepCount plus recentes
$old = Get-ChildItem (Join-Path $backupDir 'magiloc_backup_*.sql') |
    Sort-Object LastWriteTime -Descending |
    Select-Object -Skip $keepCount
foreach ($f in $old) {
    Remove-Item $f.FullName -Force
    Write-Host "Rotation : suppression de $($f.Name)"
}

$total = (Get-ChildItem (Join-Path $backupDir 'magiloc_backup_*.sql')).Count
Write-Host "$total sauvegarde(s) disponible(s) dans backups\" -ForegroundColor Cyan
