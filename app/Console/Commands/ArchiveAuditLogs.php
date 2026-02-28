<?php
//GeronaMTOP\app\Console\Commands\ArchiveAuditLogs.php
namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\AuditLog;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class ArchiveAuditLogs extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'audit:archive';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Exports audit logs older than 7 days to a CSV and deletes them from the active database.';

    public function handle()
    {
        $cutoffDate = now()->subDays(7);
        $logs = AuditLog::with('user')->where('created_at', '<=', $cutoffDate)->get();

        if ($logs->isEmpty()) {
            $this->info('No old audit logs to archive at this time.');
            return;
        }

        if (!Storage::exists('private/audit_archives')) {
            Storage::makeDirectory('private/audit_archives');
        }

        $filename = 'private/audit_archives/Audit_Archive_' . now()->format('Y_m_d') . '.csv';
        $path = storage_path('app/' . $filename);

        $file = fopen($path, 'w');

        fputcsv($file, ['ID', 'Date/Time', 'User', 'Action', 'Payload', 'IP Address']);

        foreach ($logs as $log) {
            fputcsv($file, [
                $log->id,
                $log->created_at->toDateTimeString(),
                $log->user ? $log->user->name : 'System/Deleted User',
                $log->action,
                $log->payload,
                $log->ip_address
            ]);
        }

        fclose($file);

        AuditLog::where('created_at', '<=', $cutoffDate)->delete();

        $message = "Successfully archived and flushed {$logs->count()} old audit logs to {$filename}.";
        $this->info($message);
        Log::info($message);
    }
}
