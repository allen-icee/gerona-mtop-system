<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\File;

class CheckDatabaseIntegrity extends Command
{
    protected $signature = 'db:check-health';
    protected $description = 'Checks SQLite database integrity and triggers self-healing if corrupted due to LGU power failure.';

    public function handle()
    {
        if (DB::connection()->getDriverName() !== 'sqlite') {
            $this->warn("Integrity check bypassed: Not using SQLite.");
            return Command::SUCCESS;
        }

        try {
            $results = DB::select('PRAGMA integrity_check;');
            $status = $results[0]->integrity_check ?? 'error';

            if (strtolower($status) === 'ok') {
                $this->info("✅ System Health Normal: No database corruption detected.");
                return Command::SUCCESS;
            }

            $this->error("🚨 DATABASE CORRUPTION DETECTED: " . $status);
            Log::critical("LGU Power Failure / Corruption Detected!", ['status' => $status]);

            $this->triggerSelfHealing();
        } catch (\Exception $e) {
            $this->error("🚨 FATAL DATABASE ERROR: " . $e->getMessage());
            Log::critical("SQLite Fatal Integrity Exception!", ['error' => $e->getMessage()]);

            $this->triggerSelfHealing();
        }

        return Command::FAILURE;
    }

    private function triggerSelfHealing()
    {
        $this->warn("Initiating Database Self-Healing Protocol...");

        $dbPath = database_path('database.sqlite');

        $backupPath = storage_path('app/backups/latest_backup.sqlite');

        if (File::exists($backupPath)) {
            $corruptedName = 'corrupted_db_' . time() . '.sqlite';
            File::move($dbPath, database_path($corruptedName));

            File::copy($backupPath, $dbPath);

            $this->info("✅ Self-Healing Complete: Restored from latest backup.");
            Log::info("Self-healing successful. Corrupted DB renamed to {$corruptedName}.");
        } else {
            $this->error("❌ Self-Healing Failed: No backup found at {$backupPath}!");
            Log::alert("CRITICAL: Database corrupted and NO BACKUP FOUND to restore from.");
        }
    }
}
