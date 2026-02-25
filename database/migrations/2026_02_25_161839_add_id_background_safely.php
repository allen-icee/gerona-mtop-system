<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // This safely checks if the column is missing before trying to add it
        if (!Schema::hasColumn('print_settings', 'id_background_path')) {
            Schema::table('print_settings', function (Blueprint $table) {
                $table->string('id_background_path')->nullable()->after('footer_path');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('print_settings', 'id_background_path')) {
            Schema::table('print_settings', function (Blueprint $table) {
                $table->dropColumn('id_background_path');
            });
        }
    }
};
