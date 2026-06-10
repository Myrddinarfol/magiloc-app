@echo off
REM Script pour nettoyer les ports 5000 et 3000

setlocal enabledelayedexpansion

echo.
echo ========================================
echo 🧹 Nettoyage des ports 5000 et 3000
echo ========================================
echo.

REM Chercher et tuer le processus sur le port 5000
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000') do (
    echo 🔴 Port 5000 occupé - Arrêt du processus (PID: %%a)
    taskkill /PID %%a /F >nul 2>&1
    if !errorlevel! equ 0 (
        echo ✅ Port 5000 libéré
    ) else (
        echo ⚠️  Impossible d'arrêter le processus (peut nécessiter Admin)
    )
)

REM Chercher et tuer le processus sur le port 3000
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    echo 🔴 Port 3000 occupé - Arrêt du processus (PID: %%a)
    taskkill /PID %%a /F >nul 2>&1
    if !errorlevel! equ 0 (
        echo ✅ Port 3000 libéré
    ) else (
        echo ⚠️  Impossible d'arrêter le processus (peut nécessiter Admin)
    )
)

echo.
echo ✅ Nettoyage terminé!
echo Vous pouvez maintenant relancer MagiLoc.
echo.

pause
