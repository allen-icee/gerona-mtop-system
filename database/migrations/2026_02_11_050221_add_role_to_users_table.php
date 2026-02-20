<?php
//GeronaMTOP\database\migrations\2026_02_11_050221_add_role_to_users_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('staff');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {});
    }
};
