@echo off
title Gerona MTOP System
color 1f

echo =====================================================
echo    STARTING GERONA MTOP SYSTEM...
echo    PLEASE DO NOT CLOSE THIS WINDOW.
echo =====================================================
echo.

:: Define Portable PHP Path
set PHP_PATH=%~dp0php\php.exe

:: 1. Run the IP Automator
call node scripts/update-ip.js

:: 2. Start the Local Server
start /b %PHP_PATH% artisan serve --host=0.0.0.0 --port=8100

:: 3. Wait for server to wake up
timeout /t 3 /nobreak >nul

:: 4. Open Browser
start http://127.0.0.1:8100

:: 5. Instructions
echo System is running!
echo -----------------------------------------------------
echo HOST COMPUTER can access at: http://127.0.0.1:8100
echo -----------------------------------------------------
echo.
echo Close this window to stop the system.
pause
