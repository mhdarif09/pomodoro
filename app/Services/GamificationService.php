<?php

namespace App\Services;

use App\Models\User;
use App\Models\Achievement;
use App\Models\Challenge;
use App\Models\UserPoint;
use App\Models\PointTransaction;
use App\Models\XpTransaction; // Added
use Carbon\Carbon; // Added
use Illuminate\Support\Facades\DB; // Added

class GamificationService
{
    /**
     * Assign a challenge to a user safely
     */
    public function assignChallenge(User $user, Challenge $challenge)
    {
        if (!$user->challenges()->where('challenge_id', $challenge->id)->exists()) {
            $user->challenges()->attach($challenge->id, [
                'progress' => 0,
                'completed' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
    public function awardXP(User $user, int $amount, string $reason, $source = null): array
    {
        return DB::transaction(function () use ($user, $amount, $reason, $source) {
            // Create XP Transaction
            XpTransaction::create([
                'user_id' => $user->id,
                'amount' => $amount,
                'reason' => $reason,
                'source_type' => $source ? get_class($source) : null,
                'source_id' => $source ? $source->id : null,
            ]);

            // Update user stats
            $user->total_xp += $amount;
            $user->xp += $amount; // Current level XP

            // Check for level up
            $xpForNextLevel = $user->getXpForNextLevel();
            $leveledUp = false;
            $newLevel = $user->level;

            while ($user->xp >= $xpForNextLevel) {
                $user->xp -= $xpForNextLevel;
                $user->level++;
                $leveledUp = true;
                $newLevel = $user->level;
                $xpForNextLevel = $user->getXpForNextLevel(); // Update required XP for next level
            }

            $user->save();

            // Update gamification stats
            $user->gamificationStats()->increment('total_xp', $amount);

            // Record guild contribution (NEW)
            app(\App\Services\GuildService::class)->recordMemberContribution($user, $amount);

            return [
                'xp_awarded' => $amount,
                'leveled_up' => $leveledUp,
                'new_level' => $newLevel,
                'current_xp' => $user->xp,
                'xp_for_next_level' => $xpForNextLevel,
            ];
        });
    }
    
    // I'll do this in chunks.
    
    /**
     * Award Points to a user
     */
    public function awardPoints(User $user, int $amount, string $reason, $source = null): array
    {
        return DB::transaction(function () use ($user, $amount, $reason, $source) {
            // Create Point transaction
            PointTransaction::create([
                'user_id' => $user->id,
                'amount' => $amount,
                'type' => 'earned',
                'source_type' => $source ? get_class($source) : null,
                'source_id' => $source ? $source->id : null,
                'description' => $reason,
            ]);

            // Update user points
            $userPoint = UserPoint::firstOrCreate(
                ['user_id' => $user->id],
                ['current_points' => 0, 'lifetime_points' => 0]
            );
            
            $userPoint->current_points += $amount;
            $userPoint->lifetime_points += $amount;
            $userPoint->save();

            return [
                'points_awarded' => $amount,
                'current_points' => $userPoint->current_points,
            ];
        });
    }

    /**
     * Update user's streak
     */



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

            // Update gamification stats
            $user->gamificationStats()->update([
                'streak' => $user->current_streak,
                'highest_streak' => $user->longest_streak,
            ]);

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
     * Update challenge progress for a user (Absolute Percentage)
     */
    public function updateChallengeProgress(User $user, Challenge $challenge, int $progressPercent): array
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

        // Update progress (Use the higher value to prevent regression if calculation fluctuates?)
        // Actually, for daily challenges, it should track current state. If I uncheck a task, progress drops.
        // So we should accept the new progress as is, but don't revoke completion if already done?
        // But we already returned if completed. So yes, just update.
        
        $newProgress = min(100, max(0, $progressPercent));
        $completed = $newProgress >= 100;

        $user->challenges()->updateExistingPivot($challenge->id, [
            'progress' => $newProgress,
            'completed' => $completed,
            'completed_at' => $completed ? now() : null,
        ]);

        // Award XP if completed
        if ($completed) {
            $this->awardXP($user, $challenge->xp_reward, 'challenge_completed', $challenge);

            if ($challenge->points_reward > 0) {
                $this->awardPoints($user, $challenge->points_reward, 'challenge_completed', $challenge);
            }
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
