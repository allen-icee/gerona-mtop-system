<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('fee_settings', function (Blueprint $table) {
            $table->id();
            $table->decimal('reg_filing_fee', 10, 2)->default(150);
            $table->decimal('franchise_fee', 10, 2)->default(300);
            $table->decimal('mayors_permit', 10, 2)->default(200);
            $table->decimal('supervisor_fee', 10, 2)->default(100);
            $table->decimal('account_clearance', 10, 2)->default(50);
            $table->decimal('sticker_fee', 10, 2)->default(100);
            $table->decimal('id_driver_operator_owner', 10, 2)->default(150);
            $table->decimal('body_number_plate', 10, 2)->default(250);
            $table->decimal('penalty', 10, 2)->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fee_settings');
    }
};
