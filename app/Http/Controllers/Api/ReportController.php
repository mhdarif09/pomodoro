<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\ProductivityStatsService;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;

class ReportController extends Controller
{
    protected $statsService;

    public function __construct(ProductivityStatsService $statsService)
    {
        $this->statsService = $statsService;
    }

    public function downloadWeeklyReport(Request $request)
    {
        $user = $request->user();

        if (!$user->is_premium) {
            return response()->json(['message' => 'Premium required'], 403);
        }

        $stats = $this->statsService->getDailyStats($user);
        $trends = $this->statsService->getWeeklyTrends($user);
        $insights = $this->statsService->getInsights($user);

        // Calculate total weekly minutes
        $totalWeeklyMinutes = collect($trends)->sum('focus_minutes');
        $totalWeeklyTasks = collect($trends)->sum('tasks_completed');
        
        // AI Comment Logic (Simple Rule-based for now)
        $comment = "Minggu yang luar biasa! Pertahankan konsistensi ini.";
        if ($totalWeeklyMinutes < 60) {
            $comment = "Mulailah dengan langkah kecil. Coba teknik Pomodoro 25 menit hari ini.";
        } elseif ($totalWeeklyMinutes > 600) {
            $comment = "Wow! Kamu benar-benar 'Time Master' minggu ini. Jangan lupa istirahat ya!";
        }

        $data = [
            'user' => $user,
            'date_range' => Carbon::now()->subDays(6)->format('d M') . ' - ' . Carbon::now()->format('d M Y'),
            'stats' => $stats,
            'trends' => $trends,
            'insights' => $insights,
            'total_minutes' => $totalWeeklyMinutes,
            'total_tasks' => $totalWeeklyTasks,
            'ai_comment' => $comment
        ];

        $pdf = Pdf::loadView('reports.productivity-weekly', $data);

        return $pdf->download('Productivity-Report-' . Carbon::now()->format('Y-m-d') . '.pdf');
    }
}
