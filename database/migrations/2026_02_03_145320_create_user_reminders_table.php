<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_reminders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('type'); // study, deadline, habit, comeback, motivation
            $table->string('frequency')->default('daily'); // daily, weekly, custom
            $table->time('preferred_time')->nullable(); // User's preferred reminder time
            $table->boolean('is_active')->default(true);
            $table->json('settings')->nullable(); // Custom settings per reminder type
            $table->timestamp('last_sent_at')->nullable();
            $table->timestamp('next_send_at')->nullable();
            $table->timestamps();
            
            $table->index(['user_id', 'type']);
            $table->index(['is_active', 'next_send_at']);
        });

        Schema::create('reminder_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_reminder_id')->nullable()->constrained()->onDelete('set null');
            $table->string('type');
            $table->text('message');
            $table->string('status')->default('sent'); // sent, delivered, read, failed
            $table->string('response')->nullable(); // User's reply if any
            $table->timestamp('sent_at');
            $table->timestamp('delivered_at')->nullable();
            $table->timestamps();
            
            $table->index(['user_id', 'sent_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reminder_logs');
        Schema::dropIfExists('user_reminders');
    }
};
