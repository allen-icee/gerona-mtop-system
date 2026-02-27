<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('mtop_applications', function (Blueprint $table) {
            $table->boolean('show_paid_by')->default(false);
            $table->string('paid_by_last_name', 50)->nullable();
            $table->string('paid_by_first_name', 50)->nullable();
            $table->string('paid_by_middle_name', 50)->nullable();
            $table->string('paid_by_suffix', 10)->nullable();
        });

        Schema::table('mtop_franchises', function (Blueprint $table) {
            $table->boolean('show_paid_by')->default(false);
            $table->string('paid_by_last_name', 50)->nullable();
            $table->string('paid_by_first_name', 50)->nullable();
            $table->string('paid_by_middle_name', 50)->nullable();
            $table->string('paid_by_suffix', 10)->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('mtop_applications', function (Blueprint $table) {
            $table->dropColumn(['show_paid_by', 'paid_by_last_name', 'paid_by_first_name', 'paid_by_middle_name', 'paid_by_suffix']);
        });

        Schema::table('mtop_franchises', function (Blueprint $table) {
            $table->dropColumn(['show_paid_by', 'paid_by_last_name', 'paid_by_first_name', 'paid_by_middle_name', 'paid_by_suffix']);
        });
    }
};
