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
        Schema::create('cognitive_simulations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // The user who this simulation was generated for
            $table->string('type'); // e.g. logical_fallacy, ethical_dilemma
            $table->string('difficulty_level'); // e.g. Beginner, Intermediate, Expert
            $table->text('scenario_text');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cognitive_simulations');
    }
};
