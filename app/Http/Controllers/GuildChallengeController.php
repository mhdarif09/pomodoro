<?php

namespace App\Http\Controllers;

use App\Models\Guild;
use App\Models\Task;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GuildChallengeController extends Controller
{
    /**
     * Display a listing of the guild missions.
     */
    public function index(Guild $guild)
    {
        $isLeader = $guild->members()->where('user_id', auth()->id())->wherePivot('role', 'leader')->exists();
        
        if (!$isLeader) {
            abort(403, 'Akses ditolak. Hanya Leader yang dapat mengelola Misi.');
        }

        return Inertia::render('Guilds/Challenges/Index', [
            'guild' => [
                'id' => $guild->id,
                'name' => $guild->name,
                'emblem' => $guild->emblem,
                'leader_id' => $guild->leader->id ?? null,
            ],
            // [SYNC] Fetch missions from tasks table
            'challenges' => $guild->tasks()
                ->where('is_mission', true)
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($mission) {
                    // Check if mission is completed (Quest Style)
                    $mission->completed_by_user = $mission->is_completed;
                    // Compatibility mapping
                    $mission->starts_at = $mission->start_date;
                    $mission->ends_at = $mission->due_date;
                    return $mission;
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
            'starts_at' => 'nullable|date',
            'ends_at' => 'nullable|date|after_or_equal:starts_at',
        ]);

        // [SYNC] Use GuildEconomy functionality or manually deduct if needed
        // For simplicity and matching ToDo.jsx logic:
        $guild->tasks()->create([
            'title' => $validated['title'],
            'description' => $validated['description'],
            'xp_reward' => $validated['xp_reward'],
            'is_mission' => true,
            'status' => 'todo',
            'start_date' => $validated['starts_at'] ?? now(),
            'due_date' => $validated['ends_at'],
            'user_id' => auth()->id(), // Creator
            'approval_status' => 'approved',
        ]);

        return back()->with('success', 'Misi Guild berhasil dibuat dan muncul di Board!');
    }

    /**
     * Update the specified mission in storage.
     */
    public function update(Request $request, Guild $guild, Task $challenge)
    {
        if ($challenge->guild_id !== $guild->id) abort(404);

        $isLeader = $guild->members()->where('user_id', auth()->id())->wherePivot('role', 'leader')->exists();
        if (!$isLeader) abort(403);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'xp_reward' => 'required|integer',
            'starts_at' => 'nullable|date',
            'ends_at' => 'nullable|date|after_or_equal:starts_at',
            'is_active' => 'nullable|boolean',
        ]);

        $challenge->update([
            'title' => $validated['title'],
            'description' => $validated['description'],
            'xp_reward' => $validated['xp_reward'],
            'start_date' => $validated['starts_at'],
            'due_date' => $validated['ends_at'],
        ]);

        return back()->with('success', 'Mission updated.');
    }

    /**
     * Remove the specified mission from storage.
     */
    public function destroy(Guild $guild, Task $challenge)
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
    public function complete(Request $request, Guild $guild, Task $challenge)
    {
        if ($challenge->guild_id !== $guild->id) abort(404);
        
        // Manual completion by user (if allowed on Mission page)
        // Award XP logic...
        if ($challenge->is_completed) {
            return back()->with('error', 'Misi sudah selesai.');
        }

        $challenge->update([
            'is_completed' => true,
            'status' => 'done',
            'completed_by' => auth()->id()
        ]);

        // Award XP
        if ($challenge->xp_reward > 0) {
            auth()->user()->increment('redeemable_xp', $challenge->xp_reward);
        }

        return back()->with('success', 'Misi selesai! XP telah diberikan.');
    }
}
