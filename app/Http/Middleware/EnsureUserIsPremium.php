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
        if ($user && $user->tipe_user === 'admin') {
            return $next($request);
        }

        // Cek apakah punya langganan aktif
        $hasActiveSubscription = $user->subscription()
            ->where('status', 'paid')
            ->where('expired_at', '>', now())
            ->exists();

        if (! $hasActiveSubscription) {
            return redirect()->route('subscribe.index')
                ->with('error', 'Fitur ini hanya tersedia untuk pengguna premium.');
        }

        return $next($request);
    }
}
