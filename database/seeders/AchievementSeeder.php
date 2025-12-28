<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Achievement;

class AchievementSeeder extends Seeder
{
    public function run(): void
    {
        $achievements = [
            // Beginner achievements
            [
                'name' => 'Pemula',
                'slug' => 'first-task',
                'description' => 'Selesaikan task pertamamu',
                'icon' => '🎯',
                'rarity' => 'common',
                'criteria' => json_encode(['tasks_completed' => 1]),
                'xp_reward' => 10,
            ],
            [
                'name' => 'Fokus Pertama',
                'slug' => 'first-pomodoro',
                'description' => 'Selesaikan pomodoro pertamamu',
                'icon' => '⏱️',
                'rarity' => 'common',
                'criteria' => json_encode(['pomodoros_completed' => 1]),
                'xp_reward' => 10,
            ],
            
            // Streak achievements
            [
                'name' => 'Api yang Menyala',
                'slug' => '7-day-streak',
                'description' => 'Pertahankan streak 7 hari',
                'icon' => '🔥',
                'rarity' => 'rare',
                'criteria' => json_encode(['streak_days' => 7]),
                'xp_reward' => 100,
            ],
            [
                'name' => 'Konsistensi Adalah Kunci',
                'slug' => '30-day-streak',
                'description' => 'Pertahankan streak 30 hari',
                'icon' => '💪',
                'rarity' => 'epic',
                'criteria' => json_encode(['streak_days' => 30]),
                'xp_reward' => 300,
            ],
            
            // Task achievements
            [
                'name' => 'Produktif',
                'slug' => '10-tasks',
                'description' => 'Selesaikan 10 tasks',
                'icon' => '✅',
                'rarity' => 'common',
                'criteria' => json_encode(['tasks_completed' => 10]),
                'xp_reward' => 50,
            ],
            [
                'name' => 'Penakluk Tugas',
                'slug' => '100-tasks',
                'description' => 'Selesaikan 100 tasks',
                'icon' => '🏆',
                'rarity' => 'epic',
                'criteria' => json_encode(['tasks_completed' => 100]),
                'xp_reward' => 200,
            ],
            
            // Pomodoro achievements
            [
                'name' => 'Master Fokus',
                'slug' => '100-pomodoros',
                'description' => 'Selesaikan 100 pomodoros',
                'icon' => '👑',
                'rarity' => 'epic',
                'criteria' => json_encode(['pomodoros_completed' => 100]),
                'xp_reward' => 200,
            ],
            
            // Level achievements
            [
                'name' => 'Naik Level!',
                'slug' => 'level-10',
                'description' => 'Capai level 10',
                'icon' => '⭐',
                'rarity' => 'rare',
                'criteria' => json_encode(['level_reached' => 10]),
                'xp_reward' => 150,
            ],
            [
                'name' => 'Setengah Jalan ke Puncak',
                'slug' => 'level-25',
                'description' => 'Capai level 25',
                'icon' => '🌟',
                'rarity' => 'epic',
                'criteria' => json_encode(['level_reached' => 25]),
                'xp_reward' => 300,
            ],
            [
                'name' => 'Legenda',
                'slug' => 'level-50',
                'description' => 'Capai level 50 - kamu adalah legenda!',
                'icon' => '💎',
                'rarity' => 'legendary',
                'criteria' => json_encode(['level_reached' => 50]),
                'xp_reward' => 500,
            ],
        ];

        foreach ($achievements as $achievement) {
            Achievement::create($achievement);
        }
    }
}
