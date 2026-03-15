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
            $table->json('options')->nullable()->after('scenario_text');
            $table->string('correct_option')->nullable()->after('options');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cognitive_simulations', function (Blueprint $table) {
            //
        });
    }
};
