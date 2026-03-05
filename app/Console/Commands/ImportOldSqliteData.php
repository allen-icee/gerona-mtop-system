<?php
//GeronaMTOP\app\Console\Commands\ImportOldSqliteData.php
namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Config;

class ImportOldSqliteData extends Command
{
    protected $signature = 'mtop:import-backup';
    protected $description = 'Import MTOP records from a legacy SQLite backup into the live database';

    public function handle()
    {
        $backupPath = storage_path('app/backup.sqlite');
        $this->info('Starting import from ' . $backupPath);

        if (!file_exists($backupPath)) {
            $this->error('Backup file not found!');
            $this->line('Please make sure your old database is placed exactly at: storage/app/backup.sqlite');
            return;
        }

        // DYNAMIC CONNECTION: This prevents the "Connection not configured" error
        Config::set('database.connections.sqlite_backup', [
            'driver' => 'sqlite',
            'database' => $backupPath,
            'prefix' => '',
            'foreign_key_constraints' => false,
        ]);

        DB::purge('sqlite_backup');

        try {
            $oldFranchises = DB::connection('sqlite_backup')->table('mtop_franchises')->get();
            $oldApplications = DB::connection('sqlite_backup')->table('mtop_applications')->get();
        } catch (\Exception $e) {
            $this->error("Failed to read from backup database: " . $e->getMessage());
            return;
        }

        $this->info("Found {$oldFranchises->count()} franchises and {$oldApplications->count()} applications.");

        DB::transaction(function () use ($oldFranchises, $oldApplications) {

            $franchiseCount = 0;
            foreach ($oldFranchises as $franchise) {
                $exists = DB::table('mtop_franchises')->where('mt_number', $franchise->mt_number)->exists();

                if (!$exists) {
                    DB::table('mtop_franchises')->insert((array) $franchise);
                    $franchiseCount++;
                }
            }
            $this->info("Imported $franchiseCount new franchises.");

            $appCount = 0;
            foreach ($oldApplications as $app) {
                $exists = DB::table('mtop_applications')->where('id', $app->id)->exists();

                if (!$exists) {
                    $data = (array) $app;

                    // Fallback for new columns in case the old DB doesn't have them
                    if (!array_key_exists('is_manual_validity', $data)) $data['is_manual_validity'] = 0;
                    if (!array_key_exists('is_free', $data)) $data['is_free'] = 0;
                    if (!array_key_exists('show_paid_by', $data)) $data['show_paid_by'] = 0;

                    DB::table('mtop_applications')->insert($data);
                    $appCount++;
                }
            }
            $this->info("Imported $appCount new applications.");
        });

        $this->info('Import completed successfully!');
    }
}
