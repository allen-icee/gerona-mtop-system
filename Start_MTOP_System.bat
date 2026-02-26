@echo off
title MTOP Live Development Server
color 1f

echo =====================================================
echo    STARTING GERONA MTOP (LIVE DEV MODE)...
echo    Do not close this window while coding/running.
echo =====================================================
echo.

call npm run watch

pause
