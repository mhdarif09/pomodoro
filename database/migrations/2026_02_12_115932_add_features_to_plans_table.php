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
            $table->integer('max_guild_members')->default(10)->after('ai_chat_limit');
            $table->boolean('has_ai_guild_features')->default(false)->after('max_guild_members');
            $table->boolean('has_journal_access')->default(true)->after('has_ai_guild_features');
            $table->boolean('has_learning_hub_access')->default(true)->after('has_journal_access');
            $table->boolean('has_gamification_access')->default(true)->after('has_learning_hub_access');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('plans', function (Blueprint $table) {
            $table->dropColumn([
                'max_guild_members',
                'has_ai_guild_features',
                'has_journal_access',
                'has_learning_hub_access',
                'has_gamification_access'
            ]);
        });
    }
};
