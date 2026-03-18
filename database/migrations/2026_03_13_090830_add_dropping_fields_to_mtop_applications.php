<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('mtop_applications', function (Blueprint $table) {
            $table->date('drop_date')->nullable();
            $table->string('drop_or_number', 50)->nullable();
            $table->date('drop_or_date')->nullable();
            $table->decimal('drop_amount', 10, 2)->nullable();
            $table->string('drop_official', 100)->nullable();
            $table->string('drop_position', 100)->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('mtop_applications', function (Blueprint $table) {
            $table->dropColumn([
                'drop_date',
                'drop_or_number',
                'drop_or_date',
                'drop_amount',
                'drop_official',
                'drop_position'
            ]);
        });
    }
};
