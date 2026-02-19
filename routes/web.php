<?php

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

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

// 1. HOME PAGE: Loads the React Welcome/Login screen
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
    ]);
});

// 2. DASHBOARD: The Command Center (Real Data)
// routes/web.php

Route::get('/dashboard', function () {
    // 1. Get the Local IP Address of the Server
    $serverIp = getHostByName(getHostName());

    return Inertia::render('Dashboard', [
        'totalMtop'  => MtopApplication::count(),
        'totalUsers' => User::count(),
        'newToday'   => MtopApplication::whereDate('created_at', today())->count(),
        'serverIp'   => $serverIp, // <--- PASS THIS NEW VARIABLE
    ]);
})->middleware(['auth', 'verified'])->name('dashboard');

// 3. AUTHENTICATED ROUTES
Route::middleware('auth')->group(function () {

    // MTOP SYSTEM ROUTES (Shared by Admin & Staff)
    Route::get('/mtop', [MtopApplicationController::class, 'index'])->name('mtop.index');
    Route::get('/mtop/create', [MtopApplicationController::class, 'create'])->name('mtop.create');
    Route::post('/mtop', [MtopApplicationController::class, 'store'])->name('mtop.store');

    // --- PHASE 4: BATCH ID PRINTING ROUTES ---
    // MUST be defined BEFORE /{id} wildcard routes to prevent "print-ids" being treated as an ID
    Route::post('/mtop/update-driver-info', [MtopApplicationController::class, 'updateDriverInfo'])->name('mtop.update_driver');
    Route::get('/mtop/print-ids', [MtopApplicationController::class, 'printIds'])->name('mtop.print_ids');

    // MTOP SPECIFIC RECORD ROUTES (Accessible to Staff)
    Route::get('/mtop/{id}/edit', [MtopApplicationController::class, 'edit'])->name('mtop.edit');
    Route::put('/mtop/{id}', [MtopApplicationController::class, 'update'])->name('mtop.update');
    Route::get('/mtop/{id}/print', [MtopApplicationController::class, 'print'])->name('mtop.print');
    Route::get('/mtop/export', [MtopApplicationController::class, 'export'])->name('mtop.export');
    // BACKUP ROUTE
    Route::post('/settings/backup', function () {
        try {
            Artisan::call('backup:run');
            return back()->with('status', 'Database backup created successfully!');
        } catch (\Exception $e) {
            return back()->withErrors(['backup' => 'Backup failed: ' . $e->getMessage()]);
        }
    })->name('settings.backup');
    // ADMIN ONLY ROUTES (Delete, User Management, Signatories)
    Route::middleware(IsAdmin::class)->group(function () {

        // MTOP Delete
        Route::delete('/mtop/{id}', [MtopApplicationController::class, 'destroy'])->name('mtop.destroy');

        // USER MANAGEMENT
        Route::resource('users', UserController::class);

        // SIGNATORIES CRUD
        Route::resource('signatories', SignatoryController::class)->only(['index', 'store', 'update', 'destroy']);

        // PRINT SETTINGS
        Route::get('/settings/print', [PrintSettingController::class, 'edit'])->name('settings.print.edit');
        Route::post('/settings/print', [PrintSettingController::class, 'update'])->name('settings.print.update');
    });
});

require __DIR__ . '/auth.php';
