<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Plan;

class PlanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $featuresStarter = [
            '3 tugas fokus harian',
            'Timer Pomodoro',
            'Kanban pribadi',
            'Bergabung 1 Guild',
            'Companion pixel art'
        ];

        $featuresPro = [
            'Semua fitur Starter',
            'AI Smart Focus',
            'Guild tanpa batas',
            'WhatsApp reminder',
            'Laporan mingguan',
            'Badge eksklusif'
        ];

        $plans = [
            [
                'name' => 'Starter',
                'price' => 0,
                'duration' => 'monthly',
                'description' => 'Untuk memulai kebiasaan baru',
                'features' => $featuresStarter,
                'is_active' => true,
                'max_subtasks' => 5,
                'has_ai_assistant' => false,
                'ai_chat_limit' => 0,
                'has_productivity_report' => false,
                'has_auto_open_url' => false,
                'has_quick_notes' => true,
                'max_guild_members' => 0, // Assuming 0 means only joining, not creating? Or maybe 1? Let's assume 0 for now based on description "Bergabung 1 Guild"
                'has_ai_guild_features' => false,
                'has_journal_access' => true,
                'has_learning_hub_access' => true, // Basic access
                'has_gamification_access' => true,
                'has_ai_genius_access' => false,
                'whatsapp_reminder_limit' => 0,
                'journal_limit' => 5,
            ],
            [
                'name' => 'Pro Monthly',
                'price' => 20000,
                'duration' => 'monthly',
                'description' => 'Untuk produktivitas serius',
                'features' => $featuresPro,
                'is_active' => true,
                'max_subtasks' => 20,
                'has_ai_assistant' => true,
                'ai_chat_limit' => 50,
                'has_productivity_report' => true,
                'has_auto_open_url' => true,
                'has_quick_notes' => true,
                'max_guild_members' => 10, // Create guild capability?
                'has_ai_guild_features' => true,
                'has_journal_access' => true,
                'has_learning_hub_access' => true,
                'has_gamification_access' => true,
                'has_ai_genius_access' => true,
                'whatsapp_reminder_limit' => 100,
                'journal_limit' => 100,
            ],
            [
                'name' => 'Pro Yearly',
                'price' => 200000, // 20k * 10 months (2 months free)
                'duration' => 'yearly',
                'description' => 'Hemat 20% untuk komitmen jangka panjang',
                'features' => $featuresPro,
                'is_active' => true,
                'max_subtasks' => 20,
                'has_ai_assistant' => true,
                'ai_chat_limit' => 50,
                'has_productivity_report' => true,
                'has_auto_open_url' => true,
                'has_quick_notes' => true,
                'max_guild_members' => 10,
                'has_ai_guild_features' => true,
                'has_journal_access' => true,
                'has_learning_hub_access' => true,
                'has_gamification_access' => true,
                'has_ai_genius_access' => true,
                'whatsapp_reminder_limit' => 100,
                'journal_limit' => 100,
            ],
        ];

        foreach ($plans as $plan) {
            Plan::updateOrCreate(
                ['name' => $plan['name']],
                $plan
            );
        }

        $this->command->info('Plans seeded successfully!');
    }
}
