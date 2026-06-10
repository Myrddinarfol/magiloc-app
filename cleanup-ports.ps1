# Script pour libérer les ports 5000 et 3000

Write-Host "🔍 Recherche des processus sur les ports 5000 et 3000..." -ForegroundColor Cyan
Write-Host ""

$ports = @(5000, 3000)
$anyKilled = $false

foreach ($port in $ports) {
    $process = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue

    if ($process) {
        Write-Host "🔴 Port $port occupé:" -ForegroundColor Red

        $process | ForEach-Object {
            $proc = Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue
            $procName = if ($proc) { $proc.Name } else { "Unknown" }
            Write-Host "   - PID: $($_.OwningProcess) - $procName"
        }

        Write-Host "   ❌ Arrêt des processus..." -ForegroundColor Yellow
        $process | ForEach-Object {
            Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
        }
        Write-Host "   ✅ Port $port libéré!" -ForegroundColor Green
        $anyKilled = $true
    } else {
        Write-Host "🟢 Port $port libre" -ForegroundColor Green
    }
}

Write-Host ""
if ($anyKilled) {
    Write-Host "✅ Les ports problématiques ont été nettoyés!" -ForegroundColor Green
    Write-Host "Relancez MagiLoc maintenant." -ForegroundColor Cyan
} else {
    Write-Host "✅ Tous les ports sont libres!" -ForegroundColor Green
}

Write-Host ""
Write-Host "Appuyez sur une touche pour fermer..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
