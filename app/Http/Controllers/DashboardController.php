<?php

namespace App\Http\Controllers;

use App\Models\Plan; // <-- Tambahkan ini
use Illuminate\Http\Request;
use App\Models\Subscription;
use App\Models\User;
use App\Models\PomodoroSession;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request) // <-- Tambahkan Request
    {
        $user = auth()->user();

        // 1. Cek langganan aktif
        $activeSubscription = Subscription::where('user_id', $user->id)
            ->where('status', 'paid')
            ->where('expired_at', '>=', now())
            ->latest('expired_at')
            ->first();

        // Cek apakah kita harus menampilkan tutorial setelah pembayaran sukses
        // Session 'show_tutorial' akan kita set di langkah berikutnya
        $showTutorial = $request->session()->get('show_tutorial', false);
        
        // 2. Jika user BELUM punya langganan aktif DAN tidak sedang dalam mode tutorial
        if (!$activeSubscription && !$showTutorial) {
            // Kirim user ke halaman pemilihan paket
            return Inertia::render('Dashboard', [
                'auth' => ['user' => $user],
                'subscription' => null,
                'plans' => Plan::all(), // <-- Kirim data semua plan
            ]);
        }

        // 3. Jika user SUDAH berlangganan atau baru selesai bayar (mode tutorial)
        // Lanjutkan untuk mengambil data statistik & leaderboard
        $sessionsQuery = $user->pomodoroSessions();
        $pomodoroStats = [
            'totalSessions' => $sessionsQuery->count(),
            'totalFocusMinutes' => $sessionsQuery->clone()->sum('focus_minutes'),
            'manuallyStoppedCount' => $sessionsQuery->clone()->where('manually_stopped', true)->count(),
            'tabSwitches' => $sessionsQuery->clone()->sum('tab_switches'),
        ];
        
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
            'subscription' => $activeSubscription,
            'leaderboard' => $leaderboard,
            'pomodoroStats' => $pomodoroStats,
            'plans' => [], // Kirim array kosong jika sudah subscribe
            'showTutorial' => $showTutorial, // <-- Prop baru untuk tutorial
        ]);
    }
}