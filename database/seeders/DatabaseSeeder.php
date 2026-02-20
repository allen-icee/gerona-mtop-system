<?php
//GeronaMTOP\database\seeders\DatabaseSeeder.php
namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{

    public function run(): void
    {

        User::create([
            'name' => 'System Administrator',
            'username' => 'admin',
            'email' => 'admin@gerona.gov.ph',
            'role' => 'admin',
            'password' => Hash::make('Admin_123'),
        ]);

        User::create([
            'name' => 'Licensing Officer',
            'username' => 'staff',
            'email' => 'staff@gerona.gov.ph',
            'role' => 'staff',
            'password' => Hash::make('password'),
        ]);
    }
}
