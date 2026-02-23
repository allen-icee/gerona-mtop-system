<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ImportOldSqliteData extends Command
{
    protected $signature = 'mtop:import-backup';
    protected $description = 'Import MTOP records from a legacy SQLite backup into the live database';

    public function handle()
    {
        $this->info('Starting import from backup.sqlite...');

        // 1. Ensure the backup file actually exists
        if (!file_exists(storage_path('app/backup.sqlite'))) {
            $this->error('Backup file not found at storage/app/backup.sqlite!');
            return;
        }

        // 2. Fetch all old records
        $oldFranchises = DB::connection('sqlite_backup')->table('mtop_franchises')->get();
        $oldApplications = DB::connection('sqlite_backup')->table('mtop_applications')->get();

        $this->info("Found {$oldFranchises->count()} franchises and {$oldApplications->count()} applications.");

        DB::transaction(function () use ($oldFranchises, $oldApplications) {
            // 3. Import Franchises safely
            foreach ($oldFranchises as $franchise) {
                // Check if it already exists to avoid duplication
                $exists = DB::table('mtop_franchises')->where('mt_number', $franchise->mt_number)->exists();

                if (!$exists) {
                    DB::table('mtop_franchises')->insert((array) $franchise);
                }
            }

            // 4. Import Applications safely
            foreach ($oldApplications as $app) {
                $exists = DB::table('mtop_applications')->where('id', $app->id)->exists();

                if (!$exists) {
                    DB::table('mtop_applications')->insert((array) $app);
                }
            }
        });

        $this->info('Import completed successfully!');
    }
}
