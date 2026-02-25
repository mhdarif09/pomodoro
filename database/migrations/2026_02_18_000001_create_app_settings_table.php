<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('app_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->string('description')->nullable();
            $table->string('group')->default('general');
            $table->timestamps();
        });

        // Seed default settings
        DB::table('app_settings')->insert([
            [
                'key' => 'free_journal_limit',
                'value' => '50',
                'description' => 'Batas halaman jurnal untuk user gratis',
                'group' => 'free_limits',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'free_wa_reminder_limit',
                'value' => '20',
                'description' => 'Batas reminder WhatsApp per bulan untuk user gratis',
                'group' => 'free_limits',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('app_settings');
    }
};
