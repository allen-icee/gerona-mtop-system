<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\MtopApplicationController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

// 1. CHANGE ROOT URL:
// Instead of the "Welcome" page, redirect immediately to Login.
Route::get('/', function () {
    return redirect()->route('login');
});

// 2. CHANGE DASHBOARD URL:
// Instead of a generic "You are logged in" page, go straight to the MTOP List.
Route::get('/dashboard', function () {
    return redirect()->route('mtop.index');
})->middleware(['auth', 'verified'])->name('dashboard');

// --- AUTHENTICATED ROUTES ---
Route::middleware('auth')->group(function () {

    // Keep Profile Routes (Good for changing passwords)
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // MTOP SYSTEM (Shared)
    Route::get('/mtop', [MtopApplicationController::class, 'index'])->name('mtop.index');
    Route::get('/mtop/create', [MtopApplicationController::class, 'create'])->name('mtop.create');
    Route::post('/mtop', [MtopApplicationController::class, 'store'])->name('mtop.store');
    Route::get('/mtop/{mtopApplication}/print', [MtopApplicationController::class, 'print'])->name('mtop.print');

    // ADMIN ONLY
    Route::middleware(['admin'])->group(function () {
        Route::get('/mtop/{mtopApplication}/edit', [MtopApplicationController::class, 'edit'])->name('mtop.edit');
        Route::put('/mtop/{mtopApplication}', [MtopApplicationController::class, 'update'])->name('mtop.update');
        Route::delete('/mtop/{mtopApplication}', [MtopApplicationController::class, 'destroy'])->name('mtop.destroy');
    });
});

require __DIR__ . '/auth.php';
