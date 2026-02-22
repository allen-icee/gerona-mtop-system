@echo off
title Gerona MTOP System
color 1f

echo =====================================================
echo    STARTING GERONA MTOP SYSTEM...
echo    PLEASE DO NOT CLOSE THIS WINDOW.
echo =====================================================
echo.

set PHP_PATH=%~dp0php\php.exe

call node scripts/update-ip.js

start /b %PHP_PATH% artisan serve --host=0.0.0.0 --port=8100

timeout /t 3 /nobreak >nul

start http://192.168.100.7:8000

echo System is running!
echo -----------------------------------------------------
echo HOST COMPUTER can access at: http://127.0.0.1:8100
echo -----------------------------------------------------
echo.
echo Close this window to stop the system.
pause
