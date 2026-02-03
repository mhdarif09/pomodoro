<?php

namespace App\Services;

use App\Models\User;
use App\Models\PomodoroSession;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class HabitService
{
    /**
     * Calculate user's peak productivity hours.
     * Returns array of hours (0-23) where user is most active.
     * 
     * @param User $user
     * @return array
     */
    public function getPeakHours(User $user): array
    {
        // Get sessions from last 30 days
        $sessions = $user->pomodoroSessions()
            ->where('created_at', '>=', Carbon::now()->subDays(30))
            ->select(DB::raw('HOUR(started_at) as hour'), DB::raw('count(*) as count'))
            ->groupBy('hour')
            ->orderByDesc('count')
            ->limit(3)
            ->get();

        if ($sessions->isEmpty()) {
            return [];
        }

        return $sessions->pluck('hour')->toArray();
    }

    /**
     * Determine user's productivity persona.
     */
    public function getProductivityPersona(User $user): string
    {
        $peakHours = $this->getPeakHours($user);
        
        if (empty($peakHours)) return 'Novice Explorer';

        $avgHour = array_sum($peakHours) / count($peakHours);

        if ($avgHour >= 5 && $avgHour < 12) return 'Early Bird 🐦';
        if ($avgHour >= 12 && $avgHour < 18) return 'Day Walker ☀️';
        if ($avgHour >= 18 && $avgHour <= 23) return 'Night Owl 🦉';
        return 'Night Owl 🦉'; // Late night
    }

    /**
     * Check if current time is within user's peak hours.
     */
    public function isPeakTime(User $user): bool
    {
        $currentHour = Carbon::now()->hour;
        $peakHours = $this->getPeakHours($user);

        return in_array($currentHour, $peakHours);
    }
}
