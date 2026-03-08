<?php

namespace App\Services;

use App\Models\User;
use App\Models\Task;
use Carbon\Carbon;

class AgentService
{
    protected $habitService;
    protected $predictionService;
    protected $autoSchedulerService;
    protected $bossBattleService;
    protected $guildService;
    protected $memoryService;

    public function __construct(
        \App\Services\HabitService $habitService,
        \App\Services\PredictionService $predictionService,
        \App\Services\AutoSchedulerService $autoSchedulerService,
        \App\Services\BossBattleService $bossBattleService,
        \App\Services\GuildService $guildService,
        \App\Services\MemoryService $memoryService
    )
    {
        $this->habitService = $habitService;
        $this->predictionService = $predictionService;
        $this->autoSchedulerService = $autoSchedulerService;
        $this->bossBattleService = $bossBattleService;
        $this->guildService = $guildService;
        $this->memoryService = $memoryService;
    }

    /**
     * Get the daily briefing message for the user.
     * 
     * @param User $user
     * @return array
     */
    public function getDailyBriefing(User $user): array
    {
        $riskAnalysis = $this->calculateRisk($user);
        $message = $this->generateMessage($user, $riskAnalysis);
        
        // Phase 3: Prediction & Rescue
        $probability = $this->predictionService->calculateSuccessProbability($user);
        
        // Use updated AutoSchedulerService for smarter rescue plans
        $rescuePlan = $this->autoSchedulerService->suggestRescuePlan($user);
        
        // Phase 4: Boss Battles
        $bosses = $this->bossBattleService->getActiveBosses($user);

        // Phase 5: Social Motivation
        $socialMessage = $this->getSocialMotivation($user);

        // Phase 6: Memory-based Personalization (NEW)
        $memoryInsights = $this->memoryService->generatePersonalizedAdvice($user);

        return [
            'message' => $message,
            'risk_level' => $riskAnalysis['level'],
            'action_needed' => $riskAnalysis['action'],
            'persona' => $this->habitService->getProductivityPersona($user),
            'success_probability' => $probability,
            'rescue_plan' => $rescuePlan,
            'active_bosses' => $bosses,
            'social_message' => $socialMessage,
            'memory_insights' => $memoryInsights, // NEW: Personalized behavior insights
        ];
    }

    /**
     * Calculate risk level based on deadlines, behavior, and time estimation.
     */
    public function calculateRisk(User $user): array
    {
        $today = Carbon::today();
        
        // 1. Get Active Tasks Due Today/Tomorrow
        $activeTasks = $user->tasks()
            ->where('status', '!=', 'done')
            ->where('due_date', '<=', $today->copy()->addDay())
            ->where('due_date', '>=', $today)
            ->get();

        $urgentCount = $activeTasks->count();
        $totalMinutes = $activeTasks->sum('estimated_minutes');

        // 2. Check for Overdue
        $overdueCount = $user->tasks()
            ->where('status', '!=', 'done')
            ->where('due_date', '<', $today)
            ->count();
            
        if ($overdueCount > 0) {
            return ['level' => 'HIGH', 'action' => 'recover_overdue', 'count' => $overdueCount];
        }

        // 3. Time-Based Overload (New)
        if ($totalMinutes > 300) { // > 5 Hours
             return ['level' => 'HIGH', 'action' => 'overload_time', 'hours' => round($totalMinutes / 60, 1)];
        }

        // 4. Single Heavy Task Detection (New)
        $heavyTask = $activeTasks->first(fn($task) => $task->estimated_minutes > 90);
        if ($heavyTask) {
             return ['level' => 'MEDIUM', 'action' => 'heavy_task', 'task_title' => $heavyTask->title];
        }

        // 5. Volume Overload
        if ($urgentCount > 2) {
            return ['level' => 'HIGH', 'action' => 'focus_urgent', 'count' => $urgentCount];
        }

        if ($urgentCount > 0) {
            $probability = $this->predictionService->calculateSuccessProbability($user);
            if ($probability < 50) {
                 return ['level' => 'HIGH', 'action' => 'rescue_needed', 'count' => $urgentCount];
            }
            return ['level' => 'MEDIUM', 'action' => 'plan_day', 'count' => $urgentCount];
        }

        // 6. Habit Peak Time
        if ($this->habitService->isPeakTime($user)) {
             return ['level' => 'LOW', 'action' => 'peak_time_focus', 'count' => 0];
        }

        return ['level' => 'LOW', 'action' => 'maintain_streak', 'count' => 0];
    }

