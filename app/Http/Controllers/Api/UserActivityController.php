<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;

class UserActivityController extends Controller
{
    /**
     * Heartbeat to track time spent on the platform.
     * Increment total_time_spent by 60 seconds (or interval sent).
     */
    public function heartbeat(Request $request)
    {
        $user = $request->user();
        if (!$user) return response()->json(['message' => 'Unauthenticated'], 401);

        // Increment by 60 seconds (default heartbeat interval)
        $user->increment('total_time_spent', 60);

        return response()->json([
            'message' => 'Heartbeat received',
            'total_time_spent' => $user->total_time_spent
        ]);
    }
}
