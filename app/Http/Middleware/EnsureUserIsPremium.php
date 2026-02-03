<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class EnsureUserIsPremium
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();

        // Admin bisa akses langsung
        if ($user && strtolower($user->role) === 'admin') {
            return $next($request);
        }

        // Cek apakah punya langganan aktif
        $hasActiveSubscription = $user->subscription()
            ->where('status', 'paid')
            ->where('expired_at', '>', now())
            ->exists();

        if (! $hasActiveSubscription) {
            if ($request->expectsJson() || $request->is('api/*') || $request->is('dashboard/api/*')) {
                 return response()->json(['message' => 'Fitur ini hanya tersedia untuk pengguna premium.'], 403);
            }

            return redirect()->route('subscribe.index')
                ->with('error', 'Fitur ini hanya tersedia untuk pengguna premium.');
        }

        return $next($request);
    }
}
