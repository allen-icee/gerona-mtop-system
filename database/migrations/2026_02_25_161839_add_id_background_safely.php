<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('print_settings', function (Blueprint $table) {
            // Safely add the column if it doesn't exist
            if (!Schema::hasColumn('print_settings', 'id_background_path')) {
                $table->string('id_background_path')->nullable()->after('footer_path');
            }
        });
    }

    public function down(): void
    {
        Schema::table('print_settings', function (Blueprint $table) {
            if (Schema::hasColumn('print_settings', 'id_background_path')) {
                $table->dropColumn('id_background_path');
            }
        });
    }
};
