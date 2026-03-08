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
            $table->timestamp('last_touched_at')->nullable()->after('focus_date');
            $table->boolean('deadline_reminder_1day_sent')->default(false)->after('last_touched_at');
            $table->boolean('deadline_reminder_3hour_sent')->default(false)->after('deadline_reminder_1day_sent');
            $table->boolean('deadline_reminder_30min_sent')->default(false)->after('deadline_reminder_3hour_sent');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->dropColumn([
                'last_touched_at',
                'deadline_reminder_1day_sent',
                'deadline_reminder_3hour_sent',
                'deadline_reminder_30min_sent',
            ]);
        });
    }
};
