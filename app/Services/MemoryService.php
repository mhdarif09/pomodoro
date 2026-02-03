<?php

namespace App\Services;

use App\Models\User;
use App\Models\PomodoroSession;
use App\Models\Task;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class MemoryService
{
    protected $habitService;

    public function __construct(HabitService $habitService)
    {
        $this->habitService = $habitService;
    }

    /**
     * Generate personalized advice based on user's behavior patterns
     */
    public function generatePersonalizedAdvice(User $user): ?array
    {
        // Require minimum data threshold
        $sessionCount = $user->pomodoroSessions()->where('created_at', '>=', now()->subDays(30))->count();
        $taskCount = $user->tasks()->where('created_at', '>=', now()->subDays(30))->count();

        if ($sessionCount < 10 || $taskCount < 5) {
            return null; // Insufficient data
        }

        $studyPatterns = $this->getStudyPatterns($user);
        $completionTrends = $this->getTaskCompletionTrends($user);
        $timingAnalysis = $this->getProductivityTimingAnalysis($user);
        $procrastination = $this->getProcrastinationTriggers($user);

        // Generate advice based on strongest pattern
        $advice = $this->selectBestAdvice($user, $studyPatterns, $completionTrends, $timingAnalysis, $procrastination);

        return $advice;
    }

    /**
     * Analyze study patterns from Pomodoro sessions
     */
    public function getStudyPatterns(User $user): array
    {
        $sessions = $user->pomodoroSessions()
            ->where('created_at', '>=', now()->subDays(30))
            ->get();

        if ($sessions->isEmpty()) {
            return [];
        }

        $avgDuration = $sessions->avg('focus_minutes');
        $avgTabSwitches = $sessions->avg('tab_switches');

        // Most productive day of week
        $dayStats = $sessions->groupBy(function($session) {
            return Carbon::parse($session->started_at)->dayOfWeek;
        })->map->count()->sortDesc();

        $mostProductiveDay = $dayStats->keys()->first();
        $dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

        return [
            'avg_session_duration' => round($avgDuration, 1),
            'avg_tab_switches' => round($avgTabSwitches, 1),
            'most_productive_day' => $mostProductiveDay !== null ? $dayNames[$mostProductiveDay] : null,
            'total_sessions' => $sessions->count(),
            'focus_quality' => $avgTabSwitches < 5 ? 'excellent' : ($avgTabSwitches < 15 ? 'good' : 'needs_improvement'),
        ];
    }

    /**
     * Analyze task completion trends
     */
    public function getTaskCompletionTrends(User $user): array
    {
        $tasks = $user->tasks()
            ->where('created_at', '>=', now()->subDays(30))
            ->get();

        if ($tasks->isEmpty()) {
            return [];
        }

        $completed = $tasks->where('status', 'done');
        $completionRate = ($completed->count() / $tasks->count()) * 100;

        // Check deadline adherence
        $tasksWithDeadline = $completed->filter(fn($t) => $t->due_date);
        $onTime = $tasksWithDeadline->filter(function($task) {
            // Assume 'updated_at' is completion time
            return $task->updated_at <= $task->due_date;
        });

        $deadlineAdherence = $tasksWithDeadline->count() > 0 
            ? ($onTime->count() / $tasksWithDeadline->count()) * 100 
            : null;

        // Priority completion bias
        $priorityStats = $completed->groupBy('priority')->map->count();

        return [
            'completion_rate' => round($completionRate, 1),
            'deadline_adherence' => $deadlineAdherence ? round($deadlineAdherence, 1) : null,
            'high_priority_completed' => $priorityStats->get('Tinggi', 0),
            'medium_priority_completed' => $priorityStats->get('Sedang', 0),
            'low_priority_completed' => $priorityStats->get('Rendah', 0),
            'total_completed' => $completed->count(),
        ];
    }

    /**
     * Analyze productivity timing patterns
     */
    public function getProductivityTimingAnalysis(User $user): array
    {
        $peakHours = $this->habitService->getPeakHours($user);
        
        if (empty($peakHours)) {
            return [];
        }

        // Determine best study time window
        sort($peakHours);
        $bestStart = min($peakHours);
        $bestEnd = max($peakHours) + 2; // 2-hour window
        
        $bestTimeWindow = sprintf('%02d:00-%02d:00', $bestStart, $bestEnd);

        // Find energy dips (hours with low activity)
        $sessions = $user->pomodoroSessions()
            ->where('created_at', '>=', now()->subDays(30))
            ->get();

        $hourlyActivity = $sessions->groupBy(function($session) {
            return Carbon::parse($session->started_at)->hour;
        })->map->count();

        // Find hours with lowest activity (potential energy dips)
        $lowActivityHours = $hourlyActivity->sortBy(function($count) {
            return $count;
        })->take(2)->keys()->toArray();

        sort($lowActivityHours);
        $energyDipWindow = !empty($lowActivityHours) 
            ? sprintf('%02d:00-%02d:00', min($lowActivityHours), max($lowActivityHours) + 1)
            : null;

        return [
            'best_study_time' => $bestTimeWindow,
            'peak_hours' => $peakHours,
            'energy_dip' => $energyDipWindow,
            'pattern' => $this->habitService->getProductivityPersona($user),
        ];
    }

    /**
     * Detect procrastination patterns
     */
    public function getProcrastinationTriggers(User $user): array
    {
        $recentTasks = $user->tasks()
            ->where('status', 'done')
            ->where('created_at', '>=', now()->subDays(30))
            ->whereNotNull('due_date')
            ->get();

        if ($recentTasks->count() < 3) {
            return [];
        }

        // Count tasks completed very close to deadline (within 1 day)
        $lastMinuteTasks = $recentTasks->filter(function($task) {
            $dueDate = Carbon::parse($task->due_date);
            $completionDate = $task->updated_at;
            return $dueDate->diffInDays($completionDate) <= 1 && $completionDate <= $dueDate;
        });

        $procrastinationRate = ($lastMinuteTasks->count() / $recentTasks->count()) * 100;

        return [
            'last_minute_tasks' => $lastMinuteTasks->count(),
            'procrastination_rate' => round($procrastinationRate, 1),
            'is_procrastinator' => $procrastinationRate > 50,
        ];
    }

    /**
     * Select the best advice message based on patterns
     */
    private function selectBestAdvice(User $user, array $studyPatterns, array $completionTrends, array $timingAnalysis, array $procrastination): array
    {
        $currentHour = now()->hour;

        // Priority 1: Procrastination warning
        if (!empty($procrastination) && $procrastination['is_procrastinator']) {
            return [
                'advice' => "{$procrastination['last_minute_tasks']} tugas terakhir kamu kerjain mendekati deadline. Mau Agent bantu reschedule lebih awal?",
                'type' => 'procrastination_warning',
                'data' => $procrastination,
            ];
        }

        // Priority 2: Best study time recommendation
        if (!empty($timingAnalysis) && isset($timingAnalysis['best_study_time'])) {
            $peakHours = $timingAnalysis['peak_hours'];
            
            if (in_array($currentHour, $peakHours)) {
                return [
                    'advice' => "Berdasarkan histori, jam {$timingAnalysis['best_study_time']} adalah waktu produktif kamu. Sekarang waktu yang tepat! 📚",
                    'type' => 'optimal_timing',
                    'best_study_time' => $timingAnalysis['best_study_time'],
                    'pattern' => $timingAnalysis['pattern'],
                ];
            }
            
            if (!empty($timingAnalysis['energy_dip']) && in_array($currentHour, range(14, 16))) {
                return [
                    'advice' => "Jam {$timingAnalysis['energy_dip']} biasanya kamu kurang fokus. Mending istirahat atau tugas ringan aja.",
                    'type' => 'energy_dip',
                    'energy_dip' => $timingAnalysis['energy_dip'],
                ];
            }

            return [
                'advice' => "Kamu paling produktif jam {$timingAnalysis['best_study_time']}. Coba jadwalkan tugas berat di jam itu! ⏰",
                'type' => 'timing_recommendation',
                'best_study_time' => $timingAnalysis['best_study_time'],
            ];
        }

        // Priority 3: Completion rate feedback
        if (!empty($completionTrends)) {
            $rate = $completionTrends['completion_rate'];
            
            if ($rate >= 80) {
                return [
                    'advice' => "30 hari terakhir completion rate kamu {$rate}%! Pertahankan 💪",
                    'type' => 'positive_reinforcement',
                    'completion_rate' => $rate,
                ];
            }
            
            if ($rate < 50) {
                return [
                    'advice' => "Completion rate kamu {$rate}%. Coba pecah tugas jadi lebih kecil supaya lebih mudah selesai?",
                    'type' => 'improvement_suggestion',
                    'completion_rate' => $rate,
                ];
            }
        }

        // Priority 4: Focus quality feedback
        if (!empty($studyPatterns)) {
            $tabSwitches = $studyPatterns['avg_tab_switches'];
            
            if ($tabSwitches > 20) {
                return [
                    'advice' => "Tab switches kamu rata-rata {$tabSwitches} per sesi. Ada banyak distraksi? Coba block website yang mengganggu.",
                    'type' => 'focus_improvement',
                    'avg_tab_switches' => $tabSwitches,
                ];
            }

            if ($tabSwitches < 5) {
                return [
                    'advice' => "Fokus kamu excellent! Rata-rata cuma {$tabSwitches} tab switches per sesi. Keep it up! 🎯",
                    'type' => 'focus_praise',
                    'avg_tab_switches' => $tabSwitches,
                ];
            }
        }

        // Default: General encouragement
        return [
            'advice' => "Agent terus belajar pola produktivitas kamu. Semakin sering pakai, semakin personal sarannya! 🧠",
            'type' => 'learning_mode',
        ];
    }

    /**
     * Get best study times for user
     */
    public function getBestStudyTimes(User $user): array
    {
        $timingAnalysis = $this->getProductivityTimingAnalysis($user);
        
        if (empty($timingAnalysis)) {
            return [];
        }

        return [
            'best_window' => $timingAnalysis['best_study_time'],
            'peak_hours' => $timingAnalysis['peak_hours'],
            'avoid_window' => $timingAnalysis['energy_dip'] ?? null,
        ];
    }
}
