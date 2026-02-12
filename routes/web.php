<?php

use App\Http\Controllers\MtopApplicationController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UserController; // <--- IMPORT THIS!
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Models\MtopApplication;
use App\Models\User;

// 1. HOME PAGE: Redirects to Login
Route::get('/', function () {
    return redirect()->route('login');
});

// 2. DASHBOARD: The Command Center (Real Data)
Route::get('/dashboard', function () {
    return Inertia::render('Dashboard', [
        'totalMtop' => MtopApplication::count(),
        'totalUsers' => User::count(),
        'newToday'   => MtopApplication::whereDate('created_at', today())->count(),
    ]);
})->middleware(['auth', 'verified'])->name('dashboard');

// 3. AUTHENTICATED ROUTES
Route::middleware('auth')->group(function () {

    // PROFILE
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // MTOP SYSTEM ROUTES (Shared by Admin & Staff)
    Route::get('/mtop', [MtopApplicationController::class, 'index'])->name('mtop.index');
    Route::get('/mtop/create', [MtopApplicationController::class, 'create'])->name('mtop.create');
    Route::post('/mtop', [MtopApplicationController::class, 'store'])->name('mtop.store');
    Route::get('/mtop/{id}/print', [MtopApplicationController::class, 'print'])->name('mtop.print');

    // ADMIN ONLY ROUTES (Edit, Delete, & User Management)
    Route::middleware('admin')->group(function () {
        // MTOP Admin Actions
        Route::get('/mtop/{id}/edit', [MtopApplicationController::class, 'edit'])->name('mtop.edit');
        Route::put('/mtop/{id}', [MtopApplicationController::class, 'update'])->name('mtop.update');
        Route::delete('/mtop/{id}', [MtopApplicationController::class, 'destroy'])->name('mtop.destroy');

        // USER MANAGEMENT
        Route::get('/users', [UserController::class, 'index'])->name('users.index');
        Route::get('/users/create', [UserController::class, 'create'])->name('users.create');
        Route::post('/users', [UserController::class, 'store'])->name('users.store');

        // NEW: Edit & Update Routes
        Route::get('/users/{id}/edit', [UserController::class, 'edit'])->name('users.edit');
        Route::put('/users/{id}', [UserController::class, 'update'])->name('users.update');

        Route::delete('/users/{id}', [UserController::class, 'destroy'])->name('users.destroy');
    });
});

require __DIR__ . '/auth.php';
