<?php

namespace App\Services;

use App\Models\User;
use App\Models\UserActivityLog;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class MemoryAgentService
{
    /**
     * Log a user activity
     */
    public function log(User $user, string $type, array $details = []): void
    {
        UserActivityLog::create([
            'user_id' => $user->id,
            'activity_type' => $type,
            'details' => $details,
            'created_at' => now(),
        ]);
    }

    /**
     * Analyze user's best productivity hour (0-23)
     * Based on task completions and pomodoro sessions
     */
    public function getBestProductivityHour(User $user): int
    {
        // Query logs for completions
        $result = UserActivityLog::select(DB::raw('HOUR(created_at) as hour'), DB::raw('count(*) as count'))
            ->where('user_id', $user->id)
            ->whereIn('activity_type', ['task_completed', 'pomodoro_finished'])
            ->groupBy('hour')
            ->orderByDesc('count')
            ->first();

        return $result ? $result->hour : 9; // Default to 9 AM if no data
    }

    /**
     * Get productivity heatmap data (Day x Hour)
     */
    public function getProductivityHeatmap(User $user): array
    {
        $logs = UserActivityLog::select(
                DB::raw('DAYOFWEEK(created_at) as day'), 
                DB::raw('HOUR(created_at) as hour'), 
                DB::raw('count(*) as count')
            )
            ->where('user_id', $user->id)
            ->where('created_at', '>=', now()->subDays(30)) // Last 30 days
            ->whereIn('activity_type', ['task_completed', 'pomodoro_finished'])
            ->groupBy('day', 'hour')
            ->get();

        return $logs->toArray();
    }

    /**
     * Predict if user is at risk of missing deadlines or burnout
     */
    public function analyzeRisk(User $user): array
    {
        $riskLevel = 'low';
        $riskFactors = [];

        // 1. Check for inactivity
        $lastActivity = UserActivityLog::where('user_id', $user->id)->latest('created_at')->first();
        if ($lastActivity && $lastActivity->created_at->diffInDays(now()) > 3) {
            $riskLevel = 'medium';
            $riskFactors[] = 'Kehilangan momentum (tidak aktif > 3 hari)';
        }

        // 2. Check for upcoming deadlines vs completion rate
        $upcomingDeadlines = $user->tasks()
            ->where('is_completed', false)
            ->whereBetween('due_date', [now(), now()->addDays(3)])
            ->count();

        if ($upcomingDeadlines > 5) {
            $riskLevel = 'high';
            $riskFactors[] = "Overload: $upcomingDeadlines task deadline dalam 3 hari";
        }

        // 3. Check mood/reflections
        $recentReflections = $user->reflections()
            ->where('created_at', '>=', now()->subDays(7))
            ->orderByDesc('created_at')
            ->limit(3)
            ->get();
        
        // Simple sentiment check (mock)
        // In real AI, we would analyze the text content
        
        return [
            'level' => $riskLevel,
            'factors' => $riskFactors,
            'advice' => $this->getAdviceBasedOnRisk($riskLevel, $riskFactors)
        ];
    }

    /**
     * Analyze procrastination patterns
     * Returns a score 0-100 (High score = High Procrastination)
     */
    public function analyzeProcrastination(User $user): int
    {
        // Check for tasks that were created more than 3 days ago but are still in 'todo'
        $stagnantTasks = $user->tasks()
            ->where('status', 'todo')
            ->where('created_at', '<', now()->subDays(3))
            ->count();

        // Check for overdue tasks
        $overdueTasks = $user->tasks()
            ->where('is_completed', false)
            ->where('due_date', '<', now())
            ->count();

        // Score calculation (arbitrary weight)
        $score = ($stagnantTasks * 10) + ($overdueTasks * 20);
        return min(100, $score);
    }

    /**
     * Generate Smart Suggestions based on user state
     */
    public function getSmartSuggestions(User $user): array
    {
        $suggestions = [];
        $riskAnalysis = $this->analyzeRisk($user);
        $procrastinationScore = $this->analyzeProcrastination($user);
        $bestHour = $this->getBestProductivityHour($user);
        $currentHour = now()->hour;

        // 1. Procrastination Advice
        if ($procrastinationScore > 50) {
            $suggestions[] = [
                'type' => 'procrastination_alert',
                'message' => "Tumpukan tugas mulai tinggi. Coba teknik '5 Menit Saja' untuk tugas termudahmu.",
                'action' => 'filter_easy_tasks', // Frontend could interpret this
                'priority' => 'high'
            ];
        }

        // 2. Best Hour Advice
        if (abs($currentHour - $bestHour) <= 1) {
            $suggestions[] = [
                'type' => 'productivity_peak',
                'message' => "Ini adalah jam " . $bestHour . ":00, waktu emasmu! Fokus kerjakan tugas tersulit sekarang.",
                'action' => 'start_hard_task',
                'priority' => 'medium'
            ];
        }

        // 3. Risk Based Advice (from analyzeRisk)
        if ($riskAnalysis['level'] !== 'low') {
            $suggestions[] = [
                'type' => 'risk_management',
                'message' => $riskAnalysis['advice'],
                'action' => 'view_calendar',
                'priority' => 'high'
            ];
        }

        // 4. Consistency Advice
        if ($user->current_streak > 0) {
             $suggestions[] = [
                'type' => 'streak_keeper',
                'message' => "Streak " . $user->current_streak . " hari! Jangan putus rantai hari ini.",
                'action' => 'quick_pomodoro',
                'priority' => 'low'
            ];
        }

        // 5. Schedule Adjustment (New Feature)
        $scheduleAdvice = $this->analyzeSchedule($user);
        if ($scheduleAdvice) {
            array_unshift($suggestions, $scheduleAdvice); // Critical priority
        }

        // 6. Level Up Motivation (Growth Agent)
        $nextLevelXp = $user->getXpForNextLevel();
        if ($nextLevelXp > 0) {
            $remaining = $nextLevelXp - $user->total_xp; // Assuming total_xp is cumulative, or use calculate level boundaries
            // Actually usually calculate from current level start.
            // Let's rely on simple gap for now assuming formula implies total required.
            // $user->getXpForNextLevel() returns total needed for next level in User model?
            // Checking User model... it returns threshold.
            $gap = $nextLevelXp - $user->xp;
            
            if ($gap > 0 && $gap <= 150) { // If less than 150 XP needed (approx 3 tasks)
                $suggestions[] = [
                    'type' => 'level_up_near',
                    'message' => "Hanya butuh {$gap} XP lagi untuk Level Up! Selesaikan 3 tugas sekarang.",
                    'action' => 'filter_quick_tasks',
                    'priority' => 'high'
                ];
            }
        }

        // 7. Guild Motivation (Growth Agent)
        $guild = $user->guilds()->first(); // N+1 should be eager loaded in controller if possible, but singular here is fine
        if ($guild) {
            $activeQuest = $guild->quests()
                ->where('is_completed', false)
                ->where('expires_at', '>', now())
                ->first();
                
            if ($activeQuest) {
                $suggestions[] = [
                    'type' => 'guild_call',
                    'message' => "Guild '{$guild->name}' butuh bantuanmu di quest '{$activeQuest->title}'.",
                    'action' => 'go_to_guild',
                    'priority' => 'medium'
                ];
            }
        }

        // Sort by priority logic (simplified here)
        return $suggestions;
    }

    /**
     * Analyze schedule and suggest adjustments
     */
    public function analyzeSchedule(User $user): ?array
    {
        // 1. Check for immediate load (Due tomorrow)
        $dueTomorrow = $user->tasks()
            ->where('is_completed', false)
            ->whereDate('due_date', Carbon::tomorrow())
            ->get();
            
        $overdue = $user->tasks()
            ->where('is_completed', false)
            ->whereDate('due_date', '<', now())
            ->count();

        // Scenario: Overloaded for tomorrow
        if ($dueTomorrow->count() >= 3) {
            $bestHour = $this->getBestProductivityHour($user);
            return [
                'type' => 'schedule_adjustment',
                'message' => "Besok ada " . $dueTomorrow->count() . " deadline. Mau kita cicil sebagian di jam $bestHour:00 hari ini supaya besok lebih ringan?",
                'action' => 'reschedule_tasks',
                'priority' => 'critical'
            ];
        }

        // Scenario: Catch-up
        if ($overdue > 2) {
            return [
                'type' => 'schedule_adjustment',
                'message' => "Ada $overdue tugas terlambat. Jangan panik. Pilih 1 yang termudah untuk diselesaikan hari ini.",
                'action' => 'focus_one_task',
                'priority' => 'high'
            ];
        }

        return null;
    }

    private function getAdviceBasedOnRisk(string $level, array $factors): string
    {
        if ($level === 'high') {
            return "Kamu memiliki banyak deadline. Mari prioritaskan 3 task terpenting hari ini dan abaikan sisanya dulu.";
        }
        if ($level === 'medium') {
            return "Sudah lama tidak melihatmu aktif. Coba mulai dengan 1 sesi Pomodoro 25 menit hari ini?";
        }
        return "Pertahankan ritmenu! Kamu sedang dalam kondisi optimal.";
    }
}
