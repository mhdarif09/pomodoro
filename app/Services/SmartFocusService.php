<?php

namespace App\Services;

use App\Models\FocusPreference;
use App\Models\Task;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class SmartFocusService
{
    /**
     * Get the top N suggested focus tasks for a user.
     * Excludes tasks already focused today and completed tasks.
     */
    public function getSuggestedTasks(User $user, int $limit = 3, ?int $guildId = null): Collection
    {
        $today = today()->toDateString();

        // Get candidate tasks (uncompleted, not already focused today)
        $query = $user->tasks()
            ->where('is_completed', false)
            ->where(function ($q) use ($today) {
                $q->whereNull('focus_date')
                  ->orWhereDate('focus_date', '!=', $today);
            })
            ->with('subtasks');

        if ($guildId) {
            $query->where('guild_id', $guildId);
        } else {
            $query->whereNull('guild_id'); // Personal tasks only
        }

        $candidates = $query->get();

        if ($candidates->isEmpty()) {
            return collect();
        }

        // Load user preference patterns (cached for 10 min)
        $preferences = $this->getUserPreferenceWeights($user);

        // Score each task
        $scored = $candidates->map(function ($task) use ($user, $preferences) {
            $score = $this->getTaskScore($task, $user, $preferences);
            $reasons = $this->getScoreReasons($task);
            $task->focus_score = round($score, 1);
            $task->focus_reasons = $reasons;
            return $task;
        });

        // Sort descending by score, take top N
        return $scored->sortByDesc('focus_score')->take($limit)->values();
    }

    /**
     * Compute focus score (0-100) for a single task.
     */
    public function getTaskScore(Task $task, User $user, ?array $preferences = null): float
    {
        if ($preferences === null) {
            $preferences = $this->getUserPreferenceWeights($user);
        }

        $score = 0;

        // 1. Deadline Proximity (max 35 points)
        $score += $this->scoreDeadline($task) * $preferences['deadline_weight'];

        // 2. Stagnancy — how long untouched (max 25 points)
        $score += $this->scoreStagnancy($task) * $preferences['stagnancy_weight'];

        // 3. Priority (max 20 points)
        $score += $this->scorePriority($task) * $preferences['priority_weight'];

        // 4. Last Worked / Recency (max 10 points)
        $score += $this->scoreRecency($task) * $preferences['recency_weight'];

        // 5. User Preference Learning Bonus (max 10 points)
        $score += $this->scoreLearning($task, $user) * $preferences['learning_weight'];

        return min(100, max(0, $score));
    }

    /**
     * Record a user's choice for adaptive learning.
     */
    public function recordUserChoice(User $user, Task $task, string $action): void
    {
        $daysUntilDeadline = $task->due_date 
            ? Carbon::today()->diffInDays(Carbon::parse($task->due_date), false) 
            : null;

        $stagnancyDays = Carbon::parse($task->updated_at)->diffInDays(now());

        FocusPreference::create([
            'user_id' => $user->id,
            'task_id' => $task->id,
            'action' => $action,
            'task_priority' => $task->priority,
            'task_days_until_deadline' => $daysUntilDeadline,
            'task_stagnancy_days' => $stagnancyDays,
        ]);

        // Invalidate preference cache
        Cache::forget("focus_prefs:{$user->id}");
    }

    // =========================================================================
    // SCORING COMPONENTS
    // =========================================================================

    /**
     * Deadline proximity score (0-1 normalized).
     * Overdue = 1.0, Due today = 0.95, Due tomorrow = 0.8, etc.
     */
    private function scoreDeadline(Task $task): float
    {
        if (!$task->due_date) return 0.1; // No deadline = low urgency

        $daysUntil = Carbon::today()->diffInDays(Carbon::parse($task->due_date), false);

        if ($daysUntil < 0) return 1.0;     // Overdue
        if ($daysUntil === 0) return 0.95;   // Due today
        if ($daysUntil === 1) return 0.8;    // Tomorrow
        if ($daysUntil <= 3) return 0.6;     // This week
        if ($daysUntil <= 7) return 0.4;     // Next week
        if ($daysUntil <= 14) return 0.2;    // 2 weeks
        return 0.05;                          // Far away
    }

    /**
     * Stagnancy score (0-1 normalized).
     * Longer untouched = higher score.
     */
    private function scoreStagnancy(Task $task): float
    {
        $daysSinceUpdate = Carbon::parse($task->updated_at)->diffInDays(now());

        if ($daysSinceUpdate >= 14) return 1.0;
        if ($daysSinceUpdate >= 7) return 0.8;
        if ($daysSinceUpdate >= 3) return 0.5;
        if ($daysSinceUpdate >= 1) return 0.2;
        return 0.0; // Updated today
    }

    /**
     * Priority score (0-1 normalized).
     */
    private function scorePriority(Task $task): float
    {
        return match ($task->priority) {
            'Mendesak' => 1.0,
            'Tinggi'   => 1.0,
            'Sedang'   => 0.6,
            'Rendah'   => 0.25,
            default    => 0.4,
        };
    }

    /**
     * Recency score (0-1 normalized).
     * Tasks user was recently working on get a boost.
     */
    private function scoreRecency(Task $task): float
    {
        // In-progress tasks get high recency
        if ($task->status === 'in_progress') return 1.0;

        // Recently updated but not stagnant — moderate boost
        $daysSinceUpdate = Carbon::parse($task->updated_at)->diffInDays(now());
        if ($daysSinceUpdate <= 1) return 0.7;
        if ($daysSinceUpdate <= 3) return 0.3;
        return 0.0;
    }

    /**
     * Adaptive learning score (0-1 normalized).
     * Looks at user's historical acceptance patterns for similar tasks.
     */
    private function scoreLearning(Task $task, User $user): float
    {
        $prefs = FocusPreference::where('user_id', $user->id)
            ->where('created_at', '>=', now()->subDays(30))
            ->get();

        if ($prefs->isEmpty()) return 0.5; // Neutral when no data

        // Check: does user tend to pick tasks with this priority?
        $samePriority = $prefs->where('task_priority', $task->priority);
        if ($samePriority->isNotEmpty()) {
            $acceptRate = $samePriority->where('action', 'accepted')->count() / $samePriority->count();
            return $acceptRate;
        }

        return 0.5;
    }

    // =========================================================================
    // USER PREFERENCE WEIGHTS (ADAPTIVE)
    // =========================================================================

    /**
     * Get user-specific weights for scoring factors.
     * Adapts based on historical behavior. Cached 10 min.
     */
    private function getUserPreferenceWeights(User $user): array
    {
        return Cache::remember("focus_prefs:{$user->id}", 600, function () use ($user) {
            // Default weights
            $defaults = [
                'deadline_weight'  => 35,
                'stagnancy_weight' => 25,
                'priority_weight'  => 20,
                'recency_weight'   => 10,
                'learning_weight'  => 10,
            ];

            $prefs = FocusPreference::where('user_id', $user->id)
                ->where('created_at', '>=', now()->subDays(60))
                ->get();

            if ($prefs->count() < 10) return $defaults; // Not enough data

            // Analyze what types of tasks the user tends to accept
            $accepted = $prefs->where('action', 'accepted');
            
            if ($accepted->isEmpty()) return $defaults;

            // If user mostly accepts deadline-close tasks, boost deadline weight
            $avgDeadlineDays = $accepted->whereNotNull('task_days_until_deadline')->avg('task_days_until_deadline');
            $avgStagnancy = $accepted->whereNotNull('task_stagnancy_days')->avg('task_stagnancy_days');

            // Adaptive tweaking
            if ($avgDeadlineDays !== null && $avgDeadlineDays < 3) {
                $defaults['deadline_weight'] = 40;
                $defaults['stagnancy_weight'] = 20;
            }

            if ($avgStagnancy !== null && $avgStagnancy > 7) {
                $defaults['stagnancy_weight'] = 30;
                $defaults['deadline_weight'] = 30;
            }

            // If user prefers high priority
            $highPriorityRate = $accepted->whereIn('task_priority', ['Tinggi', 'Mendesak'])->count() / max(1, $accepted->count());
            if ($highPriorityRate > 0.7) {
                $defaults['priority_weight'] = 25;
                $defaults['learning_weight'] = 5;
            }

            return $defaults;
        });
    }

    // =========================================================================
    // REASON LABELS (for frontend display)
    // =========================================================================

    /**
     * Get human-readable reasons for why this task was suggested.
     */
    private function getScoreReasons(Task $task): array
    {
        $reasons = [];

        // Deadline
        if ($task->due_date) {
            $daysUntil = Carbon::today()->diffInDays(Carbon::parse($task->due_date), false);
            if ($daysUntil < 0) {
                $reasons[] = ['icon' => '🔴', 'text' => 'Sudah melewati deadline!'];
            } elseif ($daysUntil === 0) {
                $reasons[] = ['icon' => '🔥', 'text' => 'Deadline hari ini!'];
            } elseif ($daysUntil === 1) {
                $reasons[] = ['icon' => '⚡', 'text' => 'Deadline besok!'];
            } elseif ($daysUntil <= 3) {
                $reasons[] = ['icon' => '📅', 'text' => "Deadline {$daysUntil} hari lagi"];
            }
        }

        // Stagnancy
        $daysSinceUpdate = Carbon::parse($task->updated_at)->diffInDays(now());
        if ($daysSinceUpdate >= 7) {
            $reasons[] = ['icon' => '🕸️', 'text' => "Sudah {$daysSinceUpdate} hari tidak disentuh"];
        }

        // Priority
        if (in_array($task->priority, ['Tinggi', 'Mendesak'])) {
            $reasons[] = ['icon' => '🎯', 'text' => 'Prioritas tinggi'];
        }

        // In-progress
        if ($task->status === 'in_progress') {
            $reasons[] = ['icon' => '🔄', 'text' => 'Sedang dikerjakan'];
        }

        // Fallback
        if (empty($reasons)) {
            $reasons[] = ['icon' => '💡', 'text' => 'Disarankan berdasarkan pola kerjamu'];
        }

        return $reasons;
    }
}
