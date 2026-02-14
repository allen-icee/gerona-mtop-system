<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
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
