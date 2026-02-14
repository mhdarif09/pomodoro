<?php

namespace App\Http\Controllers;

use App\Models\Guild;
use App\Models\User;
use App\Models\GuildMember;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GuildMemberController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Guild $guild)
    {
        if (!auth()->user()->guilds->contains('id', $guild->id)) {
            abort(403);
        }

        return Inertia::render('Guilds/Members/Index', [
            'guild' => [
                'id' => $guild->id,
                'name' => $guild->name,
                'emblem' => $guild->emblem,
                'leader_id' => $guild->leader->id ?? null,
            ],
            'members' => $guild->members()->get()->map(function ($member) {
                return [
                    'id' => $member->id,
                    'name' => $member->name,
                    'email' => $member->email,
                    'avatar' => $member->avatar,
                    'role' => $member->pivot->role,
                    'joined_at' => $member->pivot->created_at->format('M d, Y'),
                    'contribution_xp' => $member->pivot->contribution_xp,
                ];
            }),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Guild $guild, User $member)
    {
        // Authorization: Only Leader can update roles
        $isLeader = $guild->members()->where('user_id', auth()->id())->wherePivot('role', 'leader')->exists();
        if (!$isLeader) {
            abort(403, 'Unauthorized');
        }

        // Cannot change own role/kick self via this (leave guild instead)
        if ($member->id === auth()->id()) {
            return back()->with('error', 'You cannot change your own role here.');
        }

        $validated = $request->validate([
            'role' => 'required|in:member,officer', // Leader is unique, handled via transfer (future)
        ]);

        $guild->members()->updateExistingPivot($member->id, ['role' => $validated['role']]);

        return back()->with('success', 'Member role updated.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Guild $guild, User $member)
    {
         // Authorization: Only Leader/Officer can kick
        $currentUserRole = $guild->members()->where('user_id', auth()->id())->value('guild_members.role');
        
        if (!in_array($currentUserRole, ['leader', 'officer'])) {
             abort(403, 'Unauthorized');
        }

        // Officer cannot kick Leader or other Officer
        $targetRole = $guild->members()->where('user_id', $member->id)->value('guild_members.role');
        if ($currentUserRole === 'officer' && in_array($targetRole, ['leader', 'officer'])) {
            abort(403, 'Officers cannot kick leaders or other officers.');
        }
        
        if ($member->id === auth()->id()) {
             return back()->with('error', 'Use "Leave Guild" to remove yourself.');
        }

        $guild->members()->detach($member->id);

        return back()->with('success', 'Member removed from guild.');
    }
}
