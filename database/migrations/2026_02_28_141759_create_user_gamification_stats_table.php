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
        Schema::create('user_gamification_stats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->integer('streak')->default(0);
            $table->integer('highest_streak')->default(0);
            $table->integer('journal_streak')->default(0);
            $table->integer('total_xp')->default(0);
            $table->string('rank_title')->default('Beginner');
            $table->integer('rank_position')->default(0);
            $table->integer('rank_points')->default(0);
            $table->date('last_active_date')->nullable();
            $table->integer('last_rank_change')->default(0);
            $table->timestamps();
            
            // Per user context
            $table->unique('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_gamification_stats');
    }
};
