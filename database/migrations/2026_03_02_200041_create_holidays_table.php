<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        /*
        |--------------------------------------------------------------------------
        | CASE 1: Table Does Not Exist (Fresh Install)
        |--------------------------------------------------------------------------
        */
        if (!Schema::hasTable('holidays')) {

            Schema::create('holidays', function (Blueprint $table) {
                $table->id();
                $table->string('name');

                // Recurring holiday support (Month-Day only)
                $table->unsignedTinyInteger('month'); // 1–12
                $table->unsignedTinyInteger('day');   // 1–31

                // Required for your business-day gatekeeper
                $table->boolean('is_active')->default(true);

                $table->timestamps();
            });

            return;
        }

        /*
        |--------------------------------------------------------------------------
        | CASE 2: Table Exists (Patch Missing Columns Safely)
        |--------------------------------------------------------------------------
        */

        Schema::table('holidays', function (Blueprint $table) {

            if (!Schema::hasColumn('holidays', 'month')) {
                $table->unsignedTinyInteger('month')
                    ->after('name')
                    ->default(1);
            }

            if (!Schema::hasColumn('holidays', 'day')) {
                $table->unsignedTinyInteger('day')
                    ->after('month')
                    ->default(1);
            }

            if (!Schema::hasColumn('holidays', 'is_active')) {
                $table->boolean('is_active')
                    ->after('day')
                    ->default(true);
            }
        });
    }

    public function down(): void
    {
        if (!Schema::hasTable('holidays')) {
            return;
        }

        Schema::table('holidays', function (Blueprint $table) {

            if (Schema::hasColumn('holidays', 'is_active')) {
                $table->dropColumn('is_active');
            }

            if (Schema::hasColumn('holidays', 'day')) {
                $table->dropColumn('day');
            }

            if (Schema::hasColumn('holidays', 'month')) {
                $table->dropColumn('month');
            }
        });
    }
};
