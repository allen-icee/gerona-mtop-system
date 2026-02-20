@echo off
title Gerona MTOP System Setup
color 1f

echo =====================================================
echo    INITIALIZING GERONA MTOP SYSTEM SETUP...
echo    PLEASE DO NOT CLOSE THIS WINDOW.
echo =====================================================
echo.

:: Define Portable PHP Path
set PHP_PATH=%~dp0php\php.exe

:: 1. Create Storage Link (Crucial for displaying photos)
echo Creating storage link...
call %PHP_PATH% artisan storage:link

:: 2. Run Database Migrations and Seeders
echo Setting up the database...
call %PHP_PATH% artisan migrate --force
call %PHP_PATH% artisan db:seed --force

:: 3. Run the IP Automator
echo Configuring network settings...
call node scripts/update-ip.js

:: 4. Start the Local Server
start /b %PHP_PATH% artisan serve --host=0.0.0.0 --port=8100

:: 5. Wait for server to wake up
timeout /t 5 /nobreak >nul

:: 6. Open Browser
start http://127.0.0.1:8100

echo.
echo =====================================================
echo System is now ready!
echo -----------------------------------------------------
echo HOST COMPUTER can access at: http://127.0.0.1:8100
echo -----------------------------------------------------
echo.
echo Close this window to stop the system.
pause
