<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\GamificationService;
use App\Models\User;
use Illuminate\Http\Request;
use Carbon\Carbon;

class GamificationController extends Controller
{
    protected $gamificationService;

    public function __construct(GamificationService $gamificationService)
    {
        $this->gamificationService = $gamificationService;
    }

    /**
     * Get user's current streak
     */
    public function getStreak(Request $request)
    {
        $user = $request->user();
        
        // Update streak on API call
        $this->gamificationService->updateStreak($user);

        return response()->json([
            'current_streak' => $user->current_streak,
            'longest_streak' => $user->longest_streak,
            'last_active_date' => $user->last_active_date,
            'streak_updated' => true,
        ]);
    }

    /**
     * Get weekly journey/target progress
     */
    public function getWeeklyJourney(Request $request)
    {
        $user = $request->user();
        $startOfWeek = Carbon::now()->startOfWeek();
        $endOfWeek = Carbon::now()->endOfWeek();

        // Get tasks completed this week (use updated_at as completion time)
        $tasksCompletedThisWeek = $user->tasks()
            ->where('is_completed', true)
            ->whereBetween('updated_at', [$startOfWeek, $endOfWeek])
            ->count();

        // Get pomodoros completed this week
        $pomodorosThisWeek = $user->pomodoroSessions()
            ->whereBetween('created_at', [$startOfWeek, $endOfWeek])
            ->count();

        // Get total focus minutes this week
        $focusMinutesThisWeek = $user->pomodoroSessions()
            ->whereBetween('created_at', [$startOfWeek, $endOfWeek])
            ->sum('focus_minutes');

        // Weekly targets (can be customized)
        $weeklyTargets = [
            'tasks' => [
                'completed' => $tasksCompletedThisWeek,
                'target' => 20,
                'percentage' => min(100, round(($tasksCompletedThisWeek / 20) * 100)),
            ],
            'pomodoros' => [
                'completed' => $pomodorosThisWeek,
                'target' => 30,
                'percentage' => min(100, round(($pomodorosThisWeek / 30) * 100)),
            ],
            'focus_minutes' => [
                'completed' => $focusMinutesThisWeek,
                'target' => 600, // 10 hours per week
                'percentage' => min(100, round(($focusMinutesThisWeek / 600) * 100)),
            ],
        ];

        // Calculate overall progress
        $overallProgress = round(
            ($weeklyTargets['tasks']['percentage'] + 
             $weeklyTargets['pomodoros']['percentage'] + 
             $weeklyTargets['focus_minutes']['percentage']) / 3
        );

        // Get streak info
        $streakResult = $this->gamificationService->updateStreak($user);

        return response()->json([
            'week' => [
                'start' => $startOfWeek->format('Y-m-d'),
                'end' => $endOfWeek->format('Y-m-d'),
                'days_completed' => $this->getDaysCompletedThisWeek($user, $startOfWeek),
            ],
            'targets' => $weeklyTargets,
            'overall_progress' => $overallProgress,
            'streak' => [
                'current' => $user->current_streak,
                'longest' => $user->longest_streak,
            ],
            'rewards' => $this->calculateWeeklyRewards($overallProgress, $streakResult['current_streak']),
        ]);
    }

    /**
     * Get number of days user completed tasks this week
     */
    private function getDaysCompletedThisWeek(User $user, Carbon $startOfWeek)
    {
        $days = [];
        for ($i = 0; $i < 7; $i++) {
            $day = $startOfWeek->copy()->addDays($i);
            $count = $user->tasks()
                ->where('is_completed', true)
                ->whereDate('updated_at', $day)
                ->count();
            $days[] = [
                'date' => $day->format('Y-m-d'),
                'day_name' => $day->format('l'),
                'completed' => $count > 0,
                'count' => $count,
            ];
        }
        return $days;
    }

    /**
     * Calculate rewards based on progress
     */
    private function calculateWeeklyRewards(int $progress, int $streak)
    {
        $rewards = [];
        
        // XP reward based on overall progress
        $xpReward = floor($progress * 2); // Max 200 XP for 100%
        if ($progress >= 80) {
            $xpReward += 50; // Bonus for high completion
        }
        
        // Streak bonus
        $streakBonus = min($streak * 5, 50); // Max 50 bonus

        return [
            'xp' => $xpReward + $streakBonus,
            'streak_bonus' => $streakBonus,
            'badges' => [],
        ];
    }
}
