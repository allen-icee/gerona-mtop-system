@echo off
title Gerona MTOP System
color 1f

echo =====================================================
echo    STARTING GERONA MTOP SYSTEM...
echo    PLEASE DO NOT CLOSE THIS WINDOW.
echo =====================================================
echo.

:: 1. Start the Local Server (Hidden in background)
start /b php artisan serve --host=0.0.0.0 --port=8100

:: 2. Wait 2 seconds for server to wake up
timeout /t 2 /nobreak >nul

:: 3. Open the Default Browser
start http://127.0.0.1:8100

:: 4. Keep window open so you can see if it's running
echo System is running at http://127.0.0.1:8100
echo Close this window to stop the system.
pause
