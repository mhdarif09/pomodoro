<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reflections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            // ID unik untuk setiap sesi percakapan (satu sesi bisa ada banyak tanya-jawab)
            $table->uuid('session_id');
            $table->text('ai_question');
            $table->text('user_answer')->nullable();
            $table->text('ai_feedback')->nullable();
            // Tanggal refleksi untuk mempermudah query mingguan/harian
            $table->date('reflection_date');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reflections');
    }
};