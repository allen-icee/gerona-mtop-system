<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('mtop_applications', function (Blueprint $table) {
            $table->boolean('show_auth_official')->default(false);
            $table->boolean('show_cedula')->default(false);
            $table->boolean('show_or')->default(false);
        });
    }

    public function down(): void
    {
        Schema::table('mtop_applications', function (Blueprint $table) {
            $table->dropColumn(['show_auth_official', 'show_cedula', 'show_or']);
        });
    }
};
