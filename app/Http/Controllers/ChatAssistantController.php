<?php

namespace App\Http\Controllers;

use App\Models\ChatSession;
use App\Models\ChatMessage;
use App\Services\OpenAIService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ChatAssistantController extends Controller
{
    protected $openAIService;

    public function __construct(OpenAIService $openAIService)
    {
        $this->openAIService = $openAIService;
    }

    public function index()
    {
        $sessions = ChatSession::where('user_id', auth()->id())
            ->orderByDesc('updated_at')
            ->get();
            
        return response()->json($sessions);
    }

    public function store(Request $request)
    {
        $request->validate(['title' => 'required|string|max:255']);

        $session = ChatSession::create([
            'user_id' => auth()->id(),
            'title' => $request->title,
            'type' => 'educational',
            'model' => 'gpt-4o-mini',
            'last_message_at' => now(),
        ]);

        return response()->json($session);
    }

    public function messages(ChatSession $session)
    {
        $this->authorize('view', $session);
        
        return response()->json($session->messages()
            ->orderBy('created_at')
            ->get());
    }

    public function sendMessage(ChatSession $session, Request $request)
    {
        $this->authorize('update', $session);

        $request->validate([
            'message' => 'nullable|string',
            'image' => 'nullable|image|max:5120', // Max 5MB
        ]);

        if (auth()->user()->premium_features['ai_assistant'] !== true) {
            return response()->json(['error' => 'Premium required'], 403);
        }

        return DB::transaction(function () use ($session, $request) {
            $userMessageInput = $request->input('message') ?? '';
            $imageData = null;

            // Handle Image Upload
            if ($request->hasFile('image')) {
                $path = $request->file('image')->store('chat-images', 'public');
                $url = asset('storage/' . $path);
                
                // For OpenAI API, we need base64 or public URL
                // If local, asset() gives localhost URL which OpenAI can't access
                // So we'll convert to base64 for API
                $imageContent = file_get_contents($request->file('image')->getRealPath());
                $base64Image = 'data:' . $request->file('image')->getMimeType() . ';base64,' . base64_encode($imageContent);
                
                $imageData = [
                    'path' => $path,
                    'url' => $base64Image // Send base64 to OpenAI
                ];
            }

            // Save User Message
            $userMessage = $session->messages()->create([
                'role' => 'user',
                'content' => $userMessageInput,
                'metadata' => $imageData ? ['image_path' => $imageData['path']] : null,
            ]);

            // Get AI Response
            $history = $session->messages()
                ->where('id', '!=', $userMessage->id) // Exclude current message as it is passed separately or manually added
                ->orderBy('created_at')
                ->take(10) // Limit context
                ->get();

            $aiResponseText = $this->openAIService->getEducationalResponse($history, $userMessageInput, $imageData);

            // Save AI Message
            $aiMessage = $session->messages()->create([
                'role' => 'assistant',
                'content' => $aiResponseText,
            ]);

            // Update Session Title if it's the first exchange and default title
            if ($session->messages()->count() <= 2 && $session->title === 'Chat Baru') {
                // Generate title based on user message
                // For now, just take first few words
                $newTitle = substr($userMessageInput, 0, 30) . '...';
                if ($imageData && empty($userMessageInput)) {
                    $newTitle = 'Photo Question';
                }
                $session->update(['title' => $newTitle]);
            }

            $session->update(['last_message_at' => now()]);

            return response()->json([
                'message' => $aiMessage,
                'session' => $session->fresh()
            ]);
        });
    }

    public function destroy(ChatSession $session)
    {
        $this->authorize('delete', $session);
        $session->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
