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
        Schema::table('plans', function (Blueprint $table) {
            $table->integer('whatsapp_reminder_limit')->nullable()->comment('Monthly WhatsApp reminder limit. NULL = unlimited');
            $table->integer('journal_limit')->nullable()->comment('Total journal/reflection limit. NULL = unlimited');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('plans', function (Blueprint $table) {
            $table->dropColumn(['whatsapp_reminder_limit', 'journal_limit']);
        });
    }
};
