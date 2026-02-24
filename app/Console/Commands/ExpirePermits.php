<?php
//GeronaMTOP\app\Console\Commands\ExpirePermits.php
namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\MtopApplication;
use App\Models\SyncQueue;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ExpirePermits extends Command
{
    protected $signature = 'mtop:expire-permits';

    protected $description = 'Automatically checks and expires MTOP permits that have passed their valid_until date and queues them for sync.';

    public function handle()
    {
        $this->info('Checking for expired permits...');

        // 1. Fetch the records instead of bulk updating, so we can sync them
        $expiredApps = MtopApplication::where('status', 'active')
            ->whereNotNull('valid_until')
            ->whereDate('valid_until', '<', Carbon::today())
            ->get();

        $count = 0;

        DB::transaction(function () use ($expiredApps, &$count) {
            foreach ($expiredApps as $app) {
                // 2. Update the status
                $app->update(['status' => 'expired']);

                // 3. Add to SyncQueue so the other server knows it expired!
                SyncQueue::create([
                    'table_name' => 'mtop_applications',
                    'payload_json' => $app->fresh()->toArray(),
                    'status' => 'pending'
                ]);

                $count++;
            }
        });

        $this->info("Successfully expired and queued {$count} permits for syncing.");
    }
}
