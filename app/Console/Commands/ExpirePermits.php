<?php
//GeronaMTOP\app\Console\Commands\ExpirePermits.php
namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\MtopApplication;
use Carbon\Carbon;

class ExpirePermits extends Command
{

    protected $signature = 'mtop:expire-permits';

    protected $description = 'Automatically checks and expires MTOP permits that have passed their valid_until date.';

    public function handle()
    {
        $this->info('Checking for expired permits...');

        $expiredCount = MtopApplication::where('status', 'active')
            ->whereNotNull('valid_until')
            ->whereDate('valid_until', '<', Carbon::today())
            ->update(['status' => 'expired']);

        $this->info("Successfully expired {$expiredCount} permits.");
    }
}
