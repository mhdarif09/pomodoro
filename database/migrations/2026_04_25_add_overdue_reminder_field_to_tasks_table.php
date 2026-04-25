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
        Schema::table('tasks', function (Blueprint $table) {
            // Track overdue reminder with timestamp to prevent spam
            // Only send reminder once per 24 hours
            $table->timestamp('overdue_reminder_sent_at')->nullable()->after('deadline_reminder_30min_sent');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->dropColumn(['overdue_reminder_sent_at']);
        });
    }
};
