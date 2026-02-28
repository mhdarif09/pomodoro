<?php

namespace App\Services;

use App\Models\User;
use Carbon\Carbon;

class GamificationEngine
{
    /**
     * Award XP to a user based on specific actions.
     */
    public function awardXP(User $user, string $action): void
    {
        $xpToAward = 0;
        switch ($action) {
            case 'task_on_time':
                $xpToAward = 20;
                break;
            case 'task_late_1day':
                $xpToAward = 10;
                break;
            case 'task_late_more':
                $xpToAward = 5;
                break;
            case 'journal_entry':
                $xpToAward = 10;
                break;
            case 'streak_milestone_7':
            case 'streak_milestone_14':
            case 'streak_milestone_30':
                $xpToAward = 50;
                break;
            case 'guild_challenge':
                $xpToAward = 30;
                break;
        }

        if ($xpToAward > 0) {
            $stats = $user->gamificationStats;
            $stats->total_xp += $xpToAward;
            $stats->rank_points += $xpToAward;
            $stats->save();
            
            $this->recalculateRankPosition($user);
        }
    }

    /**
     * Recalculate streak after a daily qualifying action.
     */
    public function recalculateStreak(User $user, bool $isJournal = false): void
    {
        $stats = $user->gamificationStats;
        $today = Carbon::today();
        $yesterday = Carbon::yesterday();

        $lastActive = $stats->last_active_date;
        $statsToUpdate = [];

        if (!$lastActive || $lastActive->lt($yesterday)) {
            // Missed a day or first time
            if ($isJournal) {
                $statsToUpdate['journal_streak'] = 1;
            } else {
                $statsToUpdate['streak'] = 1;
            }
        } elseif ($lastActive->eq($yesterday)) {
            // Contiguous day
            if ($isJournal) {
                $statsToUpdate['journal_streak'] = $stats->journal_streak + 1;
            } else {
                $statsToUpdate['streak'] = $stats->streak + 1;
                if ($statsToUpdate['streak'] > $stats->highest_streak) {
                    $statsToUpdate['highest_streak'] = $statsToUpdate['streak'];
                }

                // Check milestones
                if ($statsToUpdate['streak'] == 7) {
                    $this->awardXP($user, 'streak_milestone_7');
                } elseif ($statsToUpdate['streak'] == 14) {
                    $this->awardXP($user, 'streak_milestone_14');
                } elseif ($statsToUpdate['streak'] == 30) {
                    $this->awardXP($user, 'streak_milestone_30');
                }
            }
        }
        
        // If they did the action today, streak is already counted, do nothing.

        $statsToUpdate['last_active_date'] = $today;
        
        $stats->update($statsToUpdate);
    }

    /**
     * Recalculate global rank position of a single user.
     * Note: In a large system this is better done via cron or an optimized query.
     */
    public function recalculateRankPosition(User $user): void
    {
        $stats = $user->gamificationStats;
        $currentPoints = $stats->rank_points;
        
        // Find how many users have more rank points
        $position = \App\Models\UserGamificationStat::where('rank_points', '>', $currentPoints)->count() + 1;
        
        $oldPosition = $stats->rank_position;
        if ($oldPosition != 0 && $oldPosition != $position) {
            $stats->last_rank_change = $oldPosition - $position; // Positive if rank improved
        }
        
        // Define Rank Title based on points (simple tiering)
        $title = 'Beginner';
        if ($currentPoints > 5000) $title = 'Master';
        elseif ($currentPoints > 2000) $title = 'Expert';
        elseif ($currentPoints > 500) $title = 'Executor';
        
        $stats->rank_position = $position;
        $stats->rank_title = $title;
        $stats->save();
    }

    /**
     * Get gap to user above and below in rank.
     */
    public function getRankGap(User $user): array
    {
        $stats = $user->gamificationStats;
        $points = $stats->rank_points;
        
        $above = \App\Models\UserGamificationStat::with('user')
            ->where('rank_points', '>', $points)
            ->orderBy('rank_points', 'asc')
            ->first();
            
        $below = \App\Models\UserGamificationStat::with('user')
            ->where('rank_points', '<', $points)
            ->orderBy('rank_points', 'desc')
            ->first();

        return [
            'above' => $above ? [
                'name' => $above->user->name,
                'rank_title' => $above->rank_title,
                'position' => $above->rank_position,
                'gap' => $above->rank_points - $points
            ] : null,
            'below' => $below ? [
                'name' => $below->user->name,
                'rank_title' => $below->rank_title,
                'position' => $below->rank_position,
                'gap' => $points - $below->rank_points
            ] : null,
        ];
    }

    /**
     * Check if user should get an identity trigger.
     */
    public function checkIdentityTrigger(User $user): ?array
    {
        if (!$user->gamificationStats) {
            return null;
        }

        $now = Carbon::now();
        $stats = $user->gamificationStats;
        
        $hasUnfinishedTasksToday = $user->tasks()->personal()->whereDate('due_date', Carbon::today())->where('is_completed', false)->exists();
        $hasCompletedTasksToday = $user->tasks()->personal()->whereDate('updated_at', Carbon::today())->where('is_completed', true)->exists();

        // 1. Streak almost broken (jam > 18.00)
        if ($stats->streak > 0 && !$hasCompletedTasksToday && $hasUnfinishedTasksToday && $now->hour >= 18) {
            return [
                'type' => 'streak_risk',
                'context' => "{$stats->streak} hari streak.",
                'urgency' => 'high'
            ];
        }

        // 2. Rank gap thin (gap <= 10 poin)
        $gap = $this->getRankGap($user);
        if (isset($gap['above']) && $gap['above'] && $gap['above']['gap'] <= 10) {
            $taskDueToday = $user->tasks()->personal()->whereDate('due_date', Carbon::today())->where('is_completed', false)->first();
            $taskName = $taskDueToday ? $taskDueToday->title : 'Task ini';
            
            return [
                'type' => 'rank_gap',
                'context' => "{$gap['above']['gap']} poin dari {$gap['above']['rank_title']} #{$gap['above']['position']}.",
                'task_name' => $taskName,
                'urgency' => 'medium'
            ];
        }
        
        // 3. (Optional future: Hampir masuk top guild)

        return null;
    }
}

