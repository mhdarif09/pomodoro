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
        Schema::create('user_cognitive_stats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->integer('critical_thinking_level')->default(1);
            $table->integer('communication_level')->default(1);
            $table->integer('decision_speed')->default(1);
            $table->integer('consistency_score')->default(1);
            $table->string('arena_rank')->default('Novice');
            $table->integer('arena_xp')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_cognitive_stats');
    }
};
