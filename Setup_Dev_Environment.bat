@echo off
title MTOP Dev Environment Setup / Repair
color 0A

echo =====================================================
echo    INITIALIZING GERONA MTOP DEVELOPMENT ENVIRONMENT
echo    Please wait...
echo =====================================================
echo.

:: 1. Copy the .env file if it doesn't exist
if not exist ".env" (
    echo Creating .env file...
    copy .env.example .env
)

:: 2. CLEAR OLD PATH CACHES (CRITICAL WHEN MOVING PCs)
echo Clearing old PC path caches...
php\php.exe artisan optimize:clear

:: 3. Install Composer (PHP) Dependencies
echo.
echo Verifying PHP Dependencies...
php\php.exe composer.phar install

:: 4. Generate Application Key (if missing)
echo.
echo Verifying Application Key...
php\php.exe artisan key:generate

:: 5. Install Node Modules
echo.
echo Installing Node Modules...
call npm install

:: 6. Fix Broken Storage Link
echo.
echo Re-linking storage for Images/IDs...
if exist "public\storage" rmdir /q "public\storage"
php\php.exe artisan storage:link

:: 7. Create Database if missing
echo.
echo Verifying Database...
if not exist "database\database.sqlite" type NUL > database\database.sqlite
php\php.exe artisan migrate --force

echo.
echo =====================================================
echo    DEV SETUP COMPLETE!
echo    You can now run Start_MTOP_System.bat
echo =====================================================
pause
