<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Carbon\Carbon;

class StreakShareController extends Controller
{
    /**
     * Get comprehensive streak summary for the share card.
     */
    public function summary(Request $request)
    {
        $user = $request->user();
        $now = Carbon::now();
        $startOfWeek = $now->copy()->startOfWeek();

        // --- Streak Data ---
        $currentStreak = $user->current_streak ?? 0;
        $longestStreak = $user->longest_streak ?? 0;

        // --- All-time Stats ---
        $totalFocusMinutes = $user->pomodoroSessions()->sum('focus_minutes');
        $totalTasksCompleted = $user->tasks()->where('is_completed', true)->count();
        $totalPomodoros = $user->pomodoroSessions()->count();

        // --- Weekly Stats ---
        $weeklyFocusMinutes = $user->pomodoroSessions()
            ->whereBetween('created_at', [$startOfWeek, $now])
            ->sum('focus_minutes');

        $weeklyTasksCompleted = $user->tasks()
            ->where('is_completed', true)
            ->whereBetween('updated_at', [$startOfWeek, $now])
            ->count();

        $weeklyPomodoros = $user->pomodoroSessions()
            ->whereBetween('created_at', [$startOfWeek, $now])
            ->count();

        // --- Rank Info ---
        $rankTitle = 'Beginner';
        $rankPosition = null;
        if ($user->gamificationStats) {
            $rankTitle = $user->gamificationStats->rank_title ?? 'Beginner';
            $rankPosition = $user->gamificationStats->rank_position;
        }

        // --- Daily activity for last 7 days (for heatmap dots) ---
        $last7Days = [];
        for ($i = 6; $i >= 0; $i--) {
            $day = $now->copy()->subDays($i)->startOfDay();
            $hadActivity = $user->pomodoroSessions()
                ->whereDate('created_at', $day)
                ->exists()
                ||
                $user->tasks()
                ->where('is_completed', true)
                ->whereDate('updated_at', $day)
                ->exists();

            $last7Days[] = [
                'date' => $day->format('Y-m-d'),
                'day_short' => $day->format('D'),
                'active' => $hadActivity,
            ];
        }

        // --- Cognitive Arena Stats ---
        $cogStat = $user->cognitiveStat;

        return response()->json([
            'streak' => [
                'current' => $currentStreak,
                'longest' => $longestStreak,
            ],
            'all_time' => [
                'focus_hours' => round($totalFocusMinutes / 60, 1),
                'focus_minutes' => $totalFocusMinutes,
                'tasks_completed' => $totalTasksCompleted,
                'pomodoros' => $totalPomodoros,
            ],
            'this_week' => [
                'focus_hours' => round($weeklyFocusMinutes / 60, 1),
                'focus_minutes' => $weeklyFocusMinutes,
                'tasks_completed' => $weeklyTasksCompleted,
                'pomodoros' => $weeklyPomodoros,
            ],
            'user' => [
                'name' => $user->name,
                'first_name' => explode(' ', $user->name)[0],
                'rank_title' => $rankTitle,
                'rank_position' => $rankPosition,
                'level' => $user->level ?? 1,
                'member_since' => $user->created_at->format('M Y'),
            ],
            'last_7_days' => $last7Days,
            'cognitive' => $cogStat ? [
                'critical_thinking_level' => $cogStat->critical_thinking_level,
                'communication_level' => $cogStat->communication_level,
                'decision_speed' => $cogStat->decision_speed,
                'arena_rank' => $cogStat->arena_rank,
                'arena_xp' => $cogStat->arena_xp,
            ] : null,
        ]);
    }
}
