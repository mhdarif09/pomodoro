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
        Schema::table('challenges', function (Blueprint $table) {
            // Change enum to string to support 'pomodoro', 'task', etc.
            // Note: DBAL might be needed for 'change()'. 
            // If not available, we can drop and recreate or use raw statement.
            // Laravel usually handles string change if DBAL is present.
            // If strict enum, we might need raw SQL. 
            // For now, attempting standard change.
            $table->string('type')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Reverting not strictly required for this fix forward, but good practice.
        // Schema::table('challenges', function (Blueprint $table) {
        //    $table->enum('type', ['daily', 'weekly', 'special'])->default('daily')->change();
        // });
    }
};