    /**
     * Generate a natural language message.
     */
    private function generateMessage(User $user, array $risk): string
    {
        $greeting = $this->getGreeting();

        switch ($risk['action']) {
            case 'recover_overdue':
                return "Masa lalu biarlah berlalu. Fokus selesaikan SATU tugas tertunggak hari ini. Kamu bisa!";
            
            case 'overload_time':
                return "Waduh, ada sekitar {$risk['hours']} jam tugas hari ini. Jangan dipaksakan sekaligus, kita cicil yuk?";

            case 'heavy_task':
                return "Tugas '{$risk['task_title']}' terlihat cukup berat. Mau kita pecah jadi sesi kecil biar nggak burnout?";

            case 'focus_urgent':
                return "Mode serius ON 🚀 Ada {$risk['count']} deadline dekat. Kita mulai dari yang paling gampang dulu ya?";

            case 'rescue_needed':
                return "Kulihat jadwalmu agak padat. 🚨 Risiko burnout tinggi. Mau Agent bantu rapikan jadwal?";

            case 'plan_day':
                return "{$greeting} {$user->name}. Hari baru, semangat baru. Siap menaklukkan deadline hari ini?";

            case 'peak_time_focus':
                return "Golden Hour! ⚡ Energimu biasanya puncak sekarang. Gas 25 menit fokus?";

            case 'maintain_streak':
            default:
                if ($user->current_streak > 2) {
                    return "Streak {$user->current_streak} hari! 🔥 Keren banget. Pertahankan dengan 1 tugas kecil hari ini.";
                }
                return "Hari yang tenang. Kesempatan bagus buat curi start. Satu tugas selesai = satu kemenangan.";
        }
    }

    /**
     * Generate social motivation based on guild status
     */
    private function getSocialMotivation(User $user): ?string
    {
        $member = $user->guildMember;
        
        if (!$member) {
            return null; // User not in guild
        }

        $guild = $member->guild;
        $guildRank = $guild->getLeaderboardRank();
        $guildService = app(\App\Services\GuildService::class);
        $gamificationService = app(\App\Services\GamificationService::class);
        
        // Guild competition messages
        if ($guildRank <= 3) {
            return "Guild {$guild->name} hampir menang minggu ini! Ayo kontribusi XP! 🏆";
        }

        if ($guildRank <= 10) {
            return "Guild {$guild->name} ada di posisi #{$guildRank}. Mari naik ranking! ⚔️";
        }

        // User rank improvement
        $userRank = $gamificationService->getUserRank($user);
        if ($userRank <= 50) {
            return "Ranking kamu naik jadi #{$userRank}! Guild {$guild->name} bangga! 🚀";
        }

        // Weekly contribution
        if ($member->weekly_contribution_xp > 0) {
            return "Kontribusi mingguan kamu: {$member->weekly_contribution_xp} XP untuk Guild {$guild->name}! 💪";
        }

        // Default guild message
        return "Bersama Guild {$guild->name}, produktivitas lebih seru! 🎯";
    }

    private function getGreeting(): string
    {
        $hour = Carbon::now()->hour;
        if ($hour < 12) return "Pagi";
        if ($hour < 15) return "Siang";
        if ($hour < 18) return "Sore";
        return "Malam";
    }
}
