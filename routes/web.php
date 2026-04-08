<?php
// C:\GeronaMTOP\routes\web.php
use App\Http\Controllers\MtopApplicationController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\SignatoryController;
use App\Http\Controllers\HolidayController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\OrRecordController;
use App\Http\Controllers\FeeSettingController;
use App\Http\Controllers\PrintSettingController;
use App\Http\Middleware\IsAdmin;
use App\Models\MtopApplication;
use App\Models\User;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Artisan;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
    ]);
});

/*
|--------------------------------------------------------------------------
| Authenticated Routes
|--------------------------------------------------------------------------
*/

Route::get('/dashboard', function () {
    $serverIp = getHostByName(getHostName());

    return Inertia::render('Dashboard', [
        'totalMtop' => MtopApplication::count(),
        'totalUsers' => User::count(),
        'newToday' => MtopApplication::whereDate('created_at', today())->count(),
        'serverIp' => $serverIp,
    ]);
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {

    // ==========================================
    // MTOP Applications
    // ==========================================
    Route::get('/mtop', [MtopApplicationController::class, 'index'])->name('mtop.index');
    Route::get('/mtop/create', [MtopApplicationController::class, 'create'])->name('mtop.create');
    Route::post('/mtop', [MtopApplicationController::class, 'store'])->name('mtop.store');

    // MTOP Specific Actions
    Route::get('/mtop/{id}/edit', [MtopApplicationController::class, 'edit'])->name('mtop.edit');
    Route::put('/mtop/{id}', [MtopApplicationController::class, 'update'])->name('mtop.update');
    Route::put('/mtop/{id}/cancel', [MtopApplicationController::class, 'cancel'])->name('mtop.cancel');

    // MTOP Renewals & Transfers
    Route::get('/mtop/{id}/renew', [MtopApplicationController::class, 'renew'])->name('mtop.renew');
    Route::post('/mtop/{id}/renew', [MtopApplicationController::class, 'storeRenewal'])->name('mtop.store_renewal');
    Route::get('/mtop/{id}/transfer', [MtopApplicationController::class, 'transfer'])->name('mtop.transfer');
    Route::post('/mtop/{id}/transfer', [MtopApplicationController::class, 'storeTransfer'])->name('mtop.store_transfer');

    // MTOP Printing & Exports
    Route::get('/mtop/print-ids', [MtopApplicationController::class, 'printIds'])->name('mtop.print_ids');
    Route::get('/mtop/{id}/print', [MtopApplicationController::class, 'print'])->name('mtop.print');
    Route::get('/mtop/{id}/print-drop', [MtopApplicationController::class, 'printDrop'])->name('mtop.print_drop');
    Route::get('/mtop/export', [MtopApplicationController::class, 'export'])->name('mtop.export');
    Route::post('/mtop/import', [MtopApplicationController::class, 'importData'])->name('mtop.import');

    // MTOP Driver Info
    Route::post('/mtop/update-driver-info', [MtopApplicationController::class, 'updateDriverInfo'])->name('mtop.update_driver');

    // ==========================================
    // OR Records
    // ==========================================
    Route::get('/or-records', [OrRecordController::class, 'index'])->name('or_records.index');
    Route::post('/or-records', [OrRecordController::class, 'store'])->name('or_records.store');
    Route::put('/or-records/{id}', [OrRecordController::class, 'update'])->name('or_records.update');
    Route::get('/or-records/{id}/print', [OrRecordController::class, 'print'])->name('or_records.print');
    Route::post('/or-records/import', [OrRecordController::class, 'import'])->name('or_records.import');
    Route::get('/or-records/export', [OrRecordController::class, 'export'])->name('or_records.export');

    // ==========================================
    // General Settings (Fees, Print, Holidays)
    // ==========================================
    Route::post('/settings/fees', [FeeSettingController::class, 'update'])->name('settings.fees.update');

    Route::get('/settings/print', [PrintSettingController::class, 'edit'])->name('settings.print.edit');
    Route::post('/settings/print', [PrintSettingController::class, 'update'])->name('settings.print.update');

    Route::post('/settings/holidays', [HolidayController::class, 'store'])->name('holidays.store');
    Route::put('/settings/holidays/{holiday}', [HolidayController::class, 'update'])->name('holidays.update');
    Route::delete('/settings/holidays/{holiday}', [HolidayController::class, 'destroy'])->name('holidays.destroy');

    // ==========================================
    // System & Audit Logs
    // ==========================================
    Route::get('/system/audit-logs/export', [UserController::class, 'exportAuditLogs'])->name('audit-logs.export');
    Route::delete('/system/audit-logs/flush', [UserController::class, 'flushAuditLogs'])->name('audit-logs.flush');

    // ==========================================
    // Backup & Export Data
    // ==========================================
    Route::post('/settings/backup', function () {
        try {
            Artisan::call('backup:run');
        } catch (\Exception $e) {
            // Silently handle backup command failure
        }

        $records = MtopApplication::latest()->cursor();
        $csvFileName = 'FULL_BACKUP_MTOP_' . date('Y-m-d_H-i') . '.csv';

        $headers = [
            "Content-type" => "text/csv",
            "Content-Disposition" => "attachment; filename=$csvFileName",
            "Pragma" => "no-cache",
            "Cache-Control" => "must-revalidate, post-check=0, pre-check=0",
            "Expires" => "0"
        ];

        $callback = function () use ($records) {
            $file = fopen('php://output', 'w');

            // EXACT same headers as MtopApplicationController export
            fputcsv($file, [
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

                fputcsv($file, [
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
                    $row->body_number,
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
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    })->name('settings.backup');

    /*
    |--------------------------------------------------------------------------
    | Administrator Only Routes
    |--------------------------------------------------------------------------
    */
    Route::middleware(IsAdmin::class)->group(function () {

        // Admin: Record Deletion
        Route::delete('/mtop/{id}', [MtopApplicationController::class, 'destroy'])->name('mtop.destroy');
        Route::delete('/or-records/{id}', [OrRecordController::class, 'destroy'])->name('or_records.destroy');

        // Admin: User Management
        Route::resource('users', UserController::class);

        // Admin: Signatories Management
        Route::post('/signatories/import', [SignatoryController::class, 'import'])->name('signatories.import');
        Route::get('/signatories/export', [SignatoryController::class, 'export'])->name('signatories.export');
        Route::resource('signatories', SignatoryController::class)->only(['index', 'store', 'update', 'destroy']);

        // Admin: Event Settings
        Route::get('/settings/events', [EventController::class, 'index'])->name('events.index');
        Route::post('/settings/events', [EventController::class, 'store'])->name('events.store');
        Route::put('/settings/events/{event}', [EventController::class, 'update'])->name('events.update');
        Route::delete('/settings/events/{event}', [EventController::class, 'destroy'])->name('events.destroy');
    });
});

require __DIR__ . '/auth.php';
