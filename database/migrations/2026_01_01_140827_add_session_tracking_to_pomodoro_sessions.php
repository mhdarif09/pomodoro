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
            $table->timestamp('skipped_at')->nullable()->after('ended_at');
            $table->string('skip_reason')->nullable()->after('skipped_at');
            $table->boolean('completed_successfully')->default(true)->after('skip_reason');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pomodoro_sessions', function (Blueprint $table) {
            $table->dropColumn(['skipped_at', 'skip_reason', 'completed_successfully']);
        });
    }
};
