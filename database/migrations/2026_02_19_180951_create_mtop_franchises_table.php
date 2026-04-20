<?php
//GeronaMTOP\database\migrations\2026_02_19_180951_create_mtop_franchises_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mtop_franchises', function (Blueprint $table) {
            $table->id();
            $table->string('mt_number', 20)->unique()->nullable();
            $table->string('body_number', 10)->unique()->nullable();

            $table->string('last_name', 50);
            $table->string('first_name', 50);
            $table->string('middle_name', 50)->nullable();
            $table->string('suffix', 10)->nullable();
            $table->string('address', 255);
            $table->string('contact_number', 11)->nullable();

            $table->string('make_type', 50);
            $table->string('engine_motor_no', 30);
            $table->string('chassis_no', 30);
            $table->string('plate_no', 10)->nullable();

            $table->string('status', 20)->default('active');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mtop_franchises');
    }
};
