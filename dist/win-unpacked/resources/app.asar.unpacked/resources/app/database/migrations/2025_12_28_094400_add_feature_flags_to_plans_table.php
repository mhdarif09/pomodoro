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
        Schema::table('plans', function (Blueprint $table) {
            $table->boolean('has_ai_assistant')->default(false)->after('max_subtasks');
            $table->integer('ai_chat_limit')->default(0)->after('has_ai_assistant'); // 0 means no access, -1 for unlimited
            $table->boolean('has_productivity_report')->default(false)->after('ai_chat_limit');
            $table->boolean('has_auto_open_url')->default(false)->after('has_productivity_report');
            $table->boolean('has_quick_notes')->default(false)->after('has_auto_open_url');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('plans', function (Blueprint $table) {
            $table->dropColumn([
                'has_ai_assistant',
                'ai_chat_limit',
                'has_productivity_report',
                'has_auto_open_url',
                'has_quick_notes'
            ]);
        });
    }
};
