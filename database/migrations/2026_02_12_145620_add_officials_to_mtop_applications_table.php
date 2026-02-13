<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('mtop_applications', function (Blueprint $table) {
            $table->string('punong_bayan', 100)->nullable();
            $table->string('authorized_official', 100)->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('mtop_applications', function (Blueprint $table) {
            //
        });
    }
};
