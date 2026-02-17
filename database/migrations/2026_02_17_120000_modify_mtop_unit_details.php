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
            // Increase length to 30 to fit "FOR REGISTRATION" and make Nullable
            $table->string('plate_no', 30)->nullable()->change();
            $table->string('body_number', 30)->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('mtop_applications', function (Blueprint $table) {
            // Revert back to original state (Warning: Data truncation may occur if you reverse this)
            $table->string('plate_no', 10)->nullable(false)->change();
            $table->string('body_number', 10)->nullable(false)->change();
        });
    }
};
