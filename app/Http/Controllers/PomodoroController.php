<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Models\PomodoroSession;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class PomodoroController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        return Inertia::render('Pomodoro/Index', [
            'isPremium' => $user->is_premium || $user->role === 'admin',
            'plans' => \App\Models\Plan::select('id', 'name', 'price', 'duration')->get(),
        ]);
    }

    public function custom()
    {
        $user = auth()->user();

        // Authorization check
        if (!($user->is_premium || $user->role === 'admin')) {
            Log::warning("Unauthorized custom pomodoro access attempt", ['user_id' => $user->id]);
            abort(403, 'Akses hanya untuk user premium atau admin.');
        }

        return Inertia::render('Pomodoro/Custom');
    }

    public function store(Request $request)
    {
        $userId = auth()->id();
        
        // Rate limiting: Prevent spam session creation
        $recentSessions = PomodoroSession::where('user_id', $userId)
            ->where('created_at', '>=', now()->subMinutes(1))
            ->count();
            
        if ($recentSessions >= 5) {
            Log::warning("Too many pomodoro sessions created", ['user_id' => $userId]);
            return back()->withErrors(['msg' => 'Terlalu banyak session dibuat. Tunggu sebentar.']);
        }

        // Comprehensive validation with security limits
        $validated = $request->validate([
            'focus_minutes' => 'required|integer|min:1|max:180', // Max 3 hours
            'break_minutes' => 'required|integer|min:0|max:60',  // Max 1 hour
            'started_at' => 'required|date|before_or_equal:now', // Cannot be future
            'ended_at' => 'required|date|after:started_at|before_or_equal:now',
            'blocked_urls' => 'nullable|array|max:100', // Max 100 URLs
            'blocked_urls.*' => 'url|max:500', // Each URL max 500 chars
            'tab_switches' => 'required|integer|min:0|max:10000', // Reasonable max
            'ai_questions_asked' => 'required|integer|min:0|max:1000', // Reasonable max
        ]);

        // Validate duration is reasonable (max 24 hours)
        $startedAt = Carbon::parse($validated['started_at']);
        $endedAt = Carbon::parse($validated['ended_at']);
        $durationHours = $endedAt->diffInHours($startedAt);
        
        if ($durationHours > 24) {
            Log::warning("Suspicious pomodoro duration", [
                'user_id' => $userId,
                'duration_hours' => $durationHours
            ]);
            return back()->withErrors(['msg' => 'Durasi session tidak valid (max 24 jam).']);
        }

        // Sanitize blocked URLs
        $blockedUrls = $validated['blocked_urls'] ?? [];
        $sanitizedUrls = array_map(function($url) {
            return filter_var($url, FILTER_SANITIZE_URL);
        }, $blockedUrls);

        // Remove any invalid URLs
        $sanitizedUrls = array_filter($sanitizedUrls, function($url) {
            return filter_var($url, FILTER_VALIDATE_URL);
        });

        try {
            PomodoroSession::create([
                'user_id'        => $userId,
                'focus_minutes'  => (int) $validated['focus_minutes'],
                'break_minutes'  => (int) $validated['break_minutes'],
                'started_at'     => $startedAt->format('Y-m-d H:i:s'),
                'ended_at'       => $endedAt->format('Y-m-d H:i:s'),
                'blocked_urls'   => json_encode(array_values($sanitizedUrls)),
                'tab_switches'   => (int) $validated['tab_switches'],
                'ai_questions_asked' => (int) $validated['ai_questions_asked'],
            ]);

            Log::info("Pomodoro session created", [
                'user_id' => $userId,
                'focus_minutes' => $validated['focus_minutes'],
                'duration_hours' => round($durationHours, 2)
            ]);

            return redirect()->route('pomodoro.index')->with('success', 'Session saved!');
            
        } catch (\Exception $e) {
            Log::error("Failed to create pomodoro session", [
                'user_id' => $userId,
                'error' => $e->getMessage()
            ]);
            
            return back()->withErrors(['msg' => 'Gagal menyimpan session. Silakan coba lagi.']);
        }
    }
}
