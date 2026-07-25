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
use Rap2hpoutre\FastExcel\FastExcel;


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
    Route::get('/mtop', [MtopApplicationController::class, 'index'])->name('mtop.index');
    Route::get('/mtop/create', [MtopApplicationController::class, 'create'])->name('mtop.create');
    Route::post('/mtop', [MtopApplicationController::class, 'store'])->name('mtop.store');

    Route::get('/mtop/{id}/edit', [MtopApplicationController::class, 'edit'])->name('mtop.edit');
    Route::put('/mtop/{id}', [MtopApplicationController::class, 'update'])->name('mtop.update');
    Route::put('/mtop/{id}/cancel', [MtopApplicationController::class, 'cancel'])->name('mtop.cancel');

    Route::get('/mtop/{id}/renew', [MtopApplicationController::class, 'renew'])->name('mtop.renew');
    Route::post('/mtop/{id}/renew', [MtopApplicationController::class, 'storeRenewal'])->name('mtop.store_renewal');
    Route::get('/mtop/{id}/transfer', [MtopApplicationController::class, 'transfer'])->name('mtop.transfer');
    Route::post('/mtop/{id}/transfer', [MtopApplicationController::class, 'storeTransfer'])->name('mtop.store_transfer');

    Route::get('/mtop/print-ids', [MtopApplicationController::class, 'printIds'])->name('mtop.print_ids');
    Route::get('/mtop/{id}/print', [MtopApplicationController::class, 'print'])->name('mtop.print');
    Route::get('/mtop/{id}/print-drop', [MtopApplicationController::class, 'printDrop'])->name('mtop.print_drop');
    Route::get('/mtop/export', [MtopApplicationController::class, 'export'])->name('mtop.export');
    Route::post('/mtop/import', [MtopApplicationController::class, 'importData'])->name('mtop.import');

    Route::post('/mtop/update-driver-info', [MtopApplicationController::class, 'updateDriverInfo'])->name('mtop.update_driver');

    Route::get('/or-records', [OrRecordController::class, 'index'])->name('or_records.index');
    Route::post('/or-records', [OrRecordController::class, 'store'])->name('or_records.store');
    Route::put('/or-records/{id}', [OrRecordController::class, 'update'])->name('or_records.update');
    Route::get('/or-records/{id}/print', [OrRecordController::class, 'print'])->name('or_records.print');
    Route::post('/or-records/import', [OrRecordController::class, 'import'])->name('or_records.import');
    Route::get('/or-records/export', [OrRecordController::class, 'export'])->name('or_records.export');

    Route::post('/settings/fees', [FeeSettingController::class, 'update'])->name('settings.fees.update');

    Route::get('/settings/print', [PrintSettingController::class, 'edit'])->name('settings.print.edit');
    Route::post('/settings/print', [PrintSettingController::class, 'update'])->name('settings.print.update');

    Route::post('/settings/holidays', [HolidayController::class, 'store'])->name('holidays.store');
    Route::put('/settings/holidays/{holiday}', [HolidayController::class, 'update'])->name('holidays.update');
    Route::delete('/settings/holidays/{holiday}', [HolidayController::class, 'destroy'])->name('holidays.destroy');

    Route::get('/system/audit-logs/export', [UserController::class, 'exportAuditLogs'])->name('audit-logs.export');
    Route::delete('/system/audit-logs/flush', [UserController::class, 'flushAuditLogs'])->name('audit-logs.flush');

    Route::post('/settings/backup', function () {
        try {
            Artisan::call('backup:run');
        } catch (\Exception $e) {
        }

        $records = MtopApplication::latest()->get();
        $fileName = 'FULL_BACKUP_MTOP_' . date('Y-m-d_H-i') . '.xlsx';

        return (new FastExcel($records))->download($fileName, function ($row) {
            $paidBy = $row->show_paid_by
                ? trim("{$row->paid_by_first_name} {$row->paid_by_last_name} {$row->paid_by_suffix}")
                : 'N/A';

            $driverName = 'N/A';
            if ($row->has_driver) {
                $dMiddle = $row->driver_middle_name ? substr($row->driver_middle_name, 0, 1) . '. ' : '';
                $driverName = trim("{$row->driver_first_name} {$dMiddle}{$row->driver_last_name} {$row->driver_suffix}");
            }

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
                'Body Number' => (string) $row->body_number,
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
    })->name('settings.backup');

    Route::middleware(IsAdmin::class)->group(function () {
        Route::delete('/mtop/clear/all', [MtopApplicationController::class, 'clear'])->name('mtop.clear');
        Route::delete('/or-records/clear/all', [OrRecordController::class, 'clear'])->name('or_records.clear');

        Route::delete('/mtop/{id}', [MtopApplicationController::class, 'destroy'])->name('mtop.destroy');
        Route::delete('/or-records/{id}', [OrRecordController::class, 'destroy'])->name('or_records.destroy');

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
