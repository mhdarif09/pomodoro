<?php

namespace App\Services;

use App\Models\User;
use App\Models\PomodoroSession;
use App\Models\Task;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ProductivityStatsService
{
    /**
     * Get Today's Stats
     */
    public function getDailyStats(User $user)
    {
        $today = Carbon::today();

        $focusMinutes = PomodoroSession::where('user_id', $user->id)
            ->whereDate('started_at', $today)
            ->sum('focus_minutes');

        $tasksCompleted = Task::where('user_id', $user->id)
            ->where('is_completed', true)
            ->whereDate('updated_at', $today) // Assuming completion time is updated_at
            ->count();

        // Calculate Focus Score (Simple Formula: Minutes + (Tasks * 10))
        $focusScore = $focusMinutes + ($tasksCompleted * 10);

        return [
            'date' => $today->format('Y-m-d'),
            'focus_minutes' => (int) $focusMinutes,
            'tasks_completed' => $tasksCompleted,
            'focus_score' => $focusScore,
        ];
    }

    /**
     * Get Weekly Trends (Last 7 Days)
     */
    public function getWeeklyTrends(User $user)
    {
        $startDate = Carbon::today()->subDays(6);
        $endDate = Carbon::today();

        // Fetch Data Grouped by Date
        $sessions = PomodoroSession::where('user_id', $user->id)
            ->whereBetween('started_at', [$startDate->startOfDay(), $endDate->endOfDay()])
            ->selectRaw('DATE(started_at) as date, SUM(focus_minutes) as total_minutes')
            ->groupBy('date')
            ->get()
            ->keyBy('date');

        $tasks = Task::where('user_id', $user->id)
            ->where('is_completed', true)
            ->whereBetween('updated_at', [$startDate->startOfDay(), $endDate->endOfDay()])
            ->selectRaw('DATE(updated_at) as date, COUNT(*) as total_tasks')
            ->groupBy('date')
            ->get()
            ->keyBy('date');

        // Fill in missing dates
        $trends = [];
        $current = $startDate->copy();
        while ($current <= $endDate) {
            $dateStr = $current->format('Y-m-d');
            $minutes = $sessions[$dateStr]->total_minutes ?? 0;
            $taskCount = $tasks[$dateStr]->total_tasks ?? 0;

            $trends[] = [
                'date' => $dateStr,
                'day_name' => $current->locale('id')->dayName, // Indonesian day name if locale set, otherwise English
                'focus_minutes' => (int) $minutes,
                'tasks_completed' => (int) $taskCount,
                'focus_score' => (int) ($minutes + ($taskCount * 10)),
            ];
            $current->addDay();
        }

        return $trends;
    }

    /**
     * Get Insights (Best Day, Best Hour)
     */
    public function getInsights(User $user)
    {
        // Best Day (Last 30 Days)
        $bestDay = PomodoroSession::where('user_id', $user->id)
            ->where('started_at', '>=', Carbon::today()->subDays(30))
            ->selectRaw('DAYNAME(started_at) as day, SUM(focus_minutes) as total_minutes')
            ->groupBy('day')
            ->orderByDesc('total_minutes')
            ->first();

        // Best Hour (Last 30 Days)
        $bestHour = PomodoroSession::where('user_id', $user->id)
             ->where('started_at', '>=', Carbon::today()->subDays(30))
             ->selectRaw('HOUR(started_at) as hour, COUNT(*) as session_count')
             ->groupBy('hour')
             ->orderByDesc('session_count')
             ->first();

        return [
            'best_day' => $bestDay ? $bestDay->day : 'Belum cukup data',
            'best_hour' => $bestHour ? sprintf("%02d:00", $bestHour->hour) : '-',
            'most_productive_time_desc' => $bestHour ? "Kamu paling sering fokus sekitar jam " . sprintf("%02d:00", $bestHour->hour) : "Teruslah fokus untuk mendapatkan insight!",
        ];
    }
}
