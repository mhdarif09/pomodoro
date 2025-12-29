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
        Schema::create('mini_modul_chapters', function (Blueprint $table) {
             $table->id();
            $table->foreignId('mini_modul_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->string('slug');
            $table->longText('content');
            $table->enum('content_type', ['text', 'video', 'interactive', 'quiz'])->default('text');
            $table->json('media_files')->nullable(); // untuk video, gambar, dll
            $table->text('ai_prompt')->nullable(); // prompt untuk AI discussion
            $table->integer('chapter_number');
            $table->integer('estimated_duration')->default(10); // in minutes
            $table->boolean('is_published')->default(false);
            $table->timestamps();
            
            $table->unique(['mini_modul_id', 'slug']);
            $table->index(['mini_modul_id', 'chapter_number']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mini_modul_chapters');
    }
};
