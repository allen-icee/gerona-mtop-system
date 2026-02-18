<?php

namespace App\Providers;

use Native\Laravel\Facades\Window;
use Native\Laravel\Contracts\ProvidesPhpIni;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schema;

class NativeAppServiceProvider implements ProvidesPhpIni
{
    /**
     * Executed once the native application has been booted.
     * Use this method to open windows, register global shortcuts, etc.
     */
    public function boot(): void
    {
        // 1. Automated Database Setup
        // This checks if the users table exists; if not, it runs migrations.
        // This is essential for the .exe to work on other PCs without manual setup.
        try {
            if (!Schema::hasTable('users')) {
                Artisan::call('migrate', ['--force' => true]);
            }
        } catch (\Exception $e) {
            // Log or handle migration errors silently during boot
        }

        // 2. Open the main window
        Window::open()
            ->url('https://google.com')
            ->width(800)
            ->height(600);
    }

    /**
     * Return a list of php.ini directives to be set.
     * This ensures the bundled PHP runtime has enough resources.
     */
    public function phpIni(): array
    {
        return [
            'memory_limit' => '512M',
            'display_errors' => 'Off',
            'error_reporting' => 'E_ALL & ~E_DEPRECATED & ~E_STRICT',
            // Force these two to be active in the bundled PHP
            'extension' => ['mbstring', 'openssl', 'pdo_sqlite'],
        ];
    }
}
