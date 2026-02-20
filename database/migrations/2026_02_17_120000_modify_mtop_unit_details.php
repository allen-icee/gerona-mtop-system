<?php
//GeronaMTOP\database\migrations\2026_02_17_120000_modify_mtop_unit_details.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{

    public function up(): void
    {
        Schema::table('mtop_applications', function (Blueprint $table) {
            $table->string('plate_no', 30)->nullable()->change();
            $table->string('body_number', 30)->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('mtop_applications', function (Blueprint $table) {

            $table->string('plate_no', 10)->nullable(false)->change();
            $table->string('body_number', 10)->nullable(false)->change();
        });
    }
};
