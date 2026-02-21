<?php
//GeronaMTOP\routes\console.php
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote')->hourly();

Schedule::command('mtop:expire-permits')->dailyAt('00:01');
//Schedule::command('sync:run')->everyMinute()->withoutOverlapping();
Schedule::command('db:check-health')->everyTenMinutes()->withoutOverlapping();
