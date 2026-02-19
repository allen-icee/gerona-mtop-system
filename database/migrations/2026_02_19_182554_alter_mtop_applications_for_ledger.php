<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('mtop_applications', function (Blueprint $table) {
            // 1. Link to the Franchise Parent
            $table->foreignId('franchise_id')->nullable()->constrained('mtop_franchises')->onDelete('cascade');

            // 2. Define the exact type of transaction this row represents
            $table->string('transaction_type', 30)->default('New'); // New, Renewal, Change Unit, Dropping

            // 3. Track who processed this specific transaction (Audit Trail)
            $table->foreignId('processed_by')->nullable()->constrained('users')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('mtop_applications', function (Blueprint $table) {
            $table->dropForeign(['franchise_id']);
            $table->dropForeign(['processed_by']);
            $table->dropColumn(['franchise_id', 'transaction_type', 'processed_by']);
        });
    }
};
