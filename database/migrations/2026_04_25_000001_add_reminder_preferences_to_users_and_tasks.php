<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'default_reminder_enabled')) {
                $table->boolean('default_reminder_enabled')->default(true)->after('timezone');
            }

            if (!Schema::hasColumn('users', 'default_reminder_time')) {
                $table->string('default_reminder_time', 5)->default('09:00')->after('default_reminder_enabled');
            }

            if (!Schema::hasColumn('users', 'default_reminder_days_before')) {
                $table->unsignedTinyInteger('default_reminder_days_before')->default(1)->after('default_reminder_time');
            }
        });

        Schema::table('tasks', function (Blueprint $table) {
            if (!Schema::hasColumn('tasks', 'reminder_strategy')) {
                $table->string('reminder_strategy', 30)->nullable()->after('reminder_sent');
                $table->index(['reminder_strategy', 'reminder_at']);
            }
        });
    }

    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            if (Schema::hasColumn('tasks', 'reminder_strategy')) {
                $table->dropIndex(['reminder_strategy', 'reminder_at']);
                $table->dropColumn('reminder_strategy');
            }
        });

        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'default_reminder_days_before')) {
                $table->dropColumn('default_reminder_days_before');
            }
            if (Schema::hasColumn('users', 'default_reminder_time')) {
                $table->dropColumn('default_reminder_time');
            }
            if (Schema::hasColumn('users', 'default_reminder_enabled')) {
                $table->dropColumn('default_reminder_enabled');
            }
        });
    }
};

