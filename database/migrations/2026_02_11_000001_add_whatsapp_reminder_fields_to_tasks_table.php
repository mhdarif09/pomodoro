<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->dateTime('reminder_at')->nullable()->after('auto_rescheduled_count');
            $table->boolean('reminder_sent')->default(false)->after('reminder_at');
            $table->string('created_via', 20)->nullable()->after('reminder_sent');
        });
    }

    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->dropColumn(['reminder_at', 'reminder_sent', 'created_via']);
        });
    }
};
