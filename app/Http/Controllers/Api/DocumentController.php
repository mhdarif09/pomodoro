<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class DocumentController extends Controller
{
    private function canAccess(Document $document, User $user)
    {
        if ($document->user_id === $user->id) {
            return true;
        }
        return $document->collaborators()->where('user_id', $user->id)->exists();
    }

    public function index()
    {
        $user = auth()->user();
        $ownedDocumentIds = $user->documents()->pluck('documents.id');
        $sharedDocumentIds = $user->sharedDocuments()->pluck('documents.id');
        $allDocumentIds = $ownedDocumentIds->merge($sharedDocumentIds)->unique();
        
        $documents = Document::whereIn('id', $allDocumentIds)
                            ->with('user')
                            ->latest('updated_at')
                            ->paginate(12);

        return response()->json([
            'documents' => $documents
        ]);
    }

    public function store(Request $request)
    {
        $document = auth()->user()->documents()->create();
        return response()->json([
            'message' => 'Document created successfully',
            'document' => $document
        ], 201);
    }

    public function show(Document $document)
    {
        if (!$this->canAccess($document, auth()->user())) {
             return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        $document->load('collaborators', 'user');
        $document->share_url = $document->is_public && $document->share_token ? route('docs.share', $document->share_token) : null;

        return response()->json([
            'document' => $document
        ]);
    }

    public function update(Request $request, Document $document)
    {
        if (!$this->canAccess($document, auth()->user())) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validatedData = $request->validate([
            'title' => 'nullable|string|max:255',
            'content' => 'nullable'
        ]);
        
        if (array_key_exists('content', $validatedData) && is_string($validatedData['content'])) {
            $validatedData['content'] = json_decode($validatedData['content'], true);
        }

        $document->update($validatedData);

        return response()->json([
            'message' => 'Document updated successfully',
            'document' => $document
        ]);
    }

    public function destroy(Document $document)
    {
        if (auth()->user()->id !== $document->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        $document->delete();
        return response()->json(['message' => 'Document deleted successfully']);
    }

    public function toggleSharing(Request $request, Document $document)
    {
        $document->is_public = !$document->is_public;
        if ($document->is_public && !$document->share_token) {
            $document->share_token = Str::uuid();
        }
        $document->save();
        
        $share_url = null;
        if ($document->is_public) {
            $share_url = route('docs.share', $document->share_token);
        }
        
        return response()->json([
            'is_public' => $document->is_public,
            'share_url' => $share_url,
        ]);
    }

    public function invite(Request $request, Document $document)
    {
        if ($request->user()->id !== $document->user_id) {
            return response()->json(['message' => 'Hanya pemilik yang bisa mengundang.'], 403);
        }

        $request->validate([
            'email' => 'required|email|exists:users,email',
        ]);

        $userToInvite = User::where('email', $request->email)->first();

        if ($userToInvite->id === $document->user_id) {
            return response()->json(['message' => 'Anda tidak bisa mengundang diri sendiri.'], 422);
        }

        $document->collaborators()->syncWithoutDetaching([
            $userToInvite->id => ['role' => 'editor']
        ]);

        $collaborator = $document->collaborators()->find($userToInvite->id);

        return response()->json([
            'message' => 'Pengguna berhasil diundang sebagai editor.',
            'collaborator' => $collaborator,
        ]);
    }
}
