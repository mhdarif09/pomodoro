<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\PomodoroSession;
use App\Models\Task;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        // 1. Weekly Focus Time (last 7 days)
        $weeklyFocus = PomodoroSession::where('user_id', $user->id)
            ->where('created_at', '>=', now()->subDays(6)->startOfDay())
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(focus_minutes) as total_minutes')
            )
            ->groupBy('date')
            ->orderBy('date', 'ASC')
            ->get();

        // Fill in missing days
        $focusData = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i)->format('Y-m-d');
            $found = $weeklyFocus->firstWhere('date', $date);
            $focusData[] = [
                'day' => now()->subDays($i)->format('D'),
                'minutes' => $found ? (int)$found->total_minutes : 0
            ];
        }

        // 2. Task Completion Rate
        $totalTasks = Task::where('user_id', $user->id)->count();
        $completedTasks = Task::where('user_id', $user->id)->where('is_completed', true)->count();
        
        $completionRate = $totalTasks > 0 ? round(($completedTasks / $totalTasks) * 100) : 0;

        // 3. Focus Distribution by priority (Proxy for category)
        $priorityDistribution = Task::where('user_id', $user->id)
            ->whereNotNull('priority')
            ->select('priority', DB::raw('count(*) as total'))
            ->groupBy('priority')
            ->get()
            ->map(function($item) {
                return [
                    'name' => ucfirst($item->priority),
                    'value' => $item->total
                ];
            });

        // 4. Productivity Streak
        $sessions = PomodoroSession::where('user_id', $user->id)
            ->select(DB::raw('DATE(created_at) as date'))
            ->groupBy('date')
            ->orderBy('date', 'DESC')
            ->get();

        $streak = 0;
        $currentDate = now()->startOfDay();

        foreach ($sessions as $session) {
            $sessionDate = Carbon::parse($session->date)->startOfDay();
            
            if ($sessionDate->equalTo($currentDate)) {
                $streak++;
                $currentDate->subDay();
            } elseif ($sessionDate->equalTo($currentDate->subDay())) {
                $streak++;
                $currentDate->subDay();
            } else {
                break;
            }
        }

        return Inertia::render('Reports/Index', [
            'stats' => [
                'weeklyFocus' => $focusData,
                'completionRate' => $completionRate,
                'totalCompleted' => $completedTasks,
                'totalTasks' => $totalTasks,
                'priorityDistribution' => $priorityDistribution,
                'streak' => $streak,
                'totalFocusMinutes' => PomodoroSession::where('user_id', $user->id)->sum('focus_minutes')
            ]
        ]);
    }
}
