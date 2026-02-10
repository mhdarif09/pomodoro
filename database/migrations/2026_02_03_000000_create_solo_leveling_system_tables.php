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
        Schema::create('player_stats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            
            // Core Stats (Solo Leveling Style)
            $table->string('rank')->default('E'); // E, D, C, B, A, S, National
            $table->string('title')->nullable(); // e.g. "Wolf Slayer"
            $table->string('job_class')->default('None'); // e.g. "Necromancer"
            
            $table->integer('level')->default(1);
            $table->integer('current_exp')->default(0);
            $table->integer('next_level_exp')->default(100);
            
            // Attributes
            $table->integer('strength')->default(10); // Linked to Task Completion
            $table->integer('intelligence')->default(10); // Linked to Focus Time
            $table->integer('agility')->default(10); // Linked to Speed/Efficiency
            $table->integer('vitality')->default(10); // Linked to Streaks
            $table->integer('sense')->default(10); // Linked to Planning
            
            // System Status
            $table->json('daily_quest_progress')->nullable(); // Tracks "Prepare to become stronger"
            $table->boolean('has_penalty')->default(false);
            
            $table->timestamps();
        });

        // AI Memory System (Jarvis)
        Schema::create('ai_conversations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('session_id')->index(); // UUID for chat session
            $table->string('type')->default('general'); // math, task, general
            $table->text('title')->nullable();
            $table->json('context_data')->nullable(); // Linked TaskID, or Math Problem Data
            $table->json('messages'); // The chat history
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ai_conversations');
        Schema::dropIfExists('player_stats');
    }
};
