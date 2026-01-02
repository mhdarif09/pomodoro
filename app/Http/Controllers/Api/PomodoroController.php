<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\FocusAnalyticsService;
use App\Models\PomodoroSession;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class PomodoroController extends Controller
{
    /**
     * Start a new pomodoro session (for sync)
     */
    public function startSession(Request $request)
    {
        $validated = $request->validate([
            'task_id' => 'nullable|exists:tasks,id',
            'duration_minutes' => 'required|integer|min:1|max:180',
        ]);

        // Check if user already has an active session
        $existingSession = PomodoroSession::where('user_id', auth()->id())
            ->whereNull('ended_at')
            ->first();

        if ($existingSession) {
            return response()->json([
                'success' => true,
                'message' => 'Session already running',
                'session' => $existingSession
            ]);
        }

        $session = PomodoroSession::create([
            'user_id' => auth()->id(),
            'task_id' => $validated['task_id'] ?? null,
            'focus_minutes' => $validated['duration_minutes'],
            'started_at' => now(),
            'ended_at' => null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Session started',
            'session' => $session
        ]);
    }

    /**
     * Get active session for sync
     */
    public function getActiveSession(Request $request)
    {
        $session = PomodoroSession::where('user_id', auth()->id())
            ->whereNull('ended_at')
            ->with('task')
            ->first();

        return response()->json([
            'success' => true,
            'session' => $session
        ]);
    }

    /**
     * Stop/complete active session
     */
    public function stopActiveSession(Request $request)
    {
        $validated = $request->validate([
            'break_minutes' => 'required|integer|min:0|max:60',
            'tab_switches' => 'required|integer|min:0',
            'ai_questions_asked' => 'required|integer|min:0',
        ]);

        $session = PomodoroSession::where('user_id', auth()->id())
            ->whereNull('ended_at')
            ->first();

        if (!$session) {
            return response()->json([
                'success' => false,
                'message' => 'No active session found'
            ], 404);
        }

        $session->update([
            'ended_at' => now(),
            'break_minutes' => $validated['break_minutes'],
            'tab_switches' => $validated['tab_switches'],
            'ai_questions_asked' => $validated['ai_questions_asked'],
        ]);

        // Award XP
        $gamificationService = app(\App\Services\GamificationService::class);
        $xpAmount = max(1, floor($session->focus_minutes / 2.5));
        $gamificationService->awardXP(auth()->user(), $xpAmount, 'pomodoro_focus', $session);
        $gamificationService->updateStreak(auth()->user());

        return response()->json([
            'success' => true,
            'message' => 'Session completed',
            'session' => $session,
            'xp_awarded' => $xpAmount
        ]);
    }
    public function store(Request $request)
    {
        $userId = auth()->id();
        
        // Rate limiting: Prevent spam session creation
        $recentSessions = PomodoroSession::where('user_id', $userId)
            ->where('created_at', '>=', now()->subMinutes(1))
            ->count();
            
        if ($recentSessions >= 5) {
            return response()->json(['message' => 'Terlalu banyak session dibuat. Tunggu sebentar.'], 429);
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
            'task_id' => 'nullable|exists:tasks,id',
        ]);

        // Validate duration is reasonable (max 24 hours)
        $startedAt = Carbon::parse($validated['started_at']);
        $endedAt = Carbon::parse($validated['ended_at']);
        $durationHours = $endedAt->diffInHours($startedAt);
        
        if ($durationHours > 24) {
            return response()->json(['message' => 'Durasi session tidak valid (max 24 jam).'], 422);
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
            return DB::transaction(function () use ($userId, $validated, $startedAt, $endedAt, $sanitizedUrls) {
                $session = PomodoroSession::create([
                    'user_id'        => $userId,
                    'focus_minutes'  => (int) $validated['focus_minutes'],
                    'break_minutes'  => (int) $validated['break_minutes'],
                    'started_at'     => $startedAt->format('Y-m-d H:i:s'),
                    'ended_at'       => $endedAt->format('Y-m-d H:i:s'),
                    'blocked_urls'   => json_encode(array_values($sanitizedUrls)),
                    'tab_switches'   => (int) $validated['tab_switches'],
                    'ai_questions_asked' => (int) $validated['ai_questions_asked'],
                    'task_id'        => $validated['task_id'] ?? null,
                ]);

                // Award XP for focus time (approx 10 XP per 25 mins)
                $gamificationService = app(\App\Services\GamificationService::class);
                $focusMinutes = (int) $validated['focus_minutes'];
                $xpAmount = max(1, floor($focusMinutes / 2.5));
                
                $user = auth()->user();
                $gamificationService->awardXP($user, $xpAmount, 'pomodoro_focus', $session);
                $gamificationService->updateStreak($user);
                $gamificationService->checkAchievements($user);

                return response()->json([
                    'message' => 'Session saved!',
                    'session' => $session,
                    'xp_awarded' => $xpAmount
                ], 201);
            });
            
        } catch (\Exception $e) {
            Log::error("Failed to create pomodoro session", [
                'user_id' => $userId,
                'error' => $e->getMessage()
            ]);
            
            return response()->json(['message' => 'Gagal menyimpan session.'], 500);
        }
    }

    /**
     * Get focus analytics for the authenticated user
     */
    public function getFocusAnalytics(Request $request, FocusAnalyticsService $analyticsService)
    {
        $userId = $request->user()->id;
        
        // Get simplified insights
        $insights = $analyticsService->getSimplifiedInsights($userId);
        
        return response()->json([
            'success' => true,
            'insights' => $insights
        ]);
    }
}
