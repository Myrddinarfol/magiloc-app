# Script pour créer un raccourci sur le bureau

$DesktopPath = [Environment]::GetFolderPath("Desktop")
$ShortcutPath = "$DesktopPath\MagiApps.lnk"
$TargetPath = "$PSScriptRoot\run-magiloc.bat"

# Créer l'objet shell
$Shell = New-Object -ComObject WScript.Shell
$Shortcut = $Shell.CreateShortcut($ShortcutPath)

# Configurer le raccourci
$Shortcut.TargetPath = $TargetPath
$Shortcut.WorkingDirectory = $PSScriptRoot
$Shortcut.Description = "Lance MagiApps en mode développement local (Frontend + Backend)"
$Shortcut.WindowStyle = 1  # Mode normal

# Définir l'icône personnalisée MagiApps
$Shortcut.IconLocation = "$PSScriptRoot\magiapps-icon.ico"

# Sauvegarder le raccourci
$Shortcut.Save()

Write-Host "✅ Raccourci créé sur le bureau: $ShortcutPath" -ForegroundColor Green
Write-Host ""
Write-Host "Vous pouvez maintenant double-cliquer sur 'MagiLoc' sur le bureau pour lancer l'application!" -ForegroundColor Cyan
