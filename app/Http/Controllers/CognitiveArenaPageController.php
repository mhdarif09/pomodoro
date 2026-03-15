<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

use App\Models\PomodoroSession;
use App\Models\CognitiveArenaMatch;
use App\Models\Task;
use Carbon\Carbon;

class CognitiveArenaPageController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $stats = $user->cognitiveStat()->firstOrCreate(
            ['user_id' => $user->id],
            [
                'critical_thinking_level' => 1,
                'communication_level' => 1,
                'decision_speed' => 1,
                'consistency_score' => 1,
                'arena_rank' => 'Novice',
                'arena_xp' => 0,
            ]
        );

        $todayMatch = CognitiveArenaMatch::where('user_id', $user->id)
            ->whereDate('created_at', Carbon::today())
            ->with('simulation')
            ->first();

        return Inertia::render('CognitiveArena/Index', [
            'initialStats' => $stats,
            'isUnlocked' => true,
            'todayMatch' => $todayMatch
        ]);
    }
}
