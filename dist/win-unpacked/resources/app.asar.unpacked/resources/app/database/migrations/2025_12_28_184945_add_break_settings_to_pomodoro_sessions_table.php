<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('pomodoro_sessions', function (Blueprint $table) {
            $table->string('break_activity')->nullable()->after('break_minutes'); // 'music', 'youtube', 'meditation', 'rest'
            $table->text('break_content_url')->nullable()->after('break_activity'); // YouTube URL or music embed
            $table->boolean('break_completed')->default(false)->after('break_content_url');
            $table->boolean('auto_start_break')->default(true)->after('break_completed');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pomodoro_sessions', function (Blueprint $table) {
            $table->dropColumn([
                'break_activity',
                'break_content_url',
                'break_completed',
                'auto_start_break'
            ]);
        });
    }
};
