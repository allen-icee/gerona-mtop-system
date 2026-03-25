<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\MtopApplication;
use App\Models\MtopFranchise;
use App\Models\SyncQueue;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class AutoDropPermits extends Command
{
    protected $signature = 'mtop:auto-drop';

    protected $description = 'Automatically drops MTOP permits that have been expired for 6 months and queues them for sync.';

    public function handle()
    {
        $this->info('Checking for permits expired for 6+ months...');

        $sixMonthsAgo = Carbon::today()->subMonths(6);

        // Find applications that are currently active or expired, but their validity is 6 months past
        $appsToDrop = MtopApplication::whereIn('status', ['active', 'expired'])
            ->whereNotNull('valid_until')
            ->whereDate('valid_until', '<=', $sixMonthsAgo)
            ->get();

        $count = 0;

        DB::transaction(function () use ($appsToDrop, &$count) {
            foreach ($appsToDrop as $app) {

                // 1. Update the Application to 'cancelled' (dropped)
                $app->update([
                    'status' => 'cancelled',
                    'drop_date' => Carbon::today()->format('Y-m-d'),
                    'drop_or_number' => 'SYSTEM-AUTO',
                    'drop_or_date' => Carbon::today()->format('Y-m-d'),
                    'drop_amount' => 0,
                    'drop_official' => 'SYSTEM AUTOMATION',
                    'drop_position' => 'SYSTEM',
                ]);

                SyncQueue::create([
                    'table_name' => 'mtop_applications',
                    'payload_json' => $app->fresh()->toArray(),
                    'status' => 'pending'
                ]);

                // 2. Also drop/cancel the attached Franchise record
                if ($app->franchise_id) {
                    $franchise = MtopFranchise::find($app->franchise_id);

                    if ($franchise && in_array($franchise->status, ['active', 'upcoming'])) {
                        $franchise->update([
                            'status' => 'cancelled',
                        ]);

                        SyncQueue::create([
                            'table_name' => 'mtop_franchises',
                            'payload_json' => $franchise->fresh()->toArray(),
                            'status' => 'pending'
                        ]);
                    }
                }

                $count++;
            }
        });

        $this->info("Successfully auto-dropped {$count} permits.");
    }
}
