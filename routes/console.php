<?php
//GeronaMTOP\routes\console.php
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote')->hourly();

// Mark them as "expired" the day after their valid_until date
Schedule::command('mtop:expire-permits')->dailyAt('00:01');

// Automatically "drop" them completely if they've been expired for 6 months
Schedule::command('mtop:auto-drop')->dailyAt('00:05');

//Schedule::command('sync:run')->everyMinute()->withoutOverlapping();
Schedule::command('db:check-health')->everyTenMinutes()->withoutOverlapping();

Schedule::command('audit:archive')->weeklyOn(5, '17:00')->withoutOverlapping();
Schedule::command('backup:run')->dailyAt('23:00')->withoutOverlapping();
