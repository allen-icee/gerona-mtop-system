<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Create the SUPER ADMIN
        User::create([
            'name' => 'System Administrator',
            'username' => 'admin',
            'email' => 'admin@gerona.gov.ph',
            'role' => 'admin',
            'password' => Hash::make('Admin_123'), // Default password
        ]);

        // 2. Create a Default STAFF
        User::create([
            'name' => 'Licensing Officer',
            'username' => 'staff',
            'email' => 'staff@gerona.gov.ph',
            'role' => 'staff',
            'password' => Hash::make('password'),
        ]);

        // Optional: Create 10 Fake Dummy Users (for testing pagination)
        // User::factory(10)->create();
    }
}
