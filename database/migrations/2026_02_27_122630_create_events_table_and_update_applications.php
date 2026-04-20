<?php
//GeronaMTOP\database\migrations\2026_02_27_122630_create_events_table_and_update_applications.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Create the Events Table
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->date('start_date');
            $table->date('end_date');
            $table->date('fixed_expiry_date');
            $table->string('mandated_by')->nullable(); // e.g., "Sangguniang Bayan Res No. 15-2026"
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 2. Update the Applications Table
        Schema::table('mtop_applications', function (Blueprint $table) {
            $table->foreignId('event_id')->nullable()->constrained('events')->nullOnDelete();
            $table->boolean('is_free')->default(false);
        });
    }

    public function down(): void
    {
        Schema::table('mtop_applications', function (Blueprint $table) {
            $table->dropForeign(['event_id']);
            $table->dropColumn(['event_id', 'is_free']);
        });
        Schema::dropIfExists('events');
    }
};
