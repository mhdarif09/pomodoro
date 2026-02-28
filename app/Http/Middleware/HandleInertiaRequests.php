<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): string|null
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $trigger = null;
        if ($user && $user->gamificationStats) {
            $trigger = app(\App\Services\GamificationEngine::class)->checkIdentityTrigger($user);
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? $user->load('guilds') : null,
            ],
            'gamification' => $user && $user->gamificationStats ? [
                'streak'          => $user->gamificationStats->streak,
                'highest_streak'  => $user->gamificationStats->highest_streak,
                'rank_title'      => $user->gamificationStats->rank_title,
                'rank_position'   => $user->gamificationStats->rank_position,
                'rank_points'     => $user->gamificationStats->rank_points,
                'last_rank_change'=> $user->gamificationStats->last_rank_change,
                'total_xp'        => $user->gamificationStats->total_xp,
                'identity_trigger'=> $trigger,
            ] : null,
            'unread_notifications' => 0, // Placeholder until notifications table is set
            'midtrans' => [
                'client_key' => config('services.midtrans.client_key'),
                'is_production' => config('services.midtrans.is_production'),
            ],
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
                'snap_token' => session('snap_token'),
            ],
            'settings' => [],
        ];
    }
}
