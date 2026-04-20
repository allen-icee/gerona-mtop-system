<?php
//GeronaMTOP\database\migrations\2026_03_13_094001_add_dropping_fee_to_fee_settings.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('fee_settings', function (Blueprint $table) {
            $table->decimal('dropping_fee', 10, 2)->default(100.00)->after('penalty');
        });
    }

    public function down(): void
    {
        Schema::table('fee_settings', function (Blueprint $table) {
            $table->dropColumn('dropping_fee');
        });
    }
};
