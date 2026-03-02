<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // Check if the table is missing (because your colleague forgot the original migration!)
        if (!Schema::hasTable('holidays')) {
            Schema::create('holidays', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->integer('month')->default(1);
                $table->integer('day')->default(1);
                $table->timestamps();
            });
        } else {
            // The table exists, so run your colleague's original alter logic
            Schema::table('holidays', function (Blueprint $table) {
                if (!Schema::hasColumn('holidays', 'month')) {
                    $table->integer('month')->after('name')->default(1);
                }
                if (!Schema::hasColumn('holidays', 'day')) {
                    $table->integer('day')->after('month')->default(1);
                }
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('holidays')) {
            Schema::table('holidays', function (Blueprint $table) {
                if (Schema::hasColumn('holidays', 'month')) {
                    $table->dropColumn('month');
                }
                if (Schema::hasColumn('holidays', 'day')) {
                    $table->dropColumn('day');
                }
            });
        }
    }
};
