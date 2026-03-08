<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
        ]);
    }

    /**
     * Display the user's gamification profile.
     */
    public function show(Request $request): Response
    {
        $user = $request->user();
        $user->load(['gamificationStats']);

        // Consistency Calendar (Heatmap data)
        // Get completed tasks grouped by date for the last 6 months
        $sixMonthsAgo = now()->subMonths(6)->startOfDay();
        
        $heatmapDataRaw = \App\Models\Task::where('user_id', $user->id)
            ->where('is_completed', true)
            ->where('updated_at', '>=', $sixMonthsAgo)
            ->selectRaw('DATE(updated_at) as date, count(*) as count')
            ->groupBy('date')
            ->get();

        $heatmapData = $heatmapDataRaw->map(function ($item) {
            return [
                'date' => $item->date,
                'count' => $item->count,
            ];
        });

        // Add today if not present to ensure the heatmap ends correctly
        $todayStr = now()->toDateString();
        if (!$heatmapData->contains('date', $todayStr)) {
            $heatmapData->push(['date' => $todayStr, 'count' => 0]);
        }

        return Inertia::render('Profile/Show', [
            'stats' => [
                'name' => $user->name,
                'avatar' => $user->avatar,
                'email' => $user->email,
                'rank_title' => $user->gamificationStats->rank_title ?? 'Novice',
                'total_xp' => $user->gamificationStats->total_xp ?? 0,
                'streak' => $user->gamificationStats->streak ?? 0,
                'highest_streak' => $user->gamificationStats->highest_streak ?? 0,
                'level' => $user->level,
                'joined_at' => $user->created_at->format('M Y'),
            ],
            'achievements' => [], // To be implemented
            'heatmapData' => $heatmapData,
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return Redirect::route('profile.edit');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }

    /**
     * Mark tutorial as seen for the user.
     */
    public function markTutorialSeen(Request $request)
    {
        $request->user()->update(['has_seen_tutorial' => true]);
        return back();
    }
}
