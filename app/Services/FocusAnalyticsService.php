<?php

namespace App\Services;

use App\Models\User;
use App\Models\PomodoroSession;
use App\Models\Task;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class FocusAnalyticsService
{
    /**
     * Detect hours when user's focus tends to drop
     *
     * @param int $userId
     * @return array
     */
    public function detectFocusDropHours(int $userId): array
    {
        try {
            // Get sessions from last 30 days
            $sessions = PomodoroSession::where('user_id', $userId)
                ->where('created_at', '>=', now()->subDays(30))
                ->get();

            if ($sessions->isEmpty()) {
                return [];
            }

            // Group by hour and calculate skip/incomplete rate
            $hourlyStats = [];
            
            foreach ($sessions as $session) {
                $hour = Carbon::parse($session->created_at)->hour;
                
                if (!isset($hourlyStats[$hour])) {
                    $hourlyStats[$hour] = [
                        'total' => 0,
                        'skipped' => 0,
                        'incomplete' => 0,
                    ];
                }
                
                $hourlyStats[$hour]['total']++;
                
                // Check if session was skipped or incomplete
                if ($session->skipped_at || !$session->completed_successfully) {
                    $hourlyStats[$hour]['skipped']++;
                }
                
                if (!$session->completed_successfully) {
                    $hourlyStats[$hour]['incomplete']++;
                }
            }

            // Calculate drop rate for each hour
            $dropHours = [];
            foreach ($hourlyStats as $hour => $stats) {
                $dropRate = ($stats['skipped'] + $stats['incomplete']) / $stats['total'];
                
                // Consider it a "drop hour" if >40% failed/skipped and at least 5 sessions
                if ($dropRate > 0.4 && $stats['total'] >= 5) {
                    $dropHours[] = [
                        'hour' => $hour,
                        'drop_rate' => round($dropRate * 100, 1),
                        'total_sessions' => $stats['total'],
                        'failed_sessions' => $stats['skipped'] + $stats['incomplete'],
                        'formatted_hour' => $this->formatHour($hour)
                    ];
                }
            }

            // Sort by drop rate (highest first)
            usort($dropHours, fn($a, $b) => $b['drop_rate'] <=> $a['drop_rate']);

            return $dropHours;

        } catch (\Exception $e) {
            Log::error('FocusAnalyticsService: Error detecting focus drop hours', [
                'user_id' => $userId,
                'error' => $e->getMessage()
            ]);
            return [];
        }
    }

    /**
     * Get user's productivity pattern by hour
     *
     * @param int $userId
     * @return array
     */
    public function getUserProductivityPattern(int $userId): array
    {
        try {
            // Get completed tasks from last 30 days
            $tasks = Task::where('user_id', $userId)
                ->where('is_completed', true)
                ->where('updated_at', '>=', now()->subDays(30))
                ->get();

            // Get pomodoro sessions
            $sessions = PomodoroSession::where('user_id', $userId)
                ->where('completed_successfully', true)
                ->where('created_at', '>=', now()->subDays(30))
                ->get();

            if ($tasks->isEmpty() && $sessions->isEmpty()) {
                return [
                    'most_productive_hours' => [],
                    'least_productive_hours' => [],
                    'pattern' => 'insufficient_data'
                ];
            }

            // Analyze by hour
            $hourlyProductivity = [];
            
            // Weight from completed tasks
            foreach ($tasks as $task) {
                $hour = Carbon::parse($task->updated_at)->hour;
                $hourlyProductivity[$hour] = ($hourlyProductivity[$hour] ?? 0) + 2; // Tasks worth 2 points
            }
            
            // Weight from successful sessions
            foreach ($sessions as $session) {
                $hour = Carbon::parse($session->created_at)->hour;
                $hourlyProductivity[$hour] = ($hourlyProductivity[$hour] ?? 0) + 1; // Sessions worth 1 point
            }

            // Sort by productivity
            arsort($hourlyProductivity);

            $mostProductive = array_slice($hourlyProductivity, 0, 3, true);
            $leastProductive = array_slice(array_reverse($hourlyProductivity, true), 0, 3, true);

            return [
                'most_productive_hours' => array_map(fn($hour) => [
                    'hour' => $hour,
                    'formatted' => $this->formatHour($hour),
                    'score' => $hourlyProductivity[$hour]
                ], array_keys($mostProductive)),
                'least_productive_hours' => array_map(fn($hour) => [
                    'hour' => $hour,
                    'formatted' => $this->formatHour($hour),
                    'score' => $hourlyProductivity[$hour]
                ], array_keys($leastProductive)),
                'pattern' => $this->determinePattern($mostProductive)
            ];

        } catch (\Exception $e) {
            Log::error('FocusAnalyticsService: Error getting productivity pattern', [
                'user_id' => $userId,
                'error' => $e->getMessage()
            ]);
            
            return [
                'most_productive_hours' => [],
                'least_productive_hours' => [],
                'pattern' => 'error'
            ];
        }
    }

    /**
     * Generate simplified insights for user
     *
     * @param int $userId
     * @return array
     */
    public function getSimplifiedInsights(int $userId): array
    {
        $insights = [];

        // 1. Focus Drop Insights
        $dropHours = $this->detectFocusDropHours($userId);
        if (!empty($dropHours)) {
            $topDrop = $dropHours[0];
            $insights['focus_drop'] = [
                'message' => "Fokusmu cenderung drop di sekitar jam {$topDrop['formatted_hour']} ({$topDrop['drop_rate']}% gagal)",
                'type' => 'warning',
                'icon' => '⚠️',
                'hours' => array_column($dropHours, 'formatted_hour')
            ];
        } else {
            $insights['focus_drop'] = [
                'message' => "Konsistensi fokusmu bagus! Tidak ada jam dengan penurunan signifikan",
                'type' => 'success',
                'icon' => '✨'
            ];
        }

        // 2. Productivity Pattern
        $pattern = $this->getUserProductivityPattern($userId);
        if (!empty($pattern['most_productive_hours'])) {
            $topHour = $pattern['most_productive_hours'][0];
            $insights['peak_hours'] = [
                'message' => "Kamu paling produktif di sekitar jam {$topHour['formatted']}",
                'type' => 'success',
                'icon' => '🚀',
                'hours' => array_column($pattern['most_productive_hours'], 'formatted')
            ];
        }

        // 3. Task Completion Pattern
        $taskStats = $this->getTaskCompletionStats($userId);
        $insights['task_completion'] = [
            'message' => $taskStats['message'],
            'type' => $taskStats['type'],
            'icon' => $taskStats['icon'],
            'stats' => $taskStats
        ];

        // 4. Recommendations
        $insights['recommendations'] = $this->generateRecommendations($userId, $dropHours, $pattern);

        return $insights;
    }

    /**
     * Get task completion statistics
     */
    private function getTaskCompletionStats(int $userId): array
    {
        $totalTasks = Task::where('user_id', $userId)->count();
        $completedTasks = Task::where('user_id', $userId)->where('is_completed', true)->count();
        $completionRate = $totalTasks > 0 ? round(($completedTasks / $totalTasks) * 100) : 0;

        if ($completionRate >= 80) {
            return [
                'message' => "Luar biasa! {$completionRate}% task selesai",
                'type' => 'success',
                'icon' => '🎉',
                'rate' => $completionRate,
                'completed' => $completedTasks,
                'total' => $totalTasks
            ];
        } elseif ($completionRate >= 60) {
            return [
                'message' => "Progres bagus! {$completionRate}% task selesai",
                'type' => 'info',
                'icon' => '👍',
                'rate' => $completionRate,
                'completed' => $completedTasks,
                'total' => $totalTasks
            ];
        } else {
            $incompleteTasks = $totalTasks - $completedTasks;
            return [
                'message' => "Ada {$incompleteTasks} task yang belum selesai, yuk mulai!",
                'type' => 'warning',
                'icon' => '💪',
                'rate' => $completionRate,
                'completed' => $completedTasks,
                'total' => $totalTasks
            ];
        }
    }

    /**
     * Generate personalized recommendations
     */
    private function generateRecommendations(int $userId, array $dropHours, array $pattern): array
    {
        $recommendations = [];

        // Recommendation based on drop hours
        if (!empty($dropHours)) {
            $dropHoursList = implode(', ', array_slice(array_column($dropHours, 'formatted_hour'), 0, 2));
            $recommendations[] = [
                'text' => "Hindari task berat di jam {$dropHoursList}. Gunakan waktu ini untuk task ringan atau break.",
                'priority' => 'high'
            ];
        }

        // Recommendation based on peak hours
        if (!empty($pattern['most_productive_hours'])) {
            $peakHour = $pattern['most_productive_hours'][0]['formatted'];
            $recommendations[] = [
                'text' => "Manfaatkan jam {$peakHour} untuk task prioritas tinggi!",
                'priority' => 'high'
            ];
        }

        // General recommendations
        $totalSessions = PomodoroSession::where('user_id', $userId)
            ->where('created_at', '>=', now()->subDays(7))
            ->count();

        if ($totalSessions < 10) {
            $recommendations[] = [
                'text' => "Coba tambah frekuensi sesi fokus. Target minimal 2-3 sesi per hari!",
                'priority' => 'medium'
            ];
        }

        return $recommendations;
    }

    /**
     * Format hour to readable string
     */
    private function formatHour(int $hour): string
    {
        return str_pad($hour, 2, '0', STR_PAD_LEFT) . ':00';
    }

    /**
     * Determine productivity pattern type
     */
    private function determinePattern(array $mostProductive): string
    {
        if (empty($mostProductive)) {
            return 'none';
        }

        $topHours = array_keys($mostProductive);
        $firstHour = $topHours[0];

        if ($firstHour >= 5 && $firstHour <= 11) {
            return 'morning_person';
        } elseif ($firstHour >= 12 && $firstHour <= 17) {
            return 'afternoon_person';
        } elseif ($firstHour >= 18 && $firstHour <= 23) {
            return 'evening_person';
        } else {
            return 'night_owl';
        }
    }
}
