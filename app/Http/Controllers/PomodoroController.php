<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Models\PomodoroSession;

class PomodoroController extends Controller
{
    public function index()
    {
        return Inertia::render('Pomodoro/Index', [
            'isPremium' => auth()->user()?->has_active_subscription,
        ]);
    }

    public function custom()
    {
        return Inertia::render('Pomodoro/Custom');
    }

    public function store(Request $request)
    {
        $request->validate([
            'focus_minutes' => 'required|integer',
            'break_minutes' => 'required|integer',
            'started_at' => 'required|date',
            'ended_at' => 'required|date',
            'blocked_urls' => 'nullable|array',
        ]);

        PomodoroSession::create([
            'user_id' => auth()->id(),
            'focus_minutes' => $request->focus_minutes,
            'break_minutes' => $request->break_minutes,
            'started_at' => $request->started_at,
            'ended_at' => $request->ended_at,
            'blocked_urls' => $request->blocked_urls ?? [],
        ]);

        return response()->json(['message' => 'Session saved']);
    }
}
