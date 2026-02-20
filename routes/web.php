<?php
//GeronaMTOP\routes\web.php
use App\Http\Controllers\MtopApplicationController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\SignatoryController;
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
        'totalMtop'  => MtopApplication::count(),
        'totalUsers' => User::count(),
        'newToday'   => MtopApplication::whereDate('created_at', today())->count(),
        'serverIp'   => $serverIp,
    ]);
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {

    Route::get('/mtop', [MtopApplicationController::class, 'index'])->name('mtop.index');
    Route::get('/mtop/create', [MtopApplicationController::class, 'create'])->name('mtop.create');
    Route::post('/mtop', [MtopApplicationController::class, 'store'])->name('mtop.store');

    Route::post('/mtop/update-driver-info', [MtopApplicationController::class, 'updateDriverInfo'])->name('mtop.update_driver');
    Route::get('/mtop/print-ids', [MtopApplicationController::class, 'printIds'])->name('mtop.print_ids');

    Route::get('/mtop/{id}/renew', [MtopApplicationController::class, 'renew'])->name('mtop.renew');
    Route::post('/mtop/{id}/renew', [MtopApplicationController::class, 'storeRenewal'])->name('mtop.store_renewal');

    Route::get('/mtop/{id}/edit', [MtopApplicationController::class, 'edit'])->name('mtop.edit');
    Route::put('/mtop/{id}', [MtopApplicationController::class, 'update'])->name('mtop.update');
    Route::get('/mtop/{id}/print', [MtopApplicationController::class, 'print'])->name('mtop.print');
    Route::get('/mtop/export', [MtopApplicationController::class, 'export'])->name('mtop.export');

    Route::post('/settings/backup', function () {
        try {
            Artisan::call('backup:run');
            return back()->with('status', 'Database backup created successfully!');
        } catch (\Exception $e) {
            return back()->withErrors(['backup' => 'Backup failed: ' . $e->getMessage()]);
        }
    })->name('settings.backup');

    Route::get('/settings/print', [PrintSettingController::class, 'edit'])->name('settings.print.edit');
    Route::post('/settings/print', [PrintSettingController::class, 'update'])->name('settings.print.update');

    Route::middleware(IsAdmin::class)->group(function () {

        Route::delete('/mtop/{id}', [MtopApplicationController::class, 'destroy'])->name('mtop.destroy');

        Route::resource('users', UserController::class);

        Route::resource('signatories', SignatoryController::class)->only(['index', 'store', 'update', 'destroy']);
    });
});

require __DIR__ . '/auth.php';
