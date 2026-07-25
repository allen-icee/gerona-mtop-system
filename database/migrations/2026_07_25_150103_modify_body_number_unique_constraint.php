<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('mtop_franchises', function (Blueprint $table) {
            $table->dropUnique('mtop_franchises_body_number_unique');
        });

        // Create partial unique index
        DB::statement("CREATE UNIQUE INDEX mtop_franchises_body_number_active_unique ON mtop_franchises (body_number) WHERE status = 'active'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("DROP INDEX mtop_franchises_body_number_active_unique");

        Schema::table('mtop_franchises', function (Blueprint $table) {
            $table->unique('body_number', 'mtop_franchises_body_number_unique');
        });
    }
};
