<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\UserCognitiveStat;
use App\Models\CognitiveSimulation;
use App\Models\CognitiveArenaMatch;
use App\Models\PomodoroSession;
use App\Models\Task;
use App\Services\CognitiveArenaService;
use Carbon\Carbon;

class CognitiveArenaController extends Controller
{
    protected CognitiveArenaService $arenaService;

    public function __construct(CognitiveArenaService $arenaService)
    {
        $this->arenaService = $arenaService;
    }

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
            ->first();

        return response()->json([
            'stats' => $stats,
            'is_unlocked' => true,
            'today_match' => $todayMatch ? $todayMatch->load('simulation') : null
        ]);
    }

    public function generate(Request $request)
    {
        $user = $request->user();
        $stats = $user->cognitiveStat;

        $todayMatch = CognitiveArenaMatch::where('user_id', $user->id)
            ->whereDate('created_at', Carbon::today())
            ->first();

        if ($todayMatch) {
            return response()->json(['simulation' => $todayMatch->simulation, 'match_id' => $todayMatch->id]);
        }

        $scenarioData = $this->arenaService->generateScenario($stats);
        if (!$scenarioData) {
            \Illuminate\Support\Facades\Log::error('Cognitive Arena Generation Failed: AI service returned null.', [
                'user_id' => $user->id,
            ]);
            return response()->json(['error' => 'Failed to generate scenario.'], 500);
        }

        $simulation = CognitiveSimulation::create([
            'user_id' => $user->id,
            'type' => $scenarioData['type'],
            'difficulty_level' => $scenarioData['difficulty_level'],
            'scenario_text' => $scenarioData['scenario_text'],
            'options' => $scenarioData['options'] ?? [],
            'correct_option' => $scenarioData['correct_option'] ?? '',
        ]);

        $match = CognitiveArenaMatch::create([
            'user_id' => $user->id,
            'simulation_id' => $simulation->id,
        ]);

        return response()->json(['simulation' => $simulation, 'match_id' => $match->id]);
    }

    public function submit(Request $request, $matchId)
    {
        $request->validate([
            'user_answer' => 'required|string',
            'time_taken_seconds' => 'required|integer',
        ]);

        $user = $request->user();
        $match = CognitiveArenaMatch::where('id', $matchId)->where('user_id', $user->id)->firstOrFail();

        if ($match->completed) {
            return response()->json(['error' => 'Match already completed.'], 400);
        }

        $stats = $user->cognitiveStat;
        $evalData = $this->arenaService->evaluateAnswer(
            $match->simulation->scenario_text,
            $match->simulation->options ?? [],
            $match->simulation->correct_option ?? '',
            $request->user_answer,
            $request->time_taken_seconds,
            $stats
        );

        if (!$evalData) {
            return response()->json(['error' => 'Failed to evaluate answer.'], 500);
        }

        $match->update([
            'user_answer' => $request->user_answer,
            'time_taken_seconds' => $request->time_taken_seconds,
            'ai_feedback_text' => $evalData['feedback_text'],
            'stat_changes' => $evalData['stat_changes'],
            'xp_earned' => $evalData['xp_earned'],
            'completed' => true,
        ]);

        if ($stats) {
            $stats->increment('critical_thinking_level', $evalData['stat_changes']['critical_thinking_level'] ?? 0);
            $stats->increment('communication_level', $evalData['stat_changes']['communication_level'] ?? 0);
            $stats->increment('decision_speed', $evalData['stat_changes']['decision_speed'] ?? 0);
            $stats->increment('arena_xp', $evalData['xp_earned']);
        }

        return response()->json([
            'match' => $match,
            'reflection_prompt' => $evalData['reflection_prompt'] ?? 'What did you learn from this scenario?'
        ]);
    }
}
