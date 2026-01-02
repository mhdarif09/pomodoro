<?php

namespace App\Services;

use App\Models\User;
use App\Models\Challenge;
use App\Models\Task;
use App\Models\PomodoroSession;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AutoChallengeService
{
    protected $gamificationService;

    public function __construct(GamificationService $gamificationService)
    {
        $this->gamificationService = $gamificationService;
    }

    /**
     * Generate daily challenges for all active users
     */
    /**
     * Generate daily challenges for all active users based on their level (Progressive Difficulty)
     */
    public function generateDailyChallenges()
    {
        $today = Carbon::today();
        
        // Define tiers
        $tiers = [
            'beginner' => [
                'min_level' => 0, 'max_level' => 10,
                'challenges' => [
                    ['title' => 'Langkah Awal', 'desc' => 'Selesaikan 1 sesi Pomodoro', 'type' => 'pomodoro', 'xp' => 30, 'points' => 10, 'req' => ['count' => 1]],
                    ['title' => 'Mulai Produktif', 'desc' => 'Selesaikan 1 tugas penting', 'type' => 'task', 'xp' => 30, 'points' => 10, 'req' => ['count' => 1]],
                ]
            ],
            'intermediate' => [
                'min_level' => 11, 'max_level' => 29,
                'challenges' => [
                    ['title' => 'Fokus Terjaga', 'desc' => 'Selesaikan 4 sesi Pomodoro', 'type' => 'pomodoro', 'xp' => 60, 'points' => 25, 'req' => ['count' => 4]],
                    ['title' => 'Penakluk Tugas', 'desc' => 'Selesaikan 3 tugas hari ini', 'type' => 'task', 'xp' => 60, 'points' => 25, 'req' => ['count' => 3]],
                    ['title' => 'Deep Work', 'desc' => 'Total 100 menit waktu fokus', 'type' => 'focus_time', 'xp' => 80, 'points' => 35, 'req' => ['minutes' => 100]],
                ]
            ],
            'pro' => [
                'min_level' => 30, 'max_level' => 999,
                'challenges' => [
                    ['title' => 'Mode Legenda', 'desc' => 'Selesaikan 8 sesi Pomodoro', 'type' => 'pomodoro', 'xp' => 150, 'points' => 50, 'req' => ['count' => 8]],
                    ['title' => 'Produktifitas Maksimal', 'desc' => 'Total 4 jam waktu fokus', 'type' => 'focus_time', 'xp' => 200, 'points' => 60, 'req' => ['minutes' => 240]],
                ]
            ]
        ];

        foreach ($tiers as $tierName => $tier) {
            foreach ($tier['challenges'] as $tmpl) {
                // Unique key for challenge to separate tiers
                $challenge = Challenge::firstOrCreate(
                    [
                        'title' => $tmpl['title'] . " (" . ucfirst($tierName) . ")", // Distinguish by name
                        'type' => $tmpl['type'],
                        'starts_at' => $today,
                        'ends_at' => $today,
                    ],
                    [
                        'description' => $tmpl['desc'],
                        'xp_reward' => $tmpl['xp'],
                        'points_reward' => $tmpl['points'],
                        'requirements' => $tmpl['req'],
                        'is_active' => true,
                    ]
                );

                // Assign to matching users
                User::where('last_active_date', '>=', Carbon::now()->subDays(7))
                    ->whereBetween('level', [$tier['min_level'], $tier['max_level']])
                    ->chunk(100, function ($users) use ($challenge) {
                        foreach ($users as $user) {
                            $this->gamificationService->assignChallenge($user, $challenge);
                        }
                    });
            }
        }
    }

    /**
     * Check progress for a specific user and their active challenges
     */
    public function checkProgress(User $user)
    {
        $activeChallenges = $user->challenges()
            ->wherePivot('completed', false)
            ->where('is_active', true)
            ->whereDate('starts_at', '<=', Carbon::today())
            ->whereDate('ends_at', '>=', Carbon::today())
            ->get();

        foreach ($activeChallenges as $challenge) {
            $progress = 0;
            $target = 0;
            $requirements = $challenge->requirements;

            // Calculate progress based on type
            switch ($challenge->type) {
                case 'pomodoro':
                    $query = PomodoroSession::where('user_id', $user->id)
                        ->where('ended_at', '>=', $challenge->starts_at)
                        ->where('ended_at', '<=', $challenge->ends_at->endOfDay());
                    
                    if (isset($requirements['before_time'])) {
                        $query->whereTime('ended_at', '<=', $requirements['before_time']);
                    }
                    
                    $progress = $query->count();
                    $target = $requirements['count'] ?? 1;
                    break;

                case 'task':
                    $query = Task::where('user_id', $user->id)
                        ->where('status', 'completed') // Assuming 'completed' is the status string
                        ->where('updated_at', '>=', $challenge->starts_at)
                        ->where('updated_at', '<=', $challenge->ends_at->endOfDay());
                        
                    $progress = $query->count();
                    $target = $requirements['count'] ?? 1;
                    break;

                case 'focus_time':
                    $progress = PomodoroSession::where('user_id', $user->id)
                        ->where('ended_at', '>=', $challenge->starts_at)
                        ->where('ended_at', '<=', $challenge->ends_at->endOfDay())
                        ->sum('focus_minutes');
                    $target = $requirements['minutes'] ?? 60;
                    break;
            }

            // Update progress in DB (percentage)
            $percent = ($target > 0) ? min(100, round(($progress / $target) * 100)) : 0;

            // Update via GamificationService
            // Update via GamificationService
            $this->gamificationService->updateChallengeProgress($user, $challenge, $percent);
        }
    }
}
