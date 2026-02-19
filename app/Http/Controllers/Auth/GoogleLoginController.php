<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Setting;
use App\Providers\RouteServiceProvider;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\URL;
use Laravel\Socialite\Facades\Socialite;

class GoogleLoginController extends Controller
{
    /**
     * Redirect the user to the Google authentication page.
     */
    public function redirectToGoogle()
    {

        if (request()->has('origin')) {
            session(['login_origin' => request('origin')]);
        }
        
        $isCalendarEnabled = Setting::get('google_calendar_enabled', true);
        
        $driver = Socialite::driver('google');
        
        if ($isCalendarEnabled) {
            $driver->scopes(['https://www.googleapis.com/auth/calendar.events']);
        }
        
        return $driver
            ->with(['access_type' => 'offline', 'prompt' => 'consent'])
            ->redirect();
    }

    /**
     * Obtain the user information from Google.
     */
    public function handleGoogleCallback()
    {
        try {
            $googleUser = Socialite::driver('google')->user();
        } catch (\Exception $e) {
            return redirect('/login')->withErrors(['email' => 'Failed to login with Google. Please try again.']);
        }

        // ======================= PERUBAHAN UTAMA DI SINI =======================
        // Cari pengguna berdasarkan email. Jika tidak ada, buat pengguna baru.
        // Jika ada, perbarui datanya (misalnya nama atau google_id).
        // Cari pengguna berdasarkan email
        $user = User::where('email', $googleUser->getEmail())->first();

        if ($user) {
            // Jika user ada, update google_id dan informasinya (tanpa mengubah password)
            $user->update([
                'name' => $googleUser->getName(),
                'google_id' => $googleUser->getId(),
                'google_access_token' => $googleUser->token,
                'google_refresh_token' => $googleUser->refreshToken, // Only available if access_type=offline
                'google_token_expires_at' => now()->addSeconds($googleUser->expiresIn),
            ]);
        } else {
            // Jika user belum ada, buat baru dengan password random
            $user = User::create([
                'name' => $googleUser->getName(),
                'email' => $googleUser->getEmail(),
                'google_id' => $googleUser->getId(),
                'password' => Hash::make(str()->random(24)),
                'email_verified_at' => now(), // Auto verify email dari Google
                'google_access_token' => $googleUser->token,
                'google_refresh_token' => $googleUser->refreshToken,
                'google_token_expires_at' => now()->addSeconds($googleUser->expiresIn),
            ]);
        }
        // ======================================================================

        // Log the user in
        Auth::login($user, true); // Argumen 'true' akan mengingat pengguna

        // --- NATIVEPHP DEEP LINKING ---
        // Jika request berasal dari desktop app, kita redirect balik ke app via custom scheme
        if (request()->has('origin') && request('origin') === 'desktop' || session('login_origin') === 'desktop') {
            $loginUrl = URL::temporarySignedRoute(
                'desktop.login-with-token',
                now()->addMinutes(5),
                ['user_id' => $user->id]
            );
            
            return redirect('sarangtumbuh://login?url=' . urlencode($loginUrl));
        }

        // Redirect berdasarkan role
        $role = $user->role;
        return redirect()->intended(
            strtolower($role) === 'admin' ? '/admin' : RouteServiceProvider::HOME
        );
    }
}