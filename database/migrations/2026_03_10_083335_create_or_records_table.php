<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('or_records', function (Blueprint $table) {
            $table->id();
            $table->date('transaction_date');
            $table->string('agency')->default('LGU GERONA');
            $table->string('payor_last_name');
            $table->string('payor_first_name');
            $table->string('payor_middle_name')->nullable();
            $table->string('payor_suffix')->nullable();
            $table->string('collecting_officer');
            $table->decimal('total_amount', 10, 2);
            $table->json('fee_breakdown')->nullable();
            $table->string('status')->default('Pending');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('or_records');
    }
};
