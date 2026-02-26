@echo off
title MTOP Live Development Server
color 1F

echo =====================================================
echo    STARTING GERONA MTOP (LIVE DEV MODE)...
echo    Do not close this window while coding/running.
echo =====================================================
echo.

php\php.exe artisan optimize:clear

call npm run watch

pause
