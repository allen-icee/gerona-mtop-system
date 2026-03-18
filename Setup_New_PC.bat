@echo off
title Gerona MTOP System Initial Setup
color 1f

cd /d "%~dp0"

echo =====================================================
echo    INITIALIZING GERONA MTOP MAIN SERVER...
echo    PLEASE DO NOT CLOSE THIS WINDOW AND BE PATIENT.
echo =====================================================
echo.

if not exist "php\php.exe" (
    echo [ERROR] Portable PHP engine is missing!
    echo Ensure the 'php' folder is present in the resources directory.
    echo.
    pause
    exit /b
)

echo Creating required system folders...
if not exist "storage\framework\views" mkdir "storage\framework\views"
if not exist "storage\framework\sessions" mkdir "storage\framework\sessions"
if not exist "storage\framework\cache\data" mkdir "storage\framework\cache\data"

echo.
echo Checking environment file...
if not exist ".env" (
    echo [INFO] .env file missing. Copying from .env.example...
    copy .env.example .env
)

echo.
echo Generating Application Security Key...
"php\php.exe" artisan key:generate

echo.
echo Clearing old development cache...
"php\php.exe" artisan optimize:clear

echo.
echo Creating storage link for Images/IDs...
"php\php.exe" artisan storage:link

echo.
echo Setting up the database tables...
"php\php.exe" artisan migrate --force

echo.
echo Creating admin account and default settings...
"php\php.exe" artisan db:seed --force

echo.
echo =====================================================
echo Setup Complete!
echo You can now close this window and open the
echo "Start_MTOP_System" script.
echo =====================================================
pause
