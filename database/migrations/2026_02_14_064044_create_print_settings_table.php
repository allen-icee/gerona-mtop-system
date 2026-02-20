<?php
//GeronaMTOP\database\migrations\2026_02_14_064044_create_print_settings_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{

    public function up(): void
    {
        Schema::create('print_settings', function (Blueprint $table) {
            $table->id();
            $table->string('header_path')->nullable();
            $table->string('footer_path')->nullable();
            $table->boolean('show_header')->default(true);
            $table->boolean('show_footer')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('print_settings');
    }
};
