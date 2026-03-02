<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class DocumentController extends Controller
{


    public function search(Request $request)
    {
        $query = $request->input('query');
        if (!$query) {
            return response()->json(['documents' => []]);
        }

        $user = auth()->user();
        $ownedDocumentIds = $user->documents()->where('title', 'like', "%{$query}%")->pluck('documents.id');
        $sharedDocumentIds = $user->sharedDocuments()->where('title', 'like', "%{$query}%")->pluck('documents.id');
        $allDocumentIds = $ownedDocumentIds->merge($sharedDocumentIds)->unique();

        $documents = Document::whereIn('id', $allDocumentIds)
                            ->select('id', 'title', 'updated_at', 'is_public', 'share_token')
                            ->limit(10)
                            ->get();

        return response()->json([
            'documents' => $documents
        ]);
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
        $this->authorize('view', $document);
        
        $document->load('collaborators', 'user');
        $document->share_url = $document->is_public && $document->share_token ? route('docs.share', $document->share_token) : null;

        return response()->json([
            'document' => $document
        ]);
    }

    public function update(Request $request, Document $document)
    {
        $this->authorize('update', $document);

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
        $this->authorize('delete', $document);
        $document->delete();
        return response()->json(['message' => 'Document deleted successfully']);
    }

    public function toggleSharing(Request $request, Document $document)
    {
        $this->authorize('toggleSharing', $document);

        $document->is_public = !$document->is_public;
        if ($document->is_public && !$document->share_token) {
            $document->share_token = (string) Str::uuid();
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
        $this->authorize('invite', $document);

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
