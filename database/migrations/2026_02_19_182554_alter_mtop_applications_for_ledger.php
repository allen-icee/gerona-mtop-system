<?php
//GeronaMTOP\database\migrations\2026_02_19_182554_alter_mtop_applications_for_ledger.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('mtop_applications', function (Blueprint $table) {

            $table->foreignId('franchise_id')->nullable()->constrained('mtop_franchises')->onDelete('cascade');

            $table->string('transaction_type', 30)->default('New');

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
