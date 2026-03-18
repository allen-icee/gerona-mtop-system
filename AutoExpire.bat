@echo off
cd /d "%~dp0"
php\php.exe artisan mtop:expire-permits
