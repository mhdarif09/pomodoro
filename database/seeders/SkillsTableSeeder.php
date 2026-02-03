<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Skill;

class SkillsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $skills = [
            [
                'name' => 'Produktivitas',
                'slug' => 'productivity',
                'description' => 'Kemampuan menyelesaikan tugas secara efisien.',
                'icon' => 'BoltIcon',
                'color' => '#fbbf24', // amber-400
            ],
            [
                'name' => 'Fokus',
                'slug' => 'focus',
                'description' => 'Kemampuan mempertahankan konsentrasi dalam sesi Pomodoro.',
                'icon' => 'EyeIcon',
                'color' => '#8b5cf6', // violet-500
            ],
            [
                'name' => 'Konsistensi',
                'slug' => 'consistency',
                'description' => 'Kemampuan menjaga streak dan rutinitas.',
                'icon' => 'FireIcon',
                'color' => '#f87171', // red-400
            ],
            [
                'name' => 'Pembelajaran',
                'slug' => 'learning',
                'description' => 'Kemampuan menyerap materi baru dan menyelesaikan modul.',
                'icon' => 'AcademicCapIcon',
                'color' => '#34d399', // emerald-400
            ],
            [
                'name' => 'Kreativitas',
                'slug' => 'creativity',
                'description' => 'Kemampuan menghasilkan ide dan solusi baru.',
                'icon' => 'SparklesIcon',
                'color' => '#22d3ee', // cyan-400
            ]
        ];

        foreach ($skills as $skill) {
            Skill::updateOrCreate(['slug' => $skill['slug']], $skill);
        }
    }
}
