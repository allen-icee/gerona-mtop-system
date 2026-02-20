<?php
//GeronaMTOP\database\migrations\2026_02_11_021942_create_mtop_applications_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{

    public function up(): void
    {
        Schema::create('mtop_applications', function (Blueprint $table) {
            $table->id();

            $table->string('last_name', 50);
            $table->string('first_name', 50);
            $table->string('middle_name', 50)->nullable();
            $table->string('address', 255);
            $table->string('contact_number', 11)->nullable();

            $table->string('mt_number', 20)->nullable();
            $table->date('transaction_date');
            $table->date('valid_until')->nullable();

            $table->string('make_type', 50);
            $table->string('engine_motor_no', 30);
            $table->string('chassis_no', 30);
            $table->string('plate_no', 10);
            $table->string('body_number', 10);

            $table->string('cedula_number', 20)->nullable();
            $table->date('cedula_date')->nullable();
            $table->string('or_number', 20)->nullable();
            $table->date('or_date')->nullable();

            $table->string('status', 20)->default('draft');
            $table->timestamps();

            $table->string('punong_bayan', 100)->nullable();
            $table->string('authorized_official', 100)->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mtop_applications');
    }
};
