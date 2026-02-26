@echo off
title MTOP Dev Environment Setup
color 0A

echo =====================================================
echo    INITIALIZING GERONA MTOP DEVELOPMENT ENVIRONMENT
echo    Please wait. This will download all packages...
echo =====================================================
echo.

:: 1. Copy the .env file if it doesn't exist
if not exist ".env" (
    echo Creating .env file...
    copy .env.example .env
)

:: 2. Install Composer (PHP) Dependencies using local PHP
echo.
echo Installing PHP Dependencies...
php\php.exe composer.phar install

:: 3. Generate Application Key
echo.
echo Generating Application Key...
php\php.exe artisan key:generate

:: 4. Install Node (JavaScript/React) Dependencies
echo.
echo Installing Node Modules...
call npm install

:: 5. Create Database and Run Migrations/Seeder
echo.
echo Setting up Database and linking Storage...
if not exist "database\database.sqlite" type NUL > database\database.sqlite
php\php.exe artisan migrate:fresh --seed
php\php.exe artisan storage:link

echo.
echo =====================================================
echo    SETUP COMPLETE!
echo    You can now run Start_MTOP_System.bat
echo =====================================================
pause
