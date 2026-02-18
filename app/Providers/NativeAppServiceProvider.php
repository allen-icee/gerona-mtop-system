<?php

namespace App\Providers;

use Native\Laravel\Facades\Window;

class NativeAppServiceProvider
{
    /**
     * Executed once the native application has been booted.
     */
    public function boot(): void
    {
        // 1. Open the main window
        Window::open()
            ->width(1280)
            ->height(900)
            ->title('Gerona MTOP System')
            ->rememberState();
    }
}
