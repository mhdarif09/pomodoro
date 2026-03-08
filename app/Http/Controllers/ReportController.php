<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\PomodoroSession;
use App\Models\Task;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use App\Services\FocusAnalyticsService;

class ReportController extends Controller
{
    public function index(Request $request, FocusAnalyticsService $analyticsService)
    {
        set_time_limit(0);
        // JIKA REQUEST ADALAH AJAX/JSON (DARI AXIOS REACT), KIRIM DATA STATS
        if ($request->wantsJson()) {
            $user = auth()->user();

            // Basic stats
            $totalTasks = Task::where('user_id', $user->id)->count();
            $completedTasks = Task::where('user_id', $user->id)->where('is_completed', true)->count();
            $completionRate = $totalTasks > 0 ? round(($completedTasks / $totalTasks) * 100) : 0;
            
            $totalFocusMinutes = PomodoroSession::where('user_id', $user->id)->sum('focus_minutes');
            
            $successSessions = PomodoroSession::where('user_id', $user->id)
                ->where('completed_successfully', true)
                ->count();
            $totalSessions = PomodoroSession::where('user_id', $user->id)->count();
            $focusSuccessRate = $totalSessions > 0 ? round(($successSessions / $totalSessions) * 100) : 0;
            
            // Streak calculation
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

            // Get AI insights from FocusAnalyticsService
            $insights = $analyticsService->getSimplifiedInsights($user->id);
            $dropHours = $analyticsService->detectFocusDropHours($user->id);
            $pattern = $analyticsService->getUserProductivityPattern($user->id);

            // Format focus drop hours
            $focusDropHoursText = !empty($dropHours) 
                ? implode(', ', array_column($dropHours, 'formatted_hour'))
                : 'Tidak ada penurunan signifikan';

            // Format top productive hour
            $topProductiveHour = !empty($pattern['most_productive_hours'])
                ? $pattern['most_productive_hours'][0]['formatted']
                : '-';

            return response()->json([
                'completionRate' => $completionRate,
                'totalCompleted' => $completedTasks,
                'totalTasks' => $totalTasks,
                'streak' => $streak,
                'totalFocusMinutes' => $totalFocusMinutes,
                'focusSuccessRate' => $focusSuccessRate,
                'focusDropHours' => $focusDropHoursText,
                'topProductiveHour' => $topProductiveHour,
                'aiInsights' => $insights,
                'taskRescheduledCount' => Task::where('user_id', $user->id)
                    ->where('auto_rescheduled_count', '>', 0)
                    ->count()
            ]);
        }

        // JIKA REQUEST BIASA, KEMBALIKAN HALAMAN KOSONG (SKELETON)
        return Inertia::render('Reports/Index');
    }
}