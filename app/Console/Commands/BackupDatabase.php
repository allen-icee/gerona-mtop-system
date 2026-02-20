<?php
//GeronaMTOP\app\Console\Commands\BackupDatabase.php
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
        $date = now()->format('Y-m-d_H-i-s');
        $filename = "backup_{$date}.sqlite";

        $sourcePath = database_path('database.sqlite');

        $backupFolder = storage_path('app/private/backups');

        if (!File::exists($backupFolder)) {
            File::makeDirectory($backupFolder, 0755, true);
        }

        $destinationPath = "{$backupFolder}/{$filename}";

        try {
            if (!File::exists($sourcePath)) {
                $this->error("Database file not found at: {$sourcePath}");
                return 1;
            }

            File::copy($sourcePath, $destinationPath);

            $this->info("Database backed up successfully: {$filename}");

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

        if (count($files) > 10) {

            usort($files, function ($a, $b) {
                return filemtime($a) - filemtime($b);
            });

            File::delete($files[0]);
        }
    }
}
