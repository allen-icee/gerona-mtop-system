<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('mtop_applications', function (Blueprint $table) {
            $table->id();

            // 1. APPLICANT DETAILS (Split Name)
            $table->string('last_name', 50);   // Max 50 chars
            $table->string('first_name', 50);  // Max 50 chars
            $table->string('middle_name', 50)->nullable(); // Optional
            $table->string('address', 255);
            $table->string('contact_number', 11)->nullable(); // e.g., 09123456789

            // 2. MTOP DETAILS
            $table->string('mt_number', 20)->nullable(); // Case #
            $table->date('transaction_date');
            $table->date('valid_until')->nullable();

            // 3. UNIT DETAILS
            $table->string('make_type', 50);        // e.g. HONDA
            $table->string('engine_motor_no', 30);  // Serial No
            $table->string('chassis_no', 30);       // Serial No
            $table->string('plate_no', 10);         // e.g. 123ABC (Max 10)
            $table->string('body_number', 10);      // e.g. 1536 (Max 10)

            // 4. DOCUMENTS (Nullable)
            $table->string('cedula_number', 20)->nullable();
            $table->date('cedula_date')->nullable();
            $table->string('or_number', 20)->nullable();
            $table->date('or_date')->nullable();

            // 5. SYSTEM
            $table->string('status', 20)->default('draft');
            $table->timestamps();

            $table->string('punong_bayan', 100)->nullable();
            $table->string('authorized_official', 100)->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mtop_applications');
    }
};
