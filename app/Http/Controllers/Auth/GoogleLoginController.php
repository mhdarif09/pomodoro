<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Providers\RouteServiceProvider;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash; // <-- Tambahkan ini
use Laravel\Socialite\Facades\Socialite;

class GoogleLoginController extends Controller
{
    /**
     * Redirect the user to the Google authentication page.
     */
    public function redirectToGoogle()
    {
        return Socialite::driver('google')->redirect();
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
        $user = User::updateOrCreate(
            [
                'email' => $googleUser->getEmail() // Kunci utama untuk mencari pengguna
            ],
            [
                'name' => $googleUser->getName(),
                'google_id' => $googleUser->getId(),
                // 'password' akan diisi jika user baru dibuat (karena ada di UserObserver/mutator/etc,
                // atau jika password-nya null, Eloquent tidak akan mencoba update)
                // Jika ingin memastikan, kita bisa set password secara acak lagi jika null.
                'password' => Hash::make(str()->random(24)) // Ini memastikan pengguna sosial bisa mereset password jika mau
            ]
        );
        // ======================================================================

        // Log the user in
        Auth::login($user, true); // Argumen 'true' akan mengingat pengguna

        // Redirect berdasarkan role
        $role = $user->role;
        return redirect()->intended(
            $role === 'admin' ? '/admin' : RouteServiceProvider::HOME
        );
    }
}