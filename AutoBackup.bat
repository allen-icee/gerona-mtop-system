@echo off
cd /d "%~dp0"
php\php.exe artisan backup:run
