<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Create usage tracking table
        Schema::create('ai_subtask_usage', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->integer('count')->default(0);
            $table->string('month'); // Format: YYYY-MM
            $table->timestamps();
            
            $table->unique(['user_id', 'month']);
        });
        
        // Update default max_subtasks to 20
        DB::statement('UPDATE plans SET max_subtasks = 20 WHERE max_subtasks = 3');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ai_subtask_usage');
    }
};
