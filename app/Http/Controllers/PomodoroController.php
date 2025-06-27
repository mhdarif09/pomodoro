<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Models\PomodoroSession;
use Carbon\Carbon;


class PomodoroController extends Controller
{
 public function index()
{
    $user = auth()->user();

    return Inertia::render('Pomodoro/Index', [
        'isPremium' => $user->has_active_subscription,
        'plans' => \App\Models\Plan::select('id', 'name', 'price', 'duration')->get(),
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
        'tab_switches' => 'required|integer|min:0',
            'ai_questions_asked' => 'required|integer|min:0',

    ]);
      $validated['user_id'] = auth()->id();

    $blockedUrls = $request->blocked_urls;

    PomodoroSession::create([
        'user_id'        => auth()->id(),
        'focus_minutes'  => $request->focus_minutes,
        'break_minutes'  => $request->break_minutes,
        'started_at'     => Carbon::parse($request->started_at)->format('Y-m-d H:i:s'),
        'ended_at'       => Carbon::parse($request->ended_at)->format('Y-m-d H:i:s'),
'blocked_urls' => is_array($blockedUrls) ? json_encode($blockedUrls) : json_encode([$blockedUrls]),
    ]);

return redirect()->route('pomodoro.index')->with('success', 'Session saved!');
}

}
