@echo off
title Gerona MTOP System Initial Setup
color 1f

cd /d "%~dp0"

echo =====================================================
echo    INITIALIZING GERONA MTOP SYSTEM...
echo    PLEASE DO NOT CLOSE THIS WINDOW.
echo =====================================================
echo.

if not exist "php\php.exe" (
    echo [ERROR] Portable PHP engine is missing!
    echo Ensure the 'php' folder was placed in the root before building.
    echo.
    pause
    exit /b
)

echo Creating storage link...
"php\php.exe" artisan storage:link

echo.
echo Setting up the database tables...
"php\php.exe" artisan migrate --force

echo.
echo Creating admin account and default settings...
"php\php.exe" artisan db:seed --force

echo.
echo =====================================================
echo Setup Complete! You can now close this window and
echo open the Gerona MTOP System from your Desktop shortcut.
echo =====================================================
pause
