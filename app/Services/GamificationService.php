<?php

namespace App\Services;

use App\Models\User;
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
    public function awardXP(User $user, int $amount, string $reason, $source = null): array
    {
        return DB::transaction(function () use ($user, $amount, $reason, $source) {
            // Create XP transaction
            XpTransaction::create([
                'user_id' => $user->id,
                'amount' => $amount,
                'reason' => $reason,
                'source_type' => $source ? get_class($source) : null,
                'source_id' => $source ? $source->id : null,
            ]);

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
            }

            $user->save();

            // Check for achievements after XP award
            $newAchievements = $this->checkAchievements($user);

            return [
                'xp_awarded' => $amount,
                'leveled_up' => $leveledUp,
                'new_level' => $newLevel,
                'current_xp' => $user->xp,
                'xp_for_next_level' => $user->getXpForNextLevel(),
                'new_achievements' => $newAchievements,
            ];
        });
    }

    /**
     * Update user's streak
     */
    public function updateStreak(User $user): array
    {
        $today = Carbon::today();
        return DB::transaction(function () use ($user, $today) {
            if (!$user->last_active_date) {
                // First activity
                $user->current_streak = 1;
                $user->longest_streak = 1;
                $user->last_active_date = $today;
            } elseif (Carbon::parse($user->last_active_date)->isSameDay($today)) {
                // Already active today, no change
                return [
                    'streak_updated' => false,
                    'current_streak' => $user->current_streak,
                ];
            } elseif (Carbon::parse($user->last_active_date)->isYesterday()) {
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
        });
    }

    /**
     * Check and unlock achievements for a user
     */
    public function checkAchievements(User $user): array
    {
        $newAchievements = [];
        $allAchievements = Achievement::all();
        $existingAchievementIds = $user->achievements()->pluck('achievement_id')->toArray();

        DB::transaction(function () use ($user, $allAchievements, $existingAchievementIds, &$newAchievements) {
            foreach ($allAchievements as $achievement) {
                // Skip if already unlocked
                if (in_array($achievement->id, $existingAchievementIds)) {
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
        });

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
