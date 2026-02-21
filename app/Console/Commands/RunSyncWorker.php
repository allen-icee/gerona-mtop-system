<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\SyncQueue;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class RunSyncWorker extends Command
{
    // The command that will run in the background
    protected $signature = 'sync:run';
    protected $description = 'Runs the background sync queue worker to push local LGU data to the cloud.';

    public function handle()
    {
        $maxRetries = 5;
        // You will define these in your .env file
        $cloudEndpoint = env('CLOUD_SYNC_ENDPOINT', 'https://your-cloud-api.com/api/sync');
        $cloudToken = env('CLOUD_SYNC_TOKEN', 'your-secure-lgu-token');

        // Fetch jobs that are pending or failed (but under max retries)
        $pendingJobs = SyncQueue::whereIn('status', ['pending', 'failed'])
            ->where('retry_count', '<', $maxRetries)
            ->take(20) // Process in chunks to prevent memory overload
            ->get();

        if ($pendingJobs->isEmpty()) {
            return Command::SUCCESS;
        }

        foreach ($pendingJobs as $job) {
            // Lock the record so it doesn't get synced twice
            $job->update(['status' => 'syncing']);

            try {
                // Send the data to your cloud endpoint safely
                $response = Http::withToken($cloudToken)
                    ->timeout(10) // 10 seconds timeout, prevents hanging if LGU net is slow
                    ->post($cloudEndpoint, [
                        'table_name' => $job->table_name,
                        'data'       => $job->payload_json
                    ]);

                if ($response->successful()) {
                    $job->update(['status' => 'completed', 'error_message' => null]);
                    $this->info("Successfully synced job ID: {$job->id}");
                } else {
                    $this->failJob($job, "HTTP Error: " . $response->status());
                }
            } catch (\Exception $e) {
                // Catches network drops, DNS errors, timeout, etc.
                $this->failJob($job, "Network Exception: " . $e->getMessage());
            }
        }

        return Command::SUCCESS;
    }

    private function failJob(SyncQueue $job, string $errorMessage)
    {
        $job->increment('retry_count');
        $job->update([
            'status' => 'failed',
            'error_message' => $errorMessage
        ]);

        Log::error("LGU Cloud Sync Failed for Job ID {$job->id}: {$errorMessage}");
        $this->error("Failed to sync job ID: {$job->id}");
    }
}
