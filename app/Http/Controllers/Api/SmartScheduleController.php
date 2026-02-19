<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\GoogleCalendarService;

class SmartScheduleController extends Controller
{
    protected $calendarService;

    public function __construct(GoogleCalendarService $calendarService)
    {
        $this->calendarService = $calendarService;
    }

    /**
     * Trigget Auto-Scheduling for the authenticated user
     */
    public function schedule(Request $request)
    {
        $user = $request->user();

        /*
        // Check if Premium (Middleware usually handles this, but double check)
        if (!$user->is_premium) {
            return response()->json([
                'success' => false,
                'message' => 'Fitur ini hanya untuk pengguna Premium.',
                'upgrade_required' => true
            ], 403);
        }
        */

        // Check connection
        if (!$user->is_google_connected) {
            return response()->json([
                'success' => false,
                'message' => 'Google Calendar belum terhubung.',
                'connect_required' => true
            ], 400);
        }

        try {
            $result = $this->calendarService->autoScheduleTasks($user);

            // Gamification: Unlock "Time Master" Badge for first use
            $newBadge = null;
            if (($result['scheduled_count'] ?? 0) > 0) {
                $badgeSlug = 'time-master';
                if (!$user->achievements()->where('slug', $badgeSlug)->exists()) {
                    $achievement = \App\Models\Achievement::where('slug', $badgeSlug)->first();
                    if ($achievement) {
                        $user->achievements()->attach($achievement->id, ['unlocked_at' => now()]);
                        
                        // Add XP
                        $user->increment('redeemable_xp', $achievement->xp_reward);
                        
                        $newBadge = [
                            'name' => $achievement->name,
                            'icon' => $achievement->icon,
                            'xp' => $achievement->xp_reward,
                        ];
                    }
                }
            }

            return response()->json([
                'success' => $result['success'],
                'message' => $result['message'],
                'scheduled_count' => $result['scheduled_count'] ?? 0,
                'new_badge' => $newBadge,
                'mock_schedule' => false
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat menjadwalkan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Preview Free Slots (Optional Debugging)
     */
    public function checkSlots(Request $request)
    {
        $user = $request->user();
        $slots = $this->calendarService->findFreeSlots($user);

        return response()->json([
            'slots' => $slots
        ]);
    }
}
