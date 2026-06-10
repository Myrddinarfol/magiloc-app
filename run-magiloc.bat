@echo off
REM Script pour lancer MagiLoc localement

setlocal enabledelayedexpansion

REM Vérifier si Node.js est installé
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js n'est pas installé ou n'est pas dans le PATH
    echo Veuillez installer Node.js depuis https://nodejs.org/
    pause
    exit /b 1
)

echo.
echo ========================================
echo 🚀 MagiLoc - Démarrage local
echo ========================================
echo.
echo Node.js version:
node --version
echo.

REM Aller au répertoire du projet
cd /d "%~dp0"

REM Lancer le script de démarrage
echo Lancement du Frontend et Backend...
echo.
echo 💡 Le Frontend ouvrira à: http://localhost:3000
echo 💡 Le Backend est à: http://localhost:5000
echo.
echo Appuyez sur Ctrl+C pour arrêter l'application
echo.

call npm run dev:all
if errorlevel 1 (
    echo.
    echo ❌ Erreur lors du lancement de l'application
    echo Vérifiez les ports 3000 et 5000 ne sont pas déjà utilisés
    echo.
)

pause
