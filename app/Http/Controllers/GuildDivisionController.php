<?php

namespace App\Http\Controllers;

use App\Models\Guild;
use App\Models\GuildDivision;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GuildDivisionController extends Controller
{
    public function index(Guild $guild)
    {
        if (!auth()->user()->guilds->contains('id', $guild->id)) {
            abort(403);
        }

        return Inertia::render('Guilds/Divisions/Index', [
            'guild' => $guild,
            'divisions' => $guild->divisions()->withCount('members')->get(),
            'members' => $guild->members()->with(['guildMembers' => function($q) use ($guild) {
                $q->where('guild_id', $guild->id);
            }])->get(),
        ]);
    }

    public function store(Request $request, Guild $guild)
    {
        // ROLE CHECK: Only leader can manage divisions
        if (!$guild->members()->where('user_id', auth()->id())->wherePivot('role', 'leader')->exists()) {
            abort(403, 'Hanya Leader yang dapat membuat divisi.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $guild->divisions()->create($validated);

        return back()->with('success', 'Division created.');
    }

    public function update(Request $request, Guild $guild, GuildDivision $division)
    {
        if ($division->guild_id !== $guild->id) abort(404);
        
        // ROLE CHECK: Only leader can manage divisions
        if (!$guild->members()->where('user_id', auth()->id())->wherePivot('role', 'leader')->exists()) {
            abort(403, 'Hanya Leader yang dapat mengubah divisi.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $division->update($validated);

        return back()->with('success', 'Division updated.');
    }

    public function destroy(Guild $guild, GuildDivision $division)
    {
         if ($division->guild_id !== $guild->id) abort(404);

         // ROLE CHECK: Only leader can manage divisions
         if (!$guild->members()->where('user_id', auth()->id())->wherePivot('role', 'leader')->exists()) {
             abort(403, 'Hanya Leader yang dapat menghapus divisi.');
         }

         $division->delete();
         return back()->with('success', 'Division deleted.');
    }

    public function assignMember(Request $request, Guild $guild)
    {
        // ROLE CHECK: Only leader can assign members to divisions
        if (!$guild->members()->where('user_id', auth()->id())->wherePivot('role', 'leader')->exists()) {
            abort(403, 'Hanya Leader yang dapat mengatur penugasan divisi.');
        }

        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'division_id' => 'nullable|exists:guild_divisions,id',
        ]);

        if ($validated['division_id']) {
             $division = GuildDivision::find($validated['division_id']);
             if ($division->guild_id !== $guild->id) abort(403);
        }

        // Update existing GuildMember record
        $member = $guild->guildMembers()->where('user_id', $validated['user_id'])->firstOrFail();
        $member->update(['division_id' => $validated['division_id']]);

        return back()->with('success', 'Member assigned to division.');
    }
}
