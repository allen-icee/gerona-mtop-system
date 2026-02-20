@echo off
title Gerona MTOP System Initial Setup
color 1f

echo =====================================================
echo    INITIALIZING GERONA MTOP SYSTEM...
echo    PLEASE DO NOT CLOSE THIS WINDOW.
echo =====================================================
echo.

:: Define Portable PHP Path (Ignores system PHP)
set PHP_PATH="%~dp0php\php.exe"

:: 1. Create Storage Link (Crucial for displaying photos)
echo Creating storage link...
call %PHP_PATH% artisan storage:link

:: 2. Run Database Migrations (Creates tables)
echo Setting up the database tables...
call %PHP_PATH% artisan migrate --force

:: 3. Run Database Seeders (Creates your Admin account & settings)
echo Creating admin account and default settings...
call %PHP_PATH% artisan db:seed --force

echo.
echo =====================================================
echo Setup Complete! You can now close this window and
echo open the Gerona MTOP System from your Desktop shortcut.
echo =====================================================
pause
