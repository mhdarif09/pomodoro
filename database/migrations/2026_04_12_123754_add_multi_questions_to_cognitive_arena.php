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
        Schema::table('cognitive_simulations', function (Blueprint $table) {
            $table->json('questions')->nullable()->after('correct_option');
        });

        Schema::table('cognitive_arena_matches', function (Blueprint $table) {
            $table->json('user_answers')->nullable()->after('user_answer');
            $table->integer('score')->nullable()->after('xp_earned');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cognitive_simulations', function (Blueprint $table) {
            $table->dropColumn('questions');
        });
        
        Schema::table('cognitive_arena_matches', function (Blueprint $table) {
            $table->dropColumn(['user_answers', 'score']);
        });
    }
};
