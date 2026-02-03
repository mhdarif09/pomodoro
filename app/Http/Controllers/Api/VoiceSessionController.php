<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class VoiceSessionController extends Controller
{
    // Minimalistic Signaling/Presence implementation using Cache
    // In production, Redis/WebSockets is preferred.

    public function join(Request $request)
    {
        $validated = $request->validate([
            'guild_id' => 'required|integer',
            'peer_id' => 'required|string',
        ]);

        $guildId = $validated['guild_id'];
        $peerId = $validated['peer_id'];
        $userId = auth()->id();
        $userName = auth()->user()->name;

        $key = "guild_voice_sessions:{$guildId}";
        $sessions = Cache::get($key, []);
        
        // Add or update session
        $sessions[$userId] = [
            'user_id' => $userId,
            'user_name' => $userName,
            'peer_id' => $peerId,
            'last_seen' => now()->timestamp,
        ];

        Cache::put($key, $sessions, 60); // Expire if no activity for 60 mins

        return response()->json(['message' => 'Joined']);
    }

    public function leave(Request $request)
    {
        $validated = $request->validate([
            'guild_id' => 'required|integer',
        ]);

        $guildId = $validated['guild_id'];
        $userId = auth()->id();

        $key = "guild_voice_sessions:{$guildId}";
        $sessions = Cache::get($key, []);

        if (isset($sessions[$userId])) {
            unset($sessions[$userId]);
            Cache::put($key, $sessions, 60);
        }

        return response()->json(['message' => 'Left']);
    }

    public function peers(Request $request)
    {
        $guildId = $request->input('guild_id');
        $userId = auth()->id();
        
        if (!$guildId) return response()->json([]);

        $key = "guild_voice_sessions:{$guildId}";
        $sessions = Cache::get($key, []);

        // Cleanup stale sessions (older than 15 seconds)
        // This acts as a poor man's heartbeat cleaner
        $now = now()->timestamp;
        $activeSessions = [];
        $isChanged = false;

        foreach ($sessions as $uid => $session) {
            if (($now - $session['last_seen']) < 15) {
                // If this is the current user, update heartbeat
                if ($uid === $userId) {
                     $sessions[$uid]['last_seen'] = $now;
                     $isChanged = true;
                }
                
                // Only return OTHER users
                if ($uid !== $userId) {
                    $activeSessions[] = $session;
                }
            } else {
                // Remove stale
                unset($sessions[$uid]);
                $isChanged = true;
            }
        }

        if ($isChanged) {
            Cache::put($key, $sessions, 60);
        }

        return response()->json($activeSessions);
    }
}
