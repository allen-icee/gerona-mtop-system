<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;

class BackupDatabase extends Command
{
    protected $signature = 'backup:run';
    protected $description = 'Backup the SQLite database file';

    public function handle()
    {
        // 1. Generate Filename with Timestamp
        $date = now()->format('Y-m-d_H-i-s');
        $filename = "backup_{$date}.sqlite";

        // 2. Define Paths
        $sourcePath = database_path('database.sqlite');

        // Use the 'private' folder as you noticed
        $backupFolder = storage_path('app/private/backups');

        // 3. Create Folder if missing
        if (!File::exists($backupFolder)) {
            File::makeDirectory($backupFolder, 0755, true);
        }

        $destinationPath = "{$backupFolder}/{$filename}";

        // 4. Copy the file
        try {
            if (!File::exists($sourcePath)) {
                $this->error("Database file not found at: {$sourcePath}");
                return 1;
            }

            File::copy($sourcePath, $destinationPath);

            $this->info("Database backed up successfully: {$filename}");

            // 5. Cleanup (Keep only last 10 backups)
            $this->cleanOldBackups($backupFolder);

            return 0;
        } catch (\Exception $e) {
            $this->error("Backup failed: " . $e->getMessage());
            return 1;
        }
    }

    private function cleanOldBackups($path)
    {
        $files = File::files($path);

        // If more than 10 files, delete the oldest
        if (count($files) > 10) {
            // Sort by modified time (Oldest first)
            usort($files, function ($a, $b) {
                return filemtime($a) - filemtime($b);
            });

            // Delete the oldest file
            File::delete($files[0]);
        }
    }
}
