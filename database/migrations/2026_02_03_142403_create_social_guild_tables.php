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
        // 1. Guilds
        Schema::create('guilds', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->text('description')->nullable();
            $table->string('invite_code')->unique();
            $table->unsignedBigInteger('total_xp')->default(0);
            $table->unsignedInteger('level')->default(1);
            $table->unsignedInteger('capacity')->default(20);
            $table->boolean('is_private')->default(false);
            $table->timestamps();
        });

        // 2. Guild Members
        Schema::create('guild_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('guild_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('role')->default('member'); // leader, officer, member
            $table->unsignedBigInteger('contribution_xp')->default(0); // XP contributed to guild
            $table->timestamp('joined_at')->useCurrent();
            
            $table->unique(['guild_id', 'user_id']);
        });

        // 3. Guild Quests
        Schema::create('guild_quests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('guild_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->string('target_type'); // e.g., 'total_xp', 'tasks_completed', 'minutes_focused'
            $table->integer('target_amount');
            $table->integer('current_progress')->default(0);
            $table->integer('reward_xp')->default(500); // XP for the Guild
            $table->boolean('is_completed')->default(false);
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('guild_quests');
        Schema::dropIfExists('guild_members');
        Schema::dropIfExists('guilds');
    }
};
