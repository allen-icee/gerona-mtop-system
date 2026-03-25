<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('mtop_applications', function (Blueprint $table) {
            $table->boolean('has_driver')->default(false)->after('driver_name');
            $table->string('driver_last_name', 50)->nullable()->after('has_driver');
            $table->string('driver_first_name', 50)->nullable()->after('driver_last_name');
            $table->string('driver_middle_name', 50)->nullable()->after('driver_first_name');
            $table->string('driver_suffix', 10)->nullable()->after('driver_middle_name');
        });
    }

    public function down(): void
    {
        Schema::table('mtop_applications', function (Blueprint $table) {
            $table->dropColumn([
                'has_driver',
                'driver_last_name',
                'driver_first_name',
                'driver_middle_name',
                'driver_suffix'
            ]);
        });
    }
};
