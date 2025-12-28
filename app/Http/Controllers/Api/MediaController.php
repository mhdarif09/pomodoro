<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MediaController extends Controller
{
    /**
     * Search for media on YouTube or Spotify.
     */
    public function search(Request $request)
    {
        $request->validate([
            'q' => 'required|string',
            'source' => 'required|in:youtube,spotify',
        ]);

        $query = $request->input('q');
        $source = $request->input('source');

        if ($source === 'youtube') {
            return $this->searchYoutube($query);
        }

        if ($source === 'spotify') {
            return $this->searchSpotify($query);
        }

        return response()->json(['error' => 'Invalid source'], 400);
    }

    private function searchYoutube($query)
    {
        // Method 1: YouTube Data API (If Key Exists)
        $apiKey = env('YOUTUBE_API_KEY');
        if ($apiKey) {
            $response = Http::get('https://www.googleapis.com/youtube/v3/search', [
                'part' => 'snippet',
                'q' => $query,
                'type' => 'video',
                'key' => $apiKey,
                'maxResults' => 1,
            ]);

            if ($response->successful()) {
                $items = $response->json()['items'];
                if (!empty($items)) {
                    return response()->json([
                        'id' => $items[0]['id']['videoId'],
                        'title' => $items[0]['snippet']['title'],
                        'source' => 'youtube'
                    ]);
                }
            }
        }

        // Method 2: Public Scrape (Fallback)
        // Note: This is a robust fallback for local dev.
        try {
            $url = "https://www.youtube.com/results?search_query=" . urlencode($query);
            $html = @file_get_contents($url);

            if ($html) {
                // Regex to find video ID: watch?v=XXXXXXXXXXX
                if (preg_match('/watch\?v=([a-zA-Z0-9_-]{11})/', $html, $matches)) {
                    return response()->json([
                        'id' => $matches[1],
                        'title' => $query, // Can't easily parse title from raw HTML reliably without DOM parser
                        'source' => 'youtube'
                    ]);
                }
            }
        } catch (\Exception $e) {
            Log::error("YouTube Scrape Failed: " . $e->getMessage());
        }

        return response()->json(['error' => 'Video not found'], 404);
    }

    private function searchSpotify($query)
    {
        // Check for User's Spotify Token (To be implemented)
        // For now, return specific code indicating "Login Required"
        $user = auth()->user();
        
        // Hypothetical relationship/field
        // if (!$user->spotify_token) {
        //     return response()->json(['error' => 'auth_required', 'auth_url' => route('spotify.login')], 401);
        // }

        // Needs Client ID/Secret
        $clientId = env('SPOTIFY_CLIENT_ID');
        $clientSecret = env('SPOTIFY_CLIENT_SECRET');

        if (!$clientId || !$clientSecret) {
            return response()->json(['error' => 'server_config_missing'], 503);
        }
        
        // If we simply want to search (Client Credentials Flow - Public Search)
        // We can get a generic token if user not logged in? 
        // Spotify Search require token. Client Credentials token works for Search!
        
        try {
            // Get Client Credentials Token
            $tokenResponse = Http::asForm()->post('https://accounts.spotify.com/api/token', [
                'grant_type' => 'client_credentials',
                'client_id' => $clientId,
                'client_secret' => $clientSecret,
            ]);

            if ($tokenResponse->successful()) {
                $accessToken = $tokenResponse->json()['access_token'];

                // Search Track
                $searchResponse = Http::withToken($accessToken)->get('https://api.spotify.com/v1/search', [
                    'q' => $query,
                    'type' => 'track',
                    'limit' => 1,
                ]);

                if ($searchResponse->successful()) {
                    $tracks = $searchResponse->json()['tracks']['items'];
                    if (!empty($tracks)) {
                        return response()->json([
                            'id' => $tracks[0]['id'],
                            'title' => $tracks[0]['name'] . ' - ' . $tracks[0]['artists'][0]['name'],
                            'source' => 'spotify'
                        ]);
                    }
                }
            }
        } catch (\Exception $e) {
             Log::error("Spotify Search Failed: " . $e->getMessage());
        }

        return response()->json(['error' => 'Track not found'], 404);
    }
}
