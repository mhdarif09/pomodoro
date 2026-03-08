<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ChatSession;
use App\Models\ChatMessage;  
use App\Http\Requests\StoreChatSessionRequest;
use App\Http\Requests\SendChatMessageRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Exception;

class ChatAssistantController extends Controller
{
    public function getSessions(Request $request)
    {
        $sessions = $request->user()->chatSessions()
            ->orderBy('last_message_at', 'desc')
            ->get();
        return response()->json($sessions);
    }

    public function getMessages(ChatSession $session)
    {
        $this->authorize('view', $session);
        $messages = $session->messages()->orderBy('created_at', 'asc')->get();
        return response()->json($messages);
    }

    public function storeSession(StoreChatSessionRequest $request)
    {
        $validated = $request->validated();

        $session = $request->user()->chatSessions()->create([
            'title' => $validated['title'] ?? 'Chat Baru',
            'type' => $validated['type'] ?? 'general',
            'metadata' => $validated['metadata'] ?? [],
            'last_message_at' => now(),
        ]);

        return response()->json($session);
    }

    public function sendMessage(SendChatMessageRequest $request, ChatSession $session)
    {
        $this->authorize('update', $session);

        $user = $request->user();

        // Admin bypass
        if (strtolower($user->role) === 'admin') {
            // Admin has no limit
        } else {
            // 1. Check if user has AI access in their plan
            if (!$user->canAccessFeature('ai_assistant')) {
                return response()->json([
                    'error' => 'Fitur AI Assistant tidak tersedia di paket Anda. Silakan upgrade plan Anda.',
                    'needs_upgrade' => true
                ], 403);
            }

            // 2. Check Daily Limit
            $plan = $user->subscription->planDetail;
            $limit = $plan ? $plan->ai_chat_limit : 0;

            if ($limit !== -1) { // -1 means unlimited
                $todayCount = ChatMessage::whereHas('session', function($query) use ($user) {
                        $query->where('user_id', $user->id);
                    })
                    ->where('role', 'user')
                    ->whereDate('created_at', today())
                    ->count();

                if ($todayCount >= $limit) {
                    return response()->json([
                        'error' => "Anda telah mencapai limit chat harian ({$limit} chat). Silakan upgrade plan untuk limit lebih tinggi.",
                        'needs_upgrade' => true,
                        'limit_reached' => true
                    ], 429);
                }
            }
        }
        
        $validated = $request->validated();

        $message = $validated['message'] ?? 'Analyze this image.';
        $imageData = null;
        $imagePath = null;

        // Handle Image Upload
        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $path = $file->store('chat_images', 'public'); // Store in storage/app/public/chat_images
            $imagePath = $path;
            
            // Convert to Base64 for OpenAI API
            $extension = $file->getClientOriginalExtension();
            $base64 = base64_encode(file_get_contents($file->getPathname()));
            $imageData = "data:image/{$extension};base64,{$base64}";
        }
        
        // Use the existing OpenAIController logic but wrapped here
        $openAI = new OpenAIController();
        
        // Mock request for OpenAIController methods
        $proxyRequest = new Request([
            'query' => $message,
            'history' => $validated['history'] ?? [],
            'webSearch' => $validated['webSearch'] ?? false,
            'image' => $imageData, // Pass Base64 image
        ]);

        try {
            // Save User Message
            $userMsgData = [
                'role' => 'user',
                'content' => $message
            ];
            
            if ($imagePath) {
                $userMsgData['metadata'] = [
                    'image_path' => $imagePath, // Frontend uses /storage/{image_path}
                    'has_image' => true
                ];
            }

            $session->messages()->create($userMsgData);

            // Get AI Response
            $response = $openAI->ask($proxyRequest);
            $data = $response->getData(true);

            if (isset($data['error'])) {
                 throw new Exception($data['error']);
            }

            $aiContent = $data['response'];
            $sources = $data['sources'] ?? [];

            // Save AI Message
            $aiMessage = $session->messages()->create([
                'role' => 'assistant',
                'content' => $aiContent,
                'metadata' => ['sources' => $sources]
            ]);

            $session->update(['last_message_at' => now()]);

            // Auto-title if it's the first message
            if ($session->messages()->count() <= 2 && $session->title === 'Chat Baru') {
                 $this->generateTitle($session, $message);
            }

            return response()->json([
                'message' => $aiMessage,
                'session' => $session->fresh()->load('messages') // Reload messages to include the user's image msg
            ]);

        } catch (Exception $e) {
            Log::error('ChatAssistant Error: ' . $e->getMessage());
            return response()->json(['error' => 'Gagal mendapatkan respon AI.'], 500);
        }
    }

    protected function generateTitle(ChatSession $session, $firstMessage)
    {
        try {
            $prompt = "Buatkan judul singkat (3-5 kata) dalam Bahasa Indonesia untuk percakapan yang dimulai dengan pesan ini: \"{$firstMessage}\". Kembalikan HANYA judulnya saja tanpa tanda petik.";
            
            $openAI = new OpenAIController();
            $proxyRequest = new Request([
                'query' => $prompt,
                'history' => [],
                'webSearch' => false
            ]);
            
            $response = $openAI->ask($proxyRequest);
            $data = $response->getData(true);
            
            if (isset($data['response'])) {
                $session->update(['title' => trim($data['response'])]);
            }
        } catch (\Exception $e) {
            // Silent fail for title generation
        }
    }

    public function destroySession(ChatSession $session)
    {
        $this->authorize('delete', $session);
        $session->delete();
        return response()->json(['success' => true]);
    }
}
