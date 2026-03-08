<?php

namespace App\Http\Controllers;

use App\Models\PomodoroSession;
use App\Models\MiniModul;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class LearningController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        
        if (!$user->activePlan->has_learning_hub_access) {
            return redirect()->route('dashboard')->with('error', 'Fitur Learning Hub tidak tersedia di plan Anda. Silakan upgrade plan.');
        }

        $userId = $user->id;
        
        // Validate and sanitize tab parameter
        $validated = $request->validate([
            'tab' => 'nullable|string|in:pomodoro,modules', // Whitelist allowed tabs
        ]);
        
        $activeTab = $validated['tab'] ?? 'pomodoro';
        
        // Get Pomodoro sessions for today with authorization check
        $todaySessions = PomodoroSession::where('user_id', $userId)
            ->whereDate('created_at', today())
            ->orderBy('created_at', 'desc')
            ->limit(50) // Prevent excessive data load
            ->get();
        
        // Get Mini Moduls (only published)
        try {
            $query = MiniModul::with(['category', 'chapters'])->where('is_published', true);
            
            // If not premium, we might still want to show all but mark them locked, 
            // OR just limit to 3. The user said "cuman 3 terbuka".
            // Let's get all but the frontend will handle the "Locked" UI for index > 2 if not premium.
            $miniModuls = $query->limit(100)->get();
        } catch (\Exception $e) {
            Log::error("Failed to load mini moduls", [
                'user_id' => $userId,
                'error' => $e->getMessage()
            ]);
            $miniModuls = collect(); // Empty collection on error
        }
        
        return Inertia::render('Learning/Index', [
            'todaySessions' => $todaySessions,
            'miniModuls' => $miniModuls,
            'activeTab' => $activeTab
        ]);
    }
}
