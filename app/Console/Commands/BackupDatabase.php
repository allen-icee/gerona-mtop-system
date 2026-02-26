<?php
//GeronaMTOP\app\Console\Commands\BackupDatabase.php
namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use App\Models\MtopApplication;

class BackupDatabase extends Command
{
    protected $signature = 'backup:run';
    protected $description = 'Backup the full SQLite database and export MTOP records to CSV';

    public function handle()
    {
        $date = now()->format('Y-m-d_H-i-s');
        $sqliteFilename = "backup_{$date}.sqlite";
        $csvFilename = "backup_{$date}.csv";

        $sourcePath = database_path('database.sqlite');
        $backupFolder = storage_path('app/private/backups');

        if (!File::exists($backupFolder)) {
            File::makeDirectory($backupFolder, 0755, true);
        }

        $sqliteDestinationPath = "{$backupFolder}/{$sqliteFilename}";
        $csvDestinationPath = "{$backupFolder}/{$csvFilename}";

        try {

            if (!File::exists($sourcePath)) {
                $this->error("Database file not found at: {$sourcePath}");
                return 1;
            }

            File::copy($sourcePath, $sqliteDestinationPath);
            $this->info("Database backed up successfully: {$sqliteFilename}");

            $records = MtopApplication::all();

            if ($records->isNotEmpty()) {
                $csvContent = fopen('php://temp', 'r+');

                fputcsv($csvContent, [
                    'Control No',
                    'Transaction Date',
                    'Transaction Type',
                    'Last Name',
                    'First Name',
                    'Middle Name',
                    'Suffix',
                    'Address',
                    'Plate No',
                    'Make/Type',
                    'Status'
                ]);

                foreach ($records as $row) {
                    fputcsv($csvContent, [
                        $row->mt_number,
                        $row->transaction_date,
                        $row->transaction_type,
                        $row->last_name,
                        $row->first_name,
                        $row->middle_name,
                        $row->suffix,
                        $row->address,
                        $row->plate_no,
                        $row->make_type,
                        $row->status
                    ]);
                }

                rewind($csvContent);
                $csvData = stream_get_contents($csvContent);
                fclose($csvContent);

                File::put($csvDestinationPath, $csvData);
                $this->info("CSV backed up successfully: {$csvFilename}");
            }

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

        if (count($files) > 20) {
            usort($files, fn($a, $b) => filemtime($a) <=> filemtime($b));

            for ($i = 0; $i < count($files) - 14; $i++) {
                File::delete($files[$i]);
            }
        }
    }
}
