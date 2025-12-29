<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use PhpOffice\PhpWord\PhpWord;
use PhpOffice\PhpWord\IOFactory;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Route;

class DocumentPageController extends Controller
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
        return Inertia::render('Docs/Index', [
            'activeTab' => 'documents',
            'currentUser' => auth()->user()
        ]);
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

    public function showPublic($share_token)
    {
        $document = Document::where('share_token', $share_token)
                            ->where('is_public', true)
                            ->with('user') 
                            ->firstOrFail();
        
        return Inertia::render('Docs/PublicView', ['document' => $document]);
    }

}


