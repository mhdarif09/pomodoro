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
        Schema::create('user_break_preferences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->integer('default_break_duration')->default(5); // minutes
            $table->string('preferred_break_activity')->default('rest'); // 'music', 'youtube', 'meditation', 'rest'
            $table->json('favorite_break_content')->nullable(); // User saved URLs/playlists
            $table->boolean('auto_start_break')->default(true);
            $table->boolean('play_sound_on_transition')->default(true);
            $table->timestamps();

            $table->unique('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_break_preferences');
    }
};
