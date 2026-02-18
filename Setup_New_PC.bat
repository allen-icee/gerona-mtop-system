@echo off
title Gerona MTOP System
color 1f

echo =====================================================
echo    STARTING GERONA MTOP SYSTEM...
echo    PLEASE DO NOT CLOSE THIS WINDOW.
echo =====================================================
echo.

:: 1. Run the IP Automator (Configures IP automatically)
call node scripts/update-ip.js

:: 2. Start the Local Server
:: host=0.0.0.0 allows others to connect
start /b php artisan serve --host=0.0.0.0 --port=8100

:: 3. Wait for server to wake up
timeout /t 3 /nobreak >nul

:: 4. Open Browser (The node script updated this IP automatically!)
start http://192.168.10.185:8100

:: 5. Instructions
echo System is running!
echo -----------------------------------------------------
echo HOST COMPUTER can access at: http://127.0.0.1:8100
echo OTHER STAFF should use:      http://192.168.10.105:8100
echo -----------------------------------------------------
echo.
echo Close this window to stop the system.
pause
