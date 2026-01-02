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
            $table->json('ai_suggested_subtasks')->nullable()->after('notes');
            $table->integer('complexity_score')->nullable()->after('ai_suggested_subtasks');
            $table->integer('auto_rescheduled_count')->default(0)->after('complexity_score');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->dropColumn(['ai_suggested_subtasks', 'complexity_score', 'auto_rescheduled_count']);
        });
    }
};
