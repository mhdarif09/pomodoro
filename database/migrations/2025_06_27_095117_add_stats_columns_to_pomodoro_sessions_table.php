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
        Schema::table('pomodoro_sessions', function (Blueprint $table) {
            // Tambahkan kolom untuk melacak apakah sesi dihentikan manual
            // ->after('ended_at') adalah opsional, tapi bagus untuk kerapian
            $table->boolean('manually_stopped')->default(false)->after('ended_at');

            // Tambahkan kolom untuk melacak jumlah pergantian tab
            $table->unsignedInteger('tab_switches')->default(0)->after('manually_stopped');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pomodoro_sessions', function (Blueprint $table) {
            $table->dropColumn(['manually_stopped', 'tab_switches']);
        });
    }
};