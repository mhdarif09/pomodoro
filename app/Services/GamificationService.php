<?php

namespace App\Services;

use App\Models\User;
use App\Models\Skill;
use App\Models\Achievement;
use App\Models\Challenge;
use App\Models\XpTransaction;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class GamificationService
{
    /**
     * Award XP to a user and handle level ups
     */
    /**
     * Award XP to a user and handle level ups
     */
    public function awardXP(User $user, int $amount, string $reason, $source = null, ?Skill $skill = null): array
    {
        // ... existing XP logic ...
        
        // Log to Memory Agent
        $memoryService = app(\App\Services\MemoryAgentService::class);
        $memoryService->log($user, 'xp_gained', [
            'amount' => $amount,
            'reason' => $reason,
            'source_type' => $source ? get_class($source) : null
        ]);

        // Create XP transaction
        XpTransaction::create([
            'user_id' => $user->id,
            'amount' => $amount,
            'reason' => $reason,
            'source_type' => $source ? get_class($source) : null,
            'source_id' => $source ? $source->id : null,
        ]);
        
        // Guild Contribution (Social Agent)
        $socialService = app(\App\Services\SocialGamificationService::class);
        $socialService->contributeToQuest($user, 'total_xp', $amount);

        // Update user XP
        $user->xp += $amount;
        $user->total_xp += $amount;

        $leveledUp = false;
        $newLevel = $user->level;

        // Check for level up
        while ($user->xp >= $user->getXpForNextLevel()) {
            $user->xp -= $user->getXpForNextLevel();
            $user->level += 1;
            $leveledUp = true;
            $newLevel = $user->level;
            
            $memoryService->log($user, 'level_up', ['new_level' => $newLevel]);
        }

        $user->save();

        // Handle Skill XP
        $skillResult = [];
        if ($skill) {
            $skillResult = $this->awardSkillXP($user, $skill, $amount);
        }

        // Check for achievements after XP award
        $newAchievements = $this->checkAchievements($user);

        return [
            'xp_awarded' => $amount,
            'leveled_up' => $leveledUp,
            'new_level' => $newLevel,
            'current_xp' => $user->xp,
            'xp_for_next_level' => $user->getXpForNextLevel(),
            'new_achievements' => $newAchievements,
            'skill_result' => $skillResult,
        ];
    }

    /**
     * Award XP to a specific skill
     */
    private function awardSkillXP(User $user, Skill $skill, int $amount): array
    {
        $userSkill = $user->skills()->where('skill_id', $skill->id)->first();
        
        if (!$userSkill) {
            $user->skills()->attach($skill->id, ['level' => 1, 'xp' => 0, 'total_xp' => 0]);
            $userSkill = $user->skills()->where('skill_id', $skill->id)->first();
        }

        $pivot = $userSkill->pivot;
        $pivot->xp += $amount;
        $pivot->total_xp += $amount;

        $leveledUp = false;
        
        // Simple skill leveling curve: Level * 100
        $xpRequired = $pivot->level * 100;

        while ($pivot->xp >= $xpRequired) {
            $pivot->xp -= $xpRequired;
            $pivot->level += 1;
            $leveledUp = true;
            $xpRequired = $pivot->level * 100;
        }

        $user->skills()->updateExistingPivot($skill->id, [
            'level' => $pivot->level,
            'xp' => $pivot->xp,
            'total_xp' => $pivot->total_xp,
        ]);

        return [
            'skill_name' => $skill->name,
            'leveled_up' => $leveledUp,
            'new_level' => $pivot->level,
        ];
    }

    /**
     * Update user's streak
     */
    public function updateStreak(User $user): array
    {
        $today = Carbon::today();
        $lastActive = $user->last_active_date ? Carbon::parse($user->last_active_date) : null;

        if (!$lastActive) {
            // First activity
            $user->current_streak = 1;
            $user->longest_streak = 1;
            $user->last_active_date = $today;
        } elseif ($lastActive->isSameDay($today)) {
            // Already active today, no change
            return [
                'streak_updated' => false,
                'current_streak' => $user->current_streak,
            ];
        } elseif ($lastActive->isYesterday()) {
            // Consecutive day - increase streak
            $user->current_streak += 1;
            if ($user->current_streak > $user->longest_streak) {
                $user->longest_streak = $user->current_streak;
            }
            $user->last_active_date = $today;

            // Award streak bonus XP
            $bonusXP = 5 * $user->current_streak; // Bonus increases with streak
            $this->awardXP($user, $bonusXP, 'streak_bonus');
        } else {
            // Streak broken
            $user->current_streak = 1;
            $user->last_active_date = $today;
        }

        $user->save();

        return [
            'streak_updated' => true,
            'current_streak' => $user->current_streak,
            'longest_streak' => $user->longest_streak,
        ];
    }

    /**
     * Check and unlock achievements for a user
     */
    public function checkAchievements(User $user): array
    {
        $newAchievements = [];
        $allAchievements = Achievement::all();

        foreach ($allAchievements as $achievement) {
            // Skip if already unlocked
            if ($user->achievements()->where('achievement_id', $achievement->id)->exists()) {
                continue;
            }

            // Check if criteria is met
            if ($this->criteriaMetForAchievement($user, $achievement)) {
                $user->achievements()->attach($achievement->id, [
                    'unlocked_at' => now(),
                ]);

                // Award achievement XP
                if ($achievement->xp_reward > 0) {
                    $this->awardXP($user, $achievement->xp_reward, 'achievement_unlocked', $achievement);
                }

                $newAchievements[] = $achievement;
            }
        }

        return $newAchievements;
    }

    /**
     * Check if a user meets criteria for an achievement
     */
    private function criteriaMetForAchievement(User $user, Achievement $achievement): bool
    {
        $criteria = $achievement->criteria;

        foreach ($criteria as $key => $value) {
            $met = match ($key) {
                'tasks_completed' => $user->tasks()->where('status', 'completed')->count() >= $value,
                'pomodoros_completed' => $user->pomodoroSessions()->count() >= $value,
                'level_reached' => $user->level >= $value,
                'streak_days' => $user->longest_streak >= $value,
                'total_xp' => $user->total_xp >= $value,
                'reflections_written' => $user->reflections()->count() >= $value,
                default => false,
            };

            if (!$met) {
                return false;
            }
        }

        return true;
    }

    /**
     * Update challenge progress for a user
     */
    public function updateChallengeProgress(User $user, Challenge $challenge, int $progressIncrement = 1): array
    {
        $userChallenge = $user->challenges()
            ->where('challenge_id', $challenge->id)
            ->first();

        if (!$userChallenge) {
            // Assign challenge if not already assigned
            $user->challenges()->attach($challenge->id, [
                'progress' => 0,
                'completed' => false,
            ]);
            $userChallenge = $user->challenges()->where('challenge_id', $challenge->id)->first();
        }

        if ($userChallenge->pivot->completed) {
            return [
                'challenge_completed' => false,
                'message' => 'Challenge already completed',
            ];
        }

        // Update progress
        $newProgress = min(100, $userChallenge->pivot->progress + $progressIncrement);
        $completed = $newProgress >= 100;

        $user->challenges()->updateExistingPivot($challenge->id, [
            'progress' => $newProgress,
            'completed' => $completed,
            'completed_at' => $completed ? now() : null,
        ]);

        // Award XP if completed
        if ($completed) {
            $this->awardXP($user, $challenge->xp_reward, 'challenge_completed', $challenge);
        }

        return [
            'challenge_completed' => $completed,
            'progress' => $newProgress,
            'xp_awarded' => $completed ? $challenge->xp_reward : 0,
        ];
    }

    /**
     * Get leaderboard
     */
    public function getLeaderboard(int $limit = 100, string $period = 'all_time'): array
    {
        $query = User::select('id', 'name', 'level', 'total_xp', 'current_streak')
            ->where('role', '!=', 'admin');

        if ($period === 'weekly') {
            // Get users with most XP gained this week
            $weekStart = Carbon::now()->startOfWeek();
            $query->withCount(['xpTransactions as weekly_xp' => function ($q) use ($weekStart) {
                $q->where('created_at', '>=', $weekStart)->select(DB::raw('SUM(amount)'));
            }])
            ->orderByDesc('weekly_xp');
        } else {
            // All-time leaderboard
            $query->orderByDesc('total_xp');
        }

        return $query->limit($limit)->get()->toArray();
    }

    /**
     * Get user rank
     */
    public function getUserRank(User $user): int
    {
        return User::where('total_xp', '>', $user->total_xp)
            ->where('role', '!=', 'admin')
            ->count() + 1;
    }
}
