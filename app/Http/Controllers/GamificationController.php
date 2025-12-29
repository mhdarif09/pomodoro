<?php

namespace App\Http\Controllers;

use App\Services\GamificationService;
use App\Models\Challenge;
use App\Models\Achievement;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GamificationController extends Controller
{
    protected $gamificationService;

    public function __construct(GamificationService $gamificationService)
    {
        $this->gamificationService = $gamificationService;
    }

    /**
     * Display the gamification dashboard
     */
    public function dashboard(Request $request)
    {
        $user = $request->user();

        // Update streak on dashboard visit
        $this->gamificationService->updateStreak($user);

        // Get user with relations
        $user->load(['challenges' => function($q) {
            $q->wherePivot('completed', false);
        }, 'achievements']);

        $assignedChallengeIds = $user->challenges->pluck('id')->toArray();
        $newChallengesToAttach = [];

        foreach ($activeChallenges as $challenge) {
            if (!in_array($challenge->id, $assignedChallengeIds)) {
                $newChallengesToAttach[$challenge->id] = [
                    'progress' => 0,
                    'completed' => false,
                ];
            }
        }

        if (!empty($newChallengesToAttach)) {
            \Illuminate\Support\Facades\DB::transaction(function () use ($user, $newChallengesToAttach) {
                $user->challenges()->attach($newChallengesToAttach);
            });
            $user->load('challenges'); // Refresh
        }

        // Get user's active challenges
        $userChallenges = $user->challenges->map(function ($challenge) {
            return [
                'id' => $challenge->id,
                'title' => $challenge->title,
                'description' => $challenge->description,
                'type' => $challenge->type,
                'xp_reward' => $challenge->xp_reward,
                'progress' => $challenge->pivot->progress,
                'completed' => $challenge->pivot->completed,
            ];
        });

        // Get all achievements with unlock status
        $userAchievementIds = $user->achievements->pluck('id')->toArray();
        $allAchievements = Achievement::all()->map(function ($achievement) use ($userAchievementIds) {
            $unlocked = in_array($achievement->id, $userAchievementIds);
            return [
                'id' => $achievement->id,
                'name' => $achievement->name,
                'slug' => $achievement->slug,
                'description' => $achievement->description,
                'icon' => $achievement->icon,
                'rarity' => $achievement->rarity,
                'xp_reward' => $achievement->xp_reward,
                'unlocked' => $unlocked,
                'unlocked_at' => $unlocked ? $user->achievements->find($achievement->id)->pivot->unlocked_at : null,
            ];
        });

        // Get leaderboard
        $leaderboard = $this->gamificationService->getLeaderboard(50);
        
        // Get user rank
        $userRank = $this->gamificationService->getUserRank($user);

        // Calculate XP for next level
        $user->xp_for_next_level = $user->getXpForNextLevel();

        return Inertia::render('Gamification/Dashboard', [
            'challenges' => $userChallenges,
            'achievements' => $allAchievements,
            'leaderboard' => $leaderboard,
            'userRank' => $userRank,
        ]);
    }

    /**
     * Get available challenges
     */
    public function challenges(Request $request)
    {
        $challenges = Challenge::where('is_active', true)->get();

        return response()->json([
            'challenges' => $challenges,
        ]);
    }

    /**
     * Get user's achievements
     */
    public function achievements(Request $request)
    {
        $user = $request->user();
        $achievements = $user->achievements()->get();

        return response()->json([
            'achievements' => $achievements,
        ]);
    }

    /**
     * Get leaderboard
     */
    public function leaderboard(Request $request)
    {
        $period = $request->get('period', 'all_time'); // 'all_time' or 'weekly'
        $limit = $request->get('limit', 100);

        $leaderboard = $this->gamificationService->getLeaderboard($limit, $period);

        return response()->json([
            'leaderboard' => $leaderboard,
        ]);
    }
}
