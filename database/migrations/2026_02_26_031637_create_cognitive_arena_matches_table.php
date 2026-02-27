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
        Schema::create('cognitive_arena_matches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('simulation_id')->constrained('cognitive_simulations')->onDelete('cascade');
            $table->text('user_answer')->nullable();
            $table->integer('time_taken_seconds')->nullable();
            $table->text('ai_feedback_text')->nullable();
            $table->json('stat_changes')->nullable(); // JSON object storing how stats changed in this match
            $table->integer('xp_earned')->default(0);
            $table->boolean('completed')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cognitive_arena_matches');
    }
};
