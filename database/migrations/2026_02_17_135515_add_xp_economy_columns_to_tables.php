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
        Schema::table('guilds', function (Blueprint $table) {
            $table->integer('xp_balance')->default(0)->after('total_xp');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->integer('redeemable_xp')->default(0)->after('affiliate_balance');
        });

        Schema::table('tasks', function (Blueprint $table) {
            $table->integer('xp_reward')->nullable()->after('priority_score');
            $table->boolean('is_mission')->default(false)->after('xp_reward');
            $table->foreignId('funded_by_guild_id')->nullable()->after('is_mission')->constrained('guilds')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('guilds', function (Blueprint $table) {
            $table->dropColumn('xp_balance');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('redeemable_xp');
        });

        Schema::table('tasks', function (Blueprint $table) {
            $table->dropForeign(['funded_by_guild_id']);
            $table->dropColumn(['xp_reward', 'is_mission', 'funded_by_guild_id']);
        });
    }
};
