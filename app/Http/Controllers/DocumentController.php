<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use PhpOffice\PhpWord\PhpWord;
use PhpOffice\PhpWord\IOFactory;
use App\Http\Controllers\OpenAIController;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Route;

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
    
    return Inertia::render('Docs/Index', [
        'documents' => $documents,
        'currentUser' => $user
    ]);
    }

    public function store()
    {
        $document = auth()->user()->documents()->create();
        return redirect()->route('docs.show', $document);
    }
    
    public function show(Document $document)
    {
        if (!$this->canAccess($document, auth()->user())) {
            abort(403);
        }
        
        $document->share_url = $document->is_public && $document->share_token && Route::has('docs.share')
            ? route('docs.share', $document->share_token)
            : null;
            
        $document->load('collaborators', 'user');

        return Inertia::render('Docs/Show', ['document' => $document]);
    }

    public function update(Request $request, Document $document)
    {
        if (!$this->canAccess($document, auth()->user())) {
            abort(403);
        }

        $validatedData = $request->validate([
            'title' => 'nullable|string|max:255',
            'content' => 'nullable|string'
        ]);
        
        if (array_key_exists('content', $validatedData) && is_string($validatedData['content'])) {
            $validatedData['content'] = json_decode($validatedData['content'], true);
        }

        $document->update($validatedData);

        return response()->noContent();
    }

    public function destroy(Document $document)
    {
        if (auth()->user()->id !== $document->user_id) {
            abort(403);
        }
        $document->delete();
        return redirect()->route('docs.index')->with('success', 'Dokumen berhasil dihapus.');
    }
    
    public function generateAiContent(Request $request, OpenAIController $openAI)
    {
        $request->validate(['prompt' => 'required|string']);
        $dummyRequest = new Request(['query' => $request->prompt]);
        $response = $openAI->ask($dummyRequest);
        $content = json_decode($response->getContent(), true);
        return response()->json(['text' => $content['response'] ?? 'Maaf, terjadi kesalahan pada AI.']);
    }

    public function exportDocx(Document $document)
    {
        $phpWord = new PhpWord();
        $section = $phpWord->addSection();
        $content = $document->content;
        if (is_array($content)) {
            foreach ($content as $block) {
                $type = $block['type'] ?? 'paragraph';
                $text = $this->getTextFromBlock($block);
                switch ($type) {
                    case 'heading':
                        $level = $block['props']['level'] ?? 1;
                        $section->addTitle($text, $level);
                        break;
                    case 'bulletListItem':
                        $section->addListItem($text, 0, null, 'bullet');
                        break;
                    case 'numberListItem':
                        $section->addListItem($text, 0, null, 'number');
                        break;
                    case 'paragraph':
                    default:
                        $section->addText($text);
                        break;
                }
            }
        }
        $objWriter = IOFactory::createWriter($phpWord, 'Word2007');
        $fileName = Str::slug($document->title ?: 'document') . '.docx';
        return response()->streamDownload(
            fn() => $objWriter->save('php://output'),
            $fileName
        );
    }
    
    private function getTextFromBlock(array $block): string
    {
        $text = '';
        if (isset($block['content']) && is_array($block['content'])) {
            foreach ($block['content'] as $inlineContent) {
                if ($inlineContent['type'] === 'text') {
                    $text .= $inlineContent['text'];
                }
            }
        }
        return $text;
    }

    public function toggleSharing(Request $request, Document $document)
    {
        $document->is_public = !$document->is_public;
        if ($document->is_public && !$document->share_token) {
            $document->share_token = Str::uuid();
        }
        $document->save();
        
        $share_url = null;
        if ($document->is_public && Route::has('docs.share')) {
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

   public function showPublic($share_token)
   {
        $document = Document::where('share_token', $share_token)
                            ->where('is_public', true)
                            ->with('user') 
                            ->firstOrFail();
        
        return Inertia::render('Docs/PublicView', ['document' => $document]);
   }
}