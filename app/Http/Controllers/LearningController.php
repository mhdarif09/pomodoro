<?php

namespace App\Http\Controllers;

use App\Models\PomodoroSession;
use App\Models\MiniModul;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LearningController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        
        // Get Pomodoro sessions for today
        $todaySessions = PomodoroSession::where('user_id', $user->id)
            ->whereDate('created_at', today())
            ->orderBy('created_at', 'desc')
            ->get();
        
        // Get Mini Moduls (simplified - no progress calculation)
        $miniModuls = MiniModul::with(['category', 'chapters'])
            ->where('is_published', true)
            ->get();
        
        // Get active tab from query parameter
        $activeTab = $request->query('tab', 'pomodoro');
        
        return Inertia::render('Learning/Index', [
            'todaySessions' => $todaySessions,
            'miniModuls' => $miniModuls,
            'activeTab' => $activeTab
        ]);
    }
}
