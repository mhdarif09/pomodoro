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
            // Drop old boolean column if it exists
            if (Schema::hasColumn('tasks', 'deadline_reminder_overdue_sent')) {
                $table->dropColumn('deadline_reminder_overdue_sent');
            }
            
            // Add new timestamp column to track overdue reminder with precision
            // This prevents spam by allowing us to check "was reminder sent > 24h ago?"
            if (!Schema::hasColumn('tasks', 'overdue_reminder_sent_at')) {
                $table->timestamp('overdue_reminder_sent_at')->nullable()->after('deadline_reminder_30min_sent');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            if (Schema::hasColumn('tasks', 'overdue_reminder_sent_at')) {
                $table->dropColumn('overdue_reminder_sent_at');
            }
            
            // Restore old column
            if (!Schema::hasColumn('tasks', 'deadline_reminder_overdue_sent')) {
                $table->boolean('deadline_reminder_overdue_sent')->default(false)->after('deadline_reminder_30min_sent');
            }
        });
    }
};
