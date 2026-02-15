<?php

use App\Http\Controllers\MtopApplicationController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\SignatoryController; // Import SignatoryController
use App\Http\Middleware\IsAdmin; // Import the Middleware Class
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Models\MtopApplication;
use App\Models\User;
use App\Http\Controllers\PrintSettingController;

// 1. HOME PAGE: Redirects to Login
Route::get('/', function () {
    return redirect()->route('login');
});

// 2. DASHBOARD: The Command Center (Real Data)
Route::get('/dashboard', function () {
    return Inertia::render('Dashboard', [
        'totalMtop'  => MtopApplication::count(),
        'totalUsers' => User::count(),
        'newToday'   => MtopApplication::whereDate('created_at', today())->count(),
    ]);
})->middleware(['auth', 'verified'])->name('dashboard');

// 3. AUTHENTICATED ROUTES
Route::middleware('auth')->group(function () {

    // MTOP SYSTEM ROUTES (Shared by Admin & Staff)
    // Staff can now Index, Create, Edit, Update, and Print
    Route::get('/mtop', [MtopApplicationController::class, 'index'])->name('mtop.index');
    Route::get('/mtop/create', [MtopApplicationController::class, 'create'])->name('mtop.create');
    Route::post('/mtop', [MtopApplicationController::class, 'store'])->name('mtop.store');

    // MOVED EDIT & UPDATE HERE (Accessible to Staff)
    Route::get('/mtop/{id}/edit', [MtopApplicationController::class, 'edit'])->name('mtop.edit');
    Route::put('/mtop/{id}', [MtopApplicationController::class, 'update'])->name('mtop.update');

    Route::get('/mtop/{id}/print', [MtopApplicationController::class, 'print'])->name('mtop.print');
    Route::get('/mtop/export', [MtopApplicationController::class, 'export'])->name('mtop.export');

    Route::resource('mtop', MtopApplicationController::class);
    // ADMIN ONLY ROUTES (Delete, User Management, Signatories)
    Route::middleware(IsAdmin::class)->group(function () {

        // MTOP Delete (Still restricted to Admin for safety)
        Route::delete('/mtop/{id}', [MtopApplicationController::class, 'destroy'])->name('mtop.destroy');

        // USER MANAGEMENT (Resource shortens all the get/post/put/delete lines)
        Route::resource('users', UserController::class);

        // SIGNATORIES CRUD
        Route::resource('signatories', SignatoryController::class)->only(['index', 'store', 'update', 'destroy']);

        Route::get('/settings/print', [PrintSettingController::class, 'edit'])->name('settings.print.edit');
        Route::post('/settings/print', [PrintSettingController::class, 'update'])->name('settings.print.update');
    });
});

require __DIR__ . '/auth.php';
