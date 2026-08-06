<?php
//GeronaMTOP\app\Console\Commands\BackupDatabase.php
namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use App\Models\MtopApplication;
use Rap2hpoutre\FastExcel\FastExcel;

class BackupDatabase extends Command
{
    protected $signature = 'backup:run';
    protected $description = 'Backup the full SQLite database and export MTOP records to CSV';

    public function handle()
    {
        $date = now()->format('Y-m-d_H-i-s');
        $sqliteFilename = "backup_{$date}.sqlite";
        $xlsxFilename = "backup_{$date}.xlsx";

        $sourcePath = database_path('database.sqlite');

        $backupFolder = env('BACKUP_DRIVE_PATH', storage_path('app/private/backups'));

        if (!File::exists($backupFolder)) {
            File::makeDirectory($backupFolder, 0755, true);
        }

        $sqliteDestinationPath = "{$backupFolder}/{$sqliteFilename}";
        $xlsxDestinationPath = "{$backupFolder}/{$xlsxFilename}";

        try {

            if (!File::exists($sourcePath)) {
                $this->error("Database file not found at: {$sourcePath}");
                return 1;
            }

            File::copy($sourcePath, $sqliteDestinationPath);
            $this->info("Database backed up successfully: {$sqliteFilename}");

            $records = MtopApplication::all();

            if ($records->isNotEmpty()) {
                $generator = function () use ($records) {
                    foreach ($records as $row) {
                        yield $row;
                    }
                };

                (new FastExcel($generator()))->export($xlsxDestinationPath, function ($row) {
                    $paidBy = $row->show_paid_by
                        ? trim("{$row->paid_by_first_name} {$row->paid_by_last_name} {$row->paid_by_suffix}")
                        : 'N/A';

                    $driverName = 'N/A';
                    if ($row->has_driver) {
                        $dMiddle = $row->driver_middle_name ? substr($row->driver_middle_name, 0, 1) . '. ' : '';
                        $driverName = trim("{$row->driver_first_name} {$dMiddle}{$row->driver_last_name} {$row->driver_suffix}");
                    }

                    $exportBodyNum = preg_match('/^T\d{2}-\d+$/', (string)$row->body_number) ? '' : $row->body_number;

                    return [
                        'Control No' => (string) $row->mt_number,
                        'Transaction Date' => $row->transaction_date,
                        'Transaction Type' => $row->transaction_type,
                        'Last Name' => $row->last_name,
                        'First Name' => $row->first_name,
                        'Middle Name' => $row->middle_name,
                        'Suffix' => $row->suffix,
                        'Paid By Details' => $paidBy,
                        'Driver Name' => $driverName,
                        'Address' => $row->address,
                        'Contact #' => (string) $row->contact_number,
                        'Body Number' => (string) $exportBodyNum,
                        'Plate No' => $row->plate_no,
                        'Make/Type' => $row->make_type,
                        'Engine No' => (string) $row->engine_motor_no,
                        'Chassis No' => (string) $row->chassis_no,
                        'OR No' => (string) $row->or_number,
                        'OR Date' => $row->or_date,
                        'Cedula No' => (string) $row->cedula_number,
                        'Cedula Date' => $row->cedula_date,
                        'Punong Bayan' => $row->punong_bayan,
                        'Authorized Official' => $row->authorized_official,
                        'Is Free/Promo' => $row->is_free ? 'YES' : 'NO',
                        'Valid Until' => $row->valid_until,
                        'Status' => $row->status
                    ];
                });

                $this->info("Excel backed up successfully: {$xlsxFilename}");
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
