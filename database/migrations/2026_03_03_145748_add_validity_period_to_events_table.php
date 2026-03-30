<?php
//GeronaMTOP\database\migrations\2026_03_03_145748_add_validity_period_to_events_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (!Schema::hasColumn('events', 'validity_years')) {
            Schema::table('events', function (Blueprint $table) {
                $table->integer('validity_years')->default(3);
            });
        }

        if (!Schema::hasColumn('events', 'validity_months')) {
            Schema::table('events', function (Blueprint $table) {
                $table->integer('validity_months')->default(0);
            });
        }
    }

    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            if (Schema::hasColumn('events', 'validity_years')) {
                $table->dropColumn('validity_years');
            }
            if (Schema::hasColumn('events', 'validity_months')) {
                $table->dropColumn('validity_months');
            }
        });
    }
};
