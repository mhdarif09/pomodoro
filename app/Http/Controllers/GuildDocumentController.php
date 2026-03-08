<?php

namespace App\Http\Controllers;

use App\Models\Guild;
use App\Models\Document;
use Illuminate\Support\Str;
use App\Helpers\SecurityHelper;

class GuildDocumentController extends Controller
{
    public function index(Guild $guild)
    {
        if (!auth()->user()->guilds->contains($guild->id)) abort(403);

        return Inertia::render('Guilds/Documents/Index', [
            'guild' => $guild,
            'documents' => $guild->documents()->with('user')->latest()->get(),
        ]);
    }

    public function store(Request $request, Guild $guild)
    {
        if (!auth()->user()->guilds->contains($guild->id)) abort(403);

        $document = $guild->documents()->create([
            'title' => 'Untitled Guild Doc',
            'content' => null,
            'user_id' => auth()->id(),
            'share_token' => (string) Str::uuid(),
        ]);

        return to_route('guilds.documents.show', [$guild->id, $document->id]);
    }

    public function show(Guild $guild, Document $document)
    {
        if ($document->guild_id !== $guild->id) abort(404);
        
        // MEMBERSHIP CHECK
        if (!$guild->members()->where('user_id', auth()->id())->exists()) {
            abort(403);
        }

        return Inertia::render('Guilds/Documents/Show', [
            'guild' => $guild,
            'document' => $document->load('user'),
        ]);
    }

    public function update(Request $request, Guild $guild, Document $document)
    {
        if ($document->guild_id !== $guild->id) abort(404);

        // MEMBERSHIP CHECK: Must be a guild member to edit
        if (!$guild->members()->where('user_id', auth()->id())->exists()) {
            abort(403);
        }
        
        $validated = $request->validate([
            'title' => 'sometimes|string',
            'content' => 'sometimes|nullable',
            'is_pinned' => 'sometimes|boolean',
        ]);

        if (isset($validated['content'])) {
            $validated['content'] = SecurityHelper::sanitizeHtml($validated['content']);
        }

        $document->update($validated);
        
        return back(); // Auto-save usually
    }

    public function destroy(Guild $guild, Document $document)
    {
        if ($document->guild_id !== $guild->id) abort(404);

        // AUTHORIZATION: Only creator or leader can delete
        $isLeader = $guild->members()->where('user_id', auth()->id())->wherePivot('role', 'leader')->exists();
        $isCreator = $document->user_id === auth()->id();

        if (!$isLeader && !$isCreator) {
            abort(403, 'Anda tidak memiliki akses untuk menghapus dokumen ini.');
        }

        $document->delete();
        return to_route('guilds.documents.index', $guild->id);
    }
}
