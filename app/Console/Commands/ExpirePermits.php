<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\MtopApplication;
use Carbon\Carbon;

class ExpirePermits extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'mtop:expire-permits';

    /**
     * The console command description.
     */
    protected $description = 'Automatically checks and expires MTOP permits that have passed their valid_until date.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Checking for expired permits...');

        // Find all active records where the valid_until date is in the past
        $expiredCount = MtopApplication::where('status', 'active')
            ->whereNotNull('valid_until')
            ->whereDate('valid_until', '<', Carbon::today())
            ->update(['status' => 'expired']);

        $this->info("Successfully expired {$expiredCount} permits.");
    }
}
