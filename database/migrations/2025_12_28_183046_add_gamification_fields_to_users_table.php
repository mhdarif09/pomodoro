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
        Schema::table('users', function (Blueprint $table) {
            $table->integer('level')->default(1)->after('password');
            $table->integer('xp')->default(0)->after('level');
            $table->integer('total_xp')->default(0)->after('xp');
            $table->integer('current_streak')->default(0)->after('total_xp');
            $table->integer('longest_streak')->default(0)->after('current_streak');
            $table->date('last_active_date')->nullable()->after('longest_streak');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'level',
                'xp',
                'total_xp',
                'current_streak',
                'longest_streak',
                'last_active_date'
            ]);
        });
    }
};
