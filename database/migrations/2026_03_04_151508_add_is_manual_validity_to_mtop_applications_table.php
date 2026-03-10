<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('mtop_applications', 'is_manual_validity')) {
            Schema::table('mtop_applications', function (Blueprint $table) {
                $table->boolean('is_manual_validity')->default(false)->after('valid_until');
            });
        }
    }

    public function down(): void
    {
        Schema::table('mtop_applications', function (Blueprint $table) {
            if (Schema::hasColumn('mtop_applications', 'is_manual_validity')) {
                $table->dropColumn('is_manual_validity');
            }
        });
    }
};
