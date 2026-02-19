<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule; // <-- ADD THIS IMPORT

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote')->hourly();

// --- NIGHTLY AUTOMATION ---
// Run our custom expiration script every night at 12:01 AM
Schedule::command('mtop:expire-permits')->dailyAt('00:01');
