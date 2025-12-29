<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Native\Laravel\Facades\Shell;

class DesktopController extends Controller
{
    /**
     * Open a URL in the user's default external browser.
     * This is used for OAuth flows in the desktop app.
     */
    public function openExternal(Request $request)
    {
        $url = $request->query('url');

        if (!$url) {
            return response()->json(['error' => 'URL is required'], 400);
        }

        // Only allow opening valid URLs
        if (!filter_var($url, FILTER_VALIDATE_URL)) {
            return response()->json(['error' => 'Invalid URL'], 400);
        }

        // If it's a login URL, we append the origin=desktop via query param if not there
        if (str_contains($url, '/login/google')) {
             $url = str_contains($url, '?') ? $url . '&origin=desktop' : $url . '?origin=desktop';
        }

        Shell::openExternal($url);

        return response()->json(['success' => true]);
    }

    /**
     * Authenticate the user across the desktop app boundary using a signed URL.
     */
    public function loginWithToken(Request $request)
    {
        if (! $request->hasValidSignature()) {
            abort(401, 'Invalid or expired login token');
        }

        $user = \App\Models\User::findOrFail($request->user_id);

        \Illuminate\Support\Facades\Auth::login($user, true);

        return redirect()->route('dashboard');
    }
}
