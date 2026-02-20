<?php
//GeronaMTOP\database\migrations\2026_02_14_190647_add_suffix_to_mtop_applications_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{

    public function up()
    {
        Schema::table('mtop_applications', function (Blueprint $table) {
            $table->string('suffix')->nullable()->after('middle_name');
        });
    }

    public function down()
    {
        Schema::table('mtop_applications', function (Blueprint $table) {
            $table->dropColumn('suffix');
        });
    }
};
