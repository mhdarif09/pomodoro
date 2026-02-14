<?php

namespace App\Http\Controllers;

use App\Models\Guild;
use App\Models\Challenge;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GuildChallengeController extends Controller
{
    /**
     * Display a listing of the guild missions.
     */
    public function index(Guild $guild)
    {
        if (!auth()->user()->guilds->contains('id', $guild->id)) {
            abort(403);
        }

        return Inertia::render('Guilds/Challenges/Index', [
            'guild' => [
                'id' => $guild->id,
                'name' => $guild->name,
                'emblem' => $guild->emblem,
                'leader_id' => $guild->leader->id ?? null,
            ],
            'challenges' => $guild->challenges()
                ->where('is_team_mission', true)
                ->with(['users' => function($q) {
                    $q->where('user_id', auth()->id());
                }])
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($challenge) {
                    $challenge->completed_by_user = $challenge->users->isNotEmpty() && $challenge->users->first()->pivot->completed;
                    return $challenge;
                }),
        ]);
    }

    /**
     * Store a newly created mission in storage.
     */
    public function store(Request $request, Guild $guild)
    {
        // Only Leader can create missions
        $isLeader = $guild->members()->where('user_id', auth()->id())->wherePivot('role', 'leader')->exists();
        if (!$isLeader) {
            abort(403, 'Only Leaders can create missions.');
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'xp_reward' => 'required|integer|min:0',
            'points_reward' => 'required|integer|min:0',
            'requirements' => 'nullable|array', // Structure defined by frontend, e.g. { type: 'pomodoro_count', count: 10 }
            'starts_at' => 'nullable|date',
            'ends_at' => 'nullable|date|after_or_equal:starts_at',
        ]);

        $guild->challenges()->create([
            'title' => $validated['title'],
            'description' => $validated['description'],
            'xp_reward' => $validated['xp_reward'],
            'points_reward' => $validated['points_reward'],
            'type' => 'custom', // Standard type for user-created missions
            'is_team_mission' => true,
            'is_active' => true,
            'requirements' => $validated['requirements'] ?? [],
            'starts_at' => $validated['starts_at'] ?? now(),
            'ends_at' => $validated['ends_at'],
        ]);

        return back()->with('success', 'Guild Mission created successfully.');
    }

    /**
     * Update the specified mission in storage.
     */
    public function update(Request $request, Guild $guild, Challenge $challenge)
    {
        if ($challenge->guild_id !== $guild->id) abort(404);

        $isLeader = $guild->members()->where('user_id', auth()->id())->wherePivot('role', 'leader')->exists();
        if (!$isLeader) abort(403);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'xp_reward' => 'required|integer',
            'points_reward' => 'required|integer',
            'is_active' => 'boolean',
        ]);

        $challenge->update($validated);

        return back()->with('success', 'Mission updated.');
    }

    /**
     * Remove the specified mission from storage.
     */
    public function destroy(Guild $guild, Challenge $challenge)
    {
        if ($challenge->guild_id !== $guild->id) abort(404);

        $isLeader = $guild->members()->where('user_id', auth()->id())->wherePivot('role', 'leader')->exists();
        if (!$isLeader) abort(403);

        $challenge->delete();

        return back()->with('success', 'Mission deleted.');
    }

    /**
     * Mark mission as completed by user.
     */
    public function complete(Request $request, Guild $guild, Challenge $challenge)
    {
        if ($challenge->guild_id !== $guild->id) abort(404);
        
        // Check if already completed
        if ($challenge->users()->where('user_id', auth()->id())->wherePivot('completed', true)->exists()) {
            return back()->with('error', 'You have already completed this mission.');
        }

        // Mark as completed
        $challenge->users()->attach(auth()->id(), [
            'completed' => true,
            'completed_at' => now(),
            'progress' => 100 // Auto-complete for now
        ]);

        // Award XP/Points (Simplified logic - normally handled via Service/Events)
        $user = auth()->user();
        $user->increment('xp', $challenge->xp_reward);
        $user->increment('points', $challenge->points_reward);
        
        // Also add to Guild Member Contribution
        $member = $guild->members()->where('user_id', $user->id)->first();
        if ($member) {
             $guild->members()->updateExistingPivot($user->id, [
                'contribution_xp' => $member->pivot->contribution_xp + $challenge->xp_reward,
                'weekly_contribution_xp' => $member->pivot->weekly_contribution_xp + $challenge->xp_reward
            ]);
            $guild->increment('total_xp', $challenge->xp_reward);
            $guild->increment('weekly_xp', $challenge->xp_reward);
        }

        return back()->with('success', 'Mission completed! Rewards claimed.');
    }
}
