@echo off
cd /d "%~dp0"

echo Running Daily Permit Expiration Check...
php\php.exe artisan mtop:expire-permits
echo.

echo Running 6-Month Auto-Drop Check...
php\php.exe artisan mtop:auto-drop
echo.

pause
