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
            $table->integer('whatsapp_reminders_sent_this_month')->default(0)->comment('Count of WhatsApp reminders sent in current month');
            $table->timestamp('whatsapp_reminders_reset_at')->nullable()->comment('Last time the monthly counter was reset');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['whatsapp_reminders_sent_this_month', 'whatsapp_reminders_reset_at']);
        });
    }
};
