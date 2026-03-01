@echo off
title MTOP Live Server
color 1F

echo =====================================================
echo    STARTING GERONA MTOP SYSTEM...
echo    Do not close this window while running.
echo    Have patience with the white blank screen.
echo =====================================================
echo.

php\php.exe artisan optimize:clear

call npm run watch

pause
