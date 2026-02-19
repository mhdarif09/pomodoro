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
    protected $cashbackService;
    protected $agentService;

    public function __construct(
        GamificationService $gamificationService, 
        \App\Services\CashbackService $cashbackService,
        \App\Services\AgentService $agentService
    )
    {
        $this->gamificationService = $gamificationService;
        $this->cashbackService = $cashbackService;
        $this->agentService = $agentService;
    }

    /**
     * Display the gamification dashboard
     */
    public function dashboard(Request $request)
    {
        $user = $request->user();

        if (!$user->activePlan->has_gamification_access) {
            return redirect()->route('dashboard')->with('error', 'Fitur Gamification tidak tersedia di plan Anda. Silakan upgrade plan.');
        }

        // Update streak on dashboard visit
        $this->gamificationService->updateStreak($user);

        // OPTIMIZATION: Only fetch active challenges that user DOES NOT have yet
        // Instead of fetching ALL and iterating
        $activeChallengeIds = Challenge::where('is_active', true)->pluck('id');
        $userChallengeIds = $user->challenges()->pluck('challenges.id');
        
        $missingChallengeIds = $activeChallengeIds->diff($userChallengeIds);

        if ($missingChallengeIds->isNotEmpty()) {
             // Take only first 5 to prevent massive inserts if many are added
             $toAttach = $missingChallengeIds->take(5);
             $attachData = [];
             foreach($toAttach as $id) {
                 $attachData[$id] = ['progress' => 0, 'completed' => false];
             }
             $user->challenges()->syncWithoutDetaching($attachData);
        }

        // Get user's active challenges - LIMIT TO 10
        $userChallenges = $user->challenges()
            ->wherePivot('completed', false)
            ->limit(10) // LIMIT HERE
            ->get()
            ->map(function ($challenge) {
            return [
                'id' => $challenge->id,
                'title' => $challenge->title,
                'description' => $challenge->description,
                'type' => $challenge->type,
                'xp_reward' => $challenge->xp_reward,
                'points_reward' => $challenge->points_reward,
                'progress' => $challenge->pivot->progress,
                'completed' => $challenge->pivot->completed,
            ];
        });

        // Get all achievements with unlock status
        $userAchievementIds = $user->achievements->pluck('id')->toArray();
        $allAchievements = Achievement::all()->map(function ($achievement) use ($userAchievementIds, $user) {
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

        // Get Points Balance
        $pointsBalance = $this->cashbackService->getAvailablePoints($user);

        // Get Agent Briefing
        $agentBriefing = $this->agentService->getDailyBriefing($user);

        return Inertia::render('Gamification/Dashboard', [
            'challenges' => $userChallenges,
            'achievements' => $allAchievements,
            'leaderboard' => $leaderboard,
            'userRank' => $userRank,
            'pointsBalance' => $pointsBalance,
            'agentBriefing' => $agentBriefing,
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
    /**
     * Handle "Rescue" action from agent.
     */
    public function rescue(Request $request) 
    {
        set_time_limit(0);
        $user = $request->user();
        $plan = $request->input('plan');

        if (!$plan || !isset($plan['type'])) {
            return back()->with('error', 'Invalid rescue plan.');
        }

        if ($plan['type'] === 'breakdown') {
            $task = \App\Models\Task::find($plan['task_id']);
            if ($task && $task->user_id === $user->id) {
                // Call AI Service to generate subtasks
                $taskAIService = app(\App\Services\TaskAIService::class);
                $result = $taskAIService->suggestSubtasks($task);
                
                if ($result['success']) {
                    return back()->with('success', 'Tugas berhasil dipecah menjadi subtask!');
                }
            }
        }
        
        if ($plan['type'] === 'reschedule') {
            $taskIds = $plan['task_ids'] ?? [];
            $targetDate = $plan['target_date'] ?? now()->addDay()->toDateString();
            
            if (!empty($taskIds)) {
                $count = app(\App\Services\AutoSchedulerService::class)
                    ->applyReschedule($user, $taskIds, $targetDate);
                    
                return back()->with('success', "{$count} tugas berhasil digeser ke besok.");
            }
        }

        return back()->with('success', 'Rescue plan processed.');
    }
}
