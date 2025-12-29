<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class PreventBannedUserAccess
{
    public function handle(Request $request, Closure $next): Response
    {
        // Periksa jika user terautentikasi dan kolom banned_at tidak null
        if (Auth::check() && Auth::user()->banned_at) {
            // Logout user yang di-banned
            Auth::logout();

            $request->session()->invalidate();
            $request->session()->regenerateToken();

            // Redirect ke halaman login dengan pesan error
            return redirect()->route('login')->with('error', 'Akun Anda telah ditangguhkan.');
        }
        return $next($request);
    }
}