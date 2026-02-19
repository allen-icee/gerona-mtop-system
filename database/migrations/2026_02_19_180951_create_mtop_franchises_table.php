<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mtop_franchises', function (Blueprint $table) {
            $table->id();
            $table->string('mt_number', 20)->unique()->nullable(); // The permanent franchise number
            $table->string('body_number', 10)->unique()->nullable(); // The permanent sidecar number

            // OPERATOR IDENTITY (Static)
            $table->string('last_name', 50);
            $table->string('first_name', 50);
            $table->string('middle_name', 50)->nullable();
            $table->string('suffix', 10)->nullable();
            $table->string('address', 255);
            $table->string('contact_number', 11)->nullable();

            // CURRENT TRICYCLE UNIT (Can be updated via "Change Unit" transaction)
            $table->string('make_type', 50);
            $table->string('engine_motor_no', 30);
            $table->string('chassis_no', 30);
            $table->string('plate_no', 10);

            $table->string('status', 20)->default('active'); // active, dropped, suspended
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mtop_franchises');
    }
};
