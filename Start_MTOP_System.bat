@echo off
title Gerona MTOP System
color 1f

echo =====================================================
echo    STARTING GERONA MTOP SYSTEM...
echo    PLEASE DO NOT CLOSE THIS WINDOW.
echo =====================================================
echo.

:: 1. Start the Local Server (Hidden in background)
:: host=0.0.0.0 allows any computer in your network to connect
start /b php artisan serve --host=0.0.0.0 --port=8100

:: 2. Wait 2 seconds for server to wake up
timeout /t 2 /nobreak >nul

:: 3. Change this to your Server's specific IP address
:: This opens the browser automatically for the host staff member
start http://192.168.10.80:8100

:: 4. Provide instructions for other staff
echo System is running!
echo -----------------------------------------------------
echo HOST COMPUTER can access at: http://127.0.0.1:8100
echo OTHER STAFF should use:      http://192.168.10.185:8100
echo -----------------------------------------------------
echo.
echo Close this window to stop the system.
pause
