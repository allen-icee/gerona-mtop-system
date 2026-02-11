<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\MtopApplicationController; // <--- Make sure this is imported
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

// --- PROTECTED ROUTES (Must be logged in) ---
Route::middleware('auth')->group(function () {

    // 1. Profile Routes (Default)
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // 2. MTOP System Routes (NEW)
    // List all applications
    Route::get('/mtop', [MtopApplicationController::class, 'index'])->name('mtop.index');

    // Create new application
    Route::get('/mtop/create', [MtopApplicationController::class, 'create'])->name('mtop.create');
    Route::post('/mtop', [MtopApplicationController::class, 'store'])->name('mtop.store');

    // Edit existing application
    Route::get('/mtop/{mtopApplication}/edit', [MtopApplicationController::class, 'edit'])->name('mtop.edit');
    Route::put('/mtop/{mtopApplication}', [MtopApplicationController::class, 'update'])->name('mtop.update');

    // Print Document
    Route::get('/mtop/{mtopApplication}/print', [MtopApplicationController::class, 'print'])->name('mtop.print');
});

require __DIR__ . '/auth.php';
