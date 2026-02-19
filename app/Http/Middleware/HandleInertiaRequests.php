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
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user() ? $request->user()->load('guilds') : null,
            ],
            'midtrans' => [
                'client_key' => config('services.midtrans.client_key'),
                'is_production' => config('services.midtrans.is_production'),
            ],
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
                'snap_token' => session('snap_token'),
            ],
            'settings' => [
                'google_calendar_enabled' => \App\Models\Setting::get('google_calendar_enabled', true),
            ],
        ];
    }
}
