<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Challenge;
use Carbon\Carbon;

class ChallengeSeeder extends Seeder
{
    public function run(): void
    {
        $challenges = [
            // Daily challenges
            [
                'title' => 'Pagi Produktif',
                'description' => 'Selesaikan 3 task sebelum jam 12 siang',
                'type' => 'daily',
                'xp_reward' => 50,
                'requirements' => json_encode(['tasks' => 3, 'before' => '12:00']),
                'is_active' => true,
                'starts_at' => Carbon::today(),
                'ends_at' => Carbon::today()->endOfDay(),
            ],
            [
                'title' => 'Fokus Penuh',
                'description' => 'Selesaikan 5 pomodoro dalam satu hari',
                'type' => 'daily',
                'xp_reward' => 40,
                'requirements' => json_encode(['pomodoros' => 5]),
                'is_active' => true,
                'starts_at' => Carbon::today(),
                'ends_at' => Carbon::today()->endOfDay(),
            ],
            
            // Weekly challenges
            [
                'title' => 'Konsisten Warrior',
                'description' => 'Aktif 7 hari berturut-turut',
                'type' => 'weekly',
                'xp_reward' => 150,
                'requirements' => json_encode(['streak' => 7]),
                'is_active' => true,
                'starts_at' => Carbon::today()->startOfWeek(),
                'ends_at' => Carbon::today()->endOfWeek (),
            ],
            [
                'title' => 'Target Terpenuhi',
                'description' => 'Selesaikan 30 tasks dalam seminggu',
                'type' => 'weekly',
                'xp_reward' => 200,
                'requirements' => json_encode(['tasks' => 30]),
                'is_active' => true,
                'starts_at' => Carbon::today()->startOfWeek(),
                'ends_at' => Carbon::today()->endOfWeek(),
            ],
        ];

        foreach ($challenges as $challenge) {
            Challenge::create($challenge);
        }
    }
}
