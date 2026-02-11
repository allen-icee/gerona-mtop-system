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

            // --- TABLE 1: APPLICANT & VALIDITY ---
            $table->string('mt_number')->nullable();      // Control/Case Number (e.g., 2026-001)
            $table->date('transaction_date');             // Date of Application (Feb 3, 2026)
            $table->date('valid_until')->nullable();      // Expiry Date (Feb 3, 2029)
            $table->string('operator_name');              // Name (Ricarte R. Bagsic)
            $table->string('address');                    // Barangay (Plastado, Gerona, Tarlac)

            // --- TABLE 2: TRICYCLE UNIT DETAILS ---
            $table->string('make_type');                  // Gawa At Uri (HONDA)
            $table->string('engine_motor_no');            // Motor Bilang
            $table->string('chassis_no');                 // Tsasi Bilang
            $table->string('plate_no');                   // Plaka Bilang (RE1470)
            $table->string('body_number')->nullable();    // Sidecar Number (# 1536)

            // --- TABLE 3: CEDULA (Community Tax Cert) ---
            $table->string('cedula_number')->nullable();  // Cedula Number
            $table->date('cedula_date')->nullable();      // Cedula Date

            // --- TABLE 4: OFFICIAL RECEIPT ---
            $table->string('or_number')->nullable();      // Official Receipt Number
            $table->date('or_date')->nullable();          // Official Receipt Date
            $table->decimal('amount', 10, 2)->nullable(); // Amount (Optional, kept just in case)

            // --- SYSTEM STATUS ---
            $table->string('status')->default('draft');   // draft, printed, released
            $table->timestamps();                         // Created At / Updated At
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
