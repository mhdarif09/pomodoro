<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AutoChallengeService;
use App\Models\Challenge;
use Illuminate\Http\Request;
use Carbon\Carbon;

class ChallengeController extends Controller
{
    protected $challengeService;

    public function __construct(AutoChallengeService $challengeService)
    {
        $this->challengeService = $challengeService;
    }

    public function getActive(Request $request)
    {
        $user = $request->user();
        
        // Ensure daily challenges are assigned
        $this->challengeService->generateDailyChallenges();
        
        // Also ensure progress is up to date (optional, might be heavy)
        // $this->challengeService->checkProgress($user);

        $challenges = $user->challenges()
            ->wherePivot('completed', false)
            ->where('is_active', true)
            ->whereDate('starts_at', '<=', Carbon::today())
            ->whereDate('ends_at', '>=', Carbon::today())
            ->withPivot('progress')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $challenges
        ]);
    }

    public function getHistory(Request $request)
    {
        $user = $request->user();
        $history = $user->challenges()
            ->wherePivot('completed', true)
            ->orderByDesc('pivot_completed_at') // Access pivot column
            ->limit(20)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $history
        ]);
    }
}
