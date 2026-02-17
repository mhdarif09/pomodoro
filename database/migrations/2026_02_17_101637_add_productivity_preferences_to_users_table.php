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
        Schema::table('users', function (Blueprint $table) {
            $table->integer('daily_task_limit')->default(3)->after('timezone');
            $table->boolean('anti_overplanning_enabled')->default(false)->after('daily_task_limit');
            $table->timestamp('last_recovery_date')->nullable()->after('anti_overplanning_enabled');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['daily_task_limit', 'anti_overplanning_enabled', 'last_recovery_date']);
        });
    }
};
