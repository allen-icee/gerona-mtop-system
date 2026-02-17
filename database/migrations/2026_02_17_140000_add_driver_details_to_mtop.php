<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('mtop_applications', function (Blueprint $table) {
            // These are the columns the error says are missing
            $table->string('driver_name', 100)->nullable()->after('address');
            $table->string('driver_license_no', 30)->nullable()->after('driver_name');
            $table->string('driver_photo_path', 2048)->nullable()->after('driver_license_no');
        });
    }

    public function down(): void
    {
        Schema::table('mtop_applications', function (Blueprint $table) {
            $table->dropColumn(['driver_name', 'driver_license_no', 'driver_photo_path']);
        });
    }
};
