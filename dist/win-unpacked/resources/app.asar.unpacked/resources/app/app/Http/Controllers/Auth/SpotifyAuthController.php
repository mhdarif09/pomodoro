<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class SpotifyAuthController extends Controller
{
    public function redirect()
    {
        $clientId = env('SPOTIFY_CLIENT_ID');
        $redirectUri = env('SPOTIFY_REDIRECT_URI', url('/auth/spotify/callback'));
        
        $scopes = [
            'user-read-private',
            'user-read-email',
            'streaming', 
            'user-modify-playback-state',
            'user-read-playback-state'
        ];

        $state = Str::random(16);
        session(['spotify_auth_state' => $state]);

        $query = http_build_query([
            'response_type' => 'code',
            'client_id' => $clientId,
            'scope' => implode(' ', $scopes),
            'redirect_uri' => $redirectUri,
            'state' => $state,
        ]);

        return redirect('https://accounts.spotify.com/authorize?' . $query);
    }

    public function callback(Request $request)
    {
        $state = $request->input('state');
        $storedState = session('spotify_auth_state');

        if (!$state || $state !== $storedState) {
            return redirect('/dashboard')->with('error', 'Invalid state');
        }

        $code = $request->input('code');
        $clientId = env('SPOTIFY_CLIENT_ID');
        $clientSecret = env('SPOTIFY_CLIENT_SECRET');
        $redirectUri = env('SPOTIFY_REDIRECT_URI', url('/auth/spotify/callback'));

        $response = Http::asForm()->post('https://accounts.spotify.com/api/token', [
            'grant_type' => 'authorization_code',
            'code' => $code,
            'redirect_uri' => $redirectUri,
            'client_id' => $clientId,
            'client_secret' => $clientSecret,
        ]);

        if ($response->successful()) {
            $data = $response->json();
            $accessToken = $data['access_token'];
            $refreshToken = $data['refresh_token'] ?? null;
            $expiresIn = $data['expires_in'];

            /** @var \App\Models\User $user */
            $user = Auth::user();
            $user->spotify_token = $accessToken;
            if ($refreshToken) {
                $user->spotify_refresh_token = $refreshToken;
            }
            $user->spotify_token_expires_at = Carbon::now()->addSeconds($expiresIn);
            $user->save();

            return redirect('/dashboard')->with('success', 'Spotify connected successfully! Turn on Break Mode to test.');
        }

        return redirect('/dashboard')->with('error', 'Failed to connect Spotify. Check keys.');
    }
}
