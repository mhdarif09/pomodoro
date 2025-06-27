<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Subscription;
use App\Models\User;
use App\Models\PomodoroSession; // <-- Import model PomodoroSession
use Illuminate\Support\Facades\DB; // <-- Import DB Facade untuk subquery
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        // 1. Ambil langganan aktif (logika ini sudah bagus, tidak perlu diubah)
        $subscription = Subscription::where('user_id', $user->id)
            ->where('status', 'paid')
            ->where('expired_at', '>=', now())
            ->latest('expired_at')
            ->first();

        // 2. Hitung statistik Pomodoro untuk pengguna saat ini
        $sessionsQuery = $user->pomodoroSessions();

        $pomodoroStats = [
            'totalSessions' => $sessionsQuery->count(),
            'totalFocusMinutes' => $sessionsQuery->clone()->sum('focus_minutes'),
            'manuallyStoppedCount' => $sessionsQuery->clone()->where('manually_stopped', true)->count(),
            'tabSwitches' => $sessionsQuery->clone()->sum('tab_switches'),
        ];
        
        // 3. Data untuk Leaderboard (disempurnakan dengan total menit fokus)
        // Menggunakan subquery untuk performa yang lebih baik daripada withCount/withSum
        $leaderboard = User::query()
            ->select('id', 'name')
            ->addSelect(DB::raw('(SELECT COUNT(*) FROM pomodoro_sessions WHERE pomodoro_sessions.user_id = users.id) as pomodoro_sessions_count'))
            ->addSelect(DB::raw('(SELECT SUM(focus_minutes) FROM pomodoro_sessions WHERE pomodoro_sessions.user_id = users.id) as total_focus_minutes'))
            ->orderByDesc('pomodoro_sessions_count')
            ->limit(10)
            ->get();

        // 4. Kirim semua data ke view Inertia
        return Inertia::render('Dashboard', [
            'auth' => ['user' => $user],
            'subscription' => $subscription,
            'leaderboard' => $leaderboard,
            'pomodoroStats' => $pomodoroStats, // <-- Tambahkan prop baru ini
        ]);
    }
}