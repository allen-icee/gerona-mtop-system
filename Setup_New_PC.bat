@echo off
title Gerona MTOP System Initial Setup
color 1f

cd /d "%~dp0"

echo =====================================================
echo    INITIALIZING GERONA MTOP SYSTEM...
echo    PLEASE DO NOT CLOSE THIS WINDOW AND BE PATIENT.
echo =====================================================
echo.

if not exist "php\php.exe" (
    echo [ERROR] Portable PHP engine is missing!
    echo Ensure the 'php' folder was placed in the root before building.
    echo.
    pause
    exit /b
)

echo Creating required system folders...
if not exist "app\storage\framework\views" mkdir "app\storage\framework\views"
if not exist "app\storage\framework\sessions" mkdir "app\storage\framework\sessions"
if not exist "app\storage\framework\cache\data" mkdir "app\storage\framework\cache\data"

echo.
echo Clearing old development cache...
"php\php.exe" "app\artisan" optimize:clear

echo.
echo Creating storage link...
"php\php.exe" "app\artisan" storage:link

echo.
echo Setting up the database tables...
"php\php.exe" "app\artisan" migrate --force

echo.
echo Creating admin account and default settings...
"php\php.exe" "app\artisan" db:seed --force

echo.
echo =====================================================
echo Setup Complete! You can now close this window and
echo open the Gerona MTOP System from your Desktop shortcut.
echo =====================================================
pause
