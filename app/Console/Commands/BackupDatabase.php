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

        $backupFolder = env('BACKUP_DRIVE_PATH', storage_path('app/private/backups'));

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
                    'Paid By Details',
                    'Driver Name',
                    'Address',
                    'Contact #',
                    'Body Number',
                    'Plate No',
                    'Make/Type',
                    'Engine No',
                    'Chassis No',
                    'OR No',
                    'OR Date',
                    'Cedula No',
                    'Cedula Date',
                    'Punong Bayan',
                    'Authorized Official',
                    'Is Free/Promo',
                    'Valid Until',
                    'Status'
                ]);

                foreach ($records as $row) {
                    $paidBy = $row->show_paid_by
                        ? trim("{$row->paid_by_first_name} {$row->paid_by_last_name} {$row->paid_by_suffix}")
                        : 'N/A';

                    $driverName = 'N/A';
                    if ($row->has_driver) {
                        $dMiddle = $row->driver_middle_name ? substr($row->driver_middle_name, 0, 1) . '. ' : '';
                        $driverName = trim("{$row->driver_first_name} {$dMiddle}{$row->driver_last_name} {$row->driver_suffix}");
                    }

                    $exportBodyNum = preg_match('/^T\d{2}-\d+$/', (string)$row->body_number) ? '' : $row->body_number;

                    fputcsv($csvContent, [
                        $row->mt_number,
                        $row->transaction_date,
                        $row->transaction_type,
                        $row->last_name,
                        $row->first_name,
                        $row->middle_name,
                        $row->suffix,
                        $paidBy,
                        $driverName,
                        $row->address,
                        $row->contact_number,
                        $exportBodyNum,
                        $row->plate_no,
                        $row->make_type,
                        $row->engine_motor_no,
                        $row->chassis_no,
                        $row->or_number,
                        $row->or_date,
                        $row->cedula_number,
                        $row->cedula_date,
                        $row->punong_bayan,
                        $row->authorized_official,
                        $row->is_free ? 'YES' : 'NO',
                        $row->valid_until,
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
