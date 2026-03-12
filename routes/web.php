<?php
//GeronaMTOP\routes\web.php
use App\Http\Controllers\MtopApplicationController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\SignatoryController;
use App\Http\Controllers\HolidayController;
use App\Http\Controllers\EventController;
use App\Http\Middleware\IsAdmin;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Models\MtopApplication;
use App\Models\User;
use App\Http\Controllers\PrintSettingController;
use Illuminate\Support\Facades\Artisan;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
    ]);
});

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

    // Simplified Holiday Controller
    Route::post('/settings/holidays', [HolidayController::class, 'store'])->name('holidays.store');
    Route::delete('/settings/holidays/{holiday}', [HolidayController::class, 'destroy'])->name('holidays.destroy');
    Route::put('/settings/holidays/{holiday}', [HolidayController::class, 'update'])->name('holidays.update');

    Route::get('/mtop', [MtopApplicationController::class, 'index'])->name('mtop.index');

    // --- OR RECORDS SECTION ---
    Route::get('/or-records', [\App\Http\Controllers\OrRecordController::class, 'index'])->name('or_records.index');
    Route::post('/or-records', [\App\Http\Controllers\OrRecordController::class, 'store'])->name('or_records.store');
    Route::put('/or-records/{id}', [\App\Http\Controllers\OrRecordController::class, 'update'])->name('or_records.update');
    Route::post('/settings/fees', [\App\Http\Controllers\FeeSettingController::class, 'update'])->name('settings.fees.update');
    Route::get('/or-records/export', [\App\Http\Controllers\OrRecordController::class, 'export'])->name('or_records.export');

    Route::get('/mtop/create', [MtopApplicationController::class, 'create'])->name('mtop.create');
    Route::post('/mtop', [MtopApplicationController::class, 'store'])->name('mtop.store');

    Route::post('/mtop/update-driver-info', [MtopApplicationController::class, 'updateDriverInfo'])->name('mtop.update_driver');
    Route::get('/mtop/print-ids', [MtopApplicationController::class, 'printIds'])->name('mtop.print_ids');

    Route::get('/mtop/{id}/renew', [MtopApplicationController::class, 'renew'])->name('mtop.renew');
    Route::post('/mtop/{id}/renew', [MtopApplicationController::class, 'storeRenewal'])->name('mtop.store_renewal');

    Route::get('/mtop/{id}/transfer', [MtopApplicationController::class, 'transfer'])->name('mtop.transfer');
    Route::post('/mtop/{id}/transfer', [MtopApplicationController::class, 'storeTransfer'])->name('mtop.store_transfer');

    Route::get('/mtop/{id}/edit', [MtopApplicationController::class, 'edit'])->name('mtop.edit');
    Route::put('/mtop/{id}', [MtopApplicationController::class, 'update'])->name('mtop.update');
    Route::put('/mtop/{id}/cancel', [MtopApplicationController::class, 'cancel'])->name('mtop.cancel');
    Route::get('/mtop/{id}/print', [MtopApplicationController::class, 'print'])->name('mtop.print');
    Route::get('/mtop/export', [MtopApplicationController::class, 'export'])->name('mtop.export');

    Route::get('/system/audit-logs/export', [UserController::class, 'exportAuditLogs'])->name('audit-logs.export');
    Route::delete('/system/audit-logs/flush', [UserController::class, 'flushAuditLogs'])->name('audit-logs.flush');
    Route::post('/mtop/import', [MtopApplicationController::class, 'importData'])->name('mtop.import');

    // 👇 THIS HAS BEEN MOVED OUTSIDE THE ADMIN SECTION
    Route::get('/or-records/{id}/print', [\App\Http\Controllers\OrRecordController::class, 'print'])->name('or_records.print');

    Route::post('/settings/backup', function () {

        try {
            Artisan::call('backup:run');
        } catch (\Exception $e) {
            // If server backup fails, we still try to give them the CSV hehe
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

            fputcsv($file, ['Control No', 'Transaction Date', 'Transaction Type', 'Last Name', 'First Name', 'Middle Name', 'Suffix', 'Address', 'Contact #', 'Body Number', 'Plate No', 'Make/Type', 'Engine No', 'Chassis No', 'OR No', 'OR Date', 'Cedula No', 'Cedula Date', 'Punong Bayan', 'Authorized Official', 'Valid Until', 'Status']);

            foreach ($records as $row) {
                fputcsv($file, [
                    $row->mt_number,
                    $row->transaction_date,
                    $row->transaction_type,
                    $row->last_name,
                    $row->first_name,
                    $row->middle_name,
                    $row->suffix,
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
                    $row->valid_until,
                    $row->status
                ]);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    })->name('settings.backup');

    Route::get('/settings/print', [PrintSettingController::class, 'edit'])->name('settings.print.edit');
    Route::post('/settings/print', [PrintSettingController::class, 'update'])->name('settings.print.update');

    // --- ADMIN ONLY ROUTES ---
    Route::middleware(IsAdmin::class)->group(function () {

        Route::delete('/mtop/{id}', [MtopApplicationController::class, 'destroy'])->name('mtop.destroy');

        // Only Admins can delete OR Records
        Route::delete('/or-records/{id}', [\App\Http\Controllers\OrRecordController::class, 'destroy'])->name('or_records.destroy');

        // (The Print OR Route is no longer here)

        Route::resource('users', UserController::class);

        Route::post('/signatories/import', [SignatoryController::class, 'import'])->name('signatories.import');
        Route::get('/signatories/export', [SignatoryController::class, 'export'])->name('signatories.export');
        Route::resource('signatories', SignatoryController::class)->only(['index', 'store', 'update', 'destroy']);

        Route::get('/settings/events', [EventController::class, 'index'])->name('events.index');
        Route::post('/settings/events', [EventController::class, 'store'])->name('events.store');
        Route::put('/settings/events/{event}', [EventController::class, 'update'])->name('events.update');
        Route::delete('/settings/events/{event}', [EventController::class, 'destroy'])->name('events.destroy');
    });
});

require __DIR__ . '/auth.php';
