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

        $activeMatch = CognitiveArenaMatch::where('user_id', $user->id)
            ->where('completed', false)
            ->first();

        return response()->json([
            'stats' => $stats,
            'is_unlocked' => true,
            'active_match' => $activeMatch ? $activeMatch->load('simulation') : null
        ]);
    }

    public function generate(Request $request)
    {
        $request->validate([
            'topic' => 'nullable|string|max:255',
            'difficulty' => 'nullable|string|max:255',
        ]);

        $user = $request->user();
        $stats = $user->cognitiveStat;

        $activeMatch = CognitiveArenaMatch::where('user_id', $user->id)
            ->where('completed', false)
            ->first();

        if ($activeMatch) {
            return response()->json(['simulation' => $activeMatch->simulation, 'match_id' => $activeMatch->id]);
        }

        $scenarioData = $this->arenaService->generateScenario($stats, $request->topic, $request->difficulty);
        if (!$scenarioData || !isset($scenarioData['questions'])) {
            \Illuminate\Support\Facades\Log::error('Cognitive Arena Generation Failed: AI service returned null or bad format.', [
                'user_id' => $user->id,
            ]);
            return response()->json(['error' => 'Failed to generate scenario.'], 500);
        }

        $simulation = CognitiveSimulation::create([
            'user_id' => $user->id,
            'type' => $scenarioData['type'],
            'difficulty_level' => $scenarioData['difficulty_level'],
            'scenario_text' => $scenarioData['scenario_text'],
            'questions' => $scenarioData['questions'],
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
            'user_answers' => 'required|array',
            'time_taken_seconds' => 'required|integer',
        ]);

        $user = $request->user();
        $match = CognitiveArenaMatch::where('id', $matchId)->where('user_id', $user->id)->firstOrFail();

        if ($match->completed) {
            return response()->json(['error' => 'Match already completed.'], 400);
        }

        $simulation = $match->simulation;
        $questions = $simulation->questions ?? [];
        $userAnswers = $request->user_answers;
        
        // Calculate raw score
        $score = 0;
        $correctCount = 0;
        foreach ($questions as $index => $q) {
            $expected = $q['correct_option'] ?? '';
            $actual = $userAnswers[$index] ?? '';
            if ($expected === $actual) {
                $correctCount++;
            }
        }
        if (count($questions) > 0) {
            $score = (int)(($correctCount / count($questions)) * 100);
        }

        $stats = $user->cognitiveStat;
        $evalData = $this->arenaService->evaluateAnswer(
            $simulation->scenario_text ?? '',
            $questions,
            $userAnswers,
            $score,
            $request->time_taken_seconds,
            $stats
        );

        if (!$evalData) {
            return response()->json(['error' => 'Failed to evaluate answers.'], 500);
        }

        $match->update([
            'user_answers' => $userAnswers,
            'score' => $score,
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
