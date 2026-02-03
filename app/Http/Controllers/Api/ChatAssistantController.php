<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ChatSession;
use App\Models\ChatMessage;
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

    public function storeSession(Request $request)
    {
        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'type' => 'nullable|string|in:general,pdf,web,youtube',
            'metadata' => 'nullable|array',
        ]);

        $session = $request->user()->chatSessions()->create([
            'title' => $validated['title'] ?? 'Chat Baru',
            'type' => $validated['type'] ?? 'general',
            'metadata' => $validated['metadata'] ?? [],
            'last_message_at' => now(),
        ]);

        return response()->json($session);
    }

    public function sendMessage(Request $request, ChatSession $session)
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
        
        // Pre-process FormData inputs
        if ($request->isJson() === false) {
            if ($request->has('history') && is_string($request->input('history'))) {
                $request->merge(['history' => json_decode($request->input('history'), true)]);
            }
            if ($request->has('webSearch')) {
                 $request->merge(['webSearch' => filter_var($request->input('webSearch'), FILTER_VALIDATE_BOOLEAN)]);
            }
        }

        $validated = $request->validate([
            'message' => 'required|string|max:10000',
            'history' => 'nullable|array',
            'webSearch' => 'nullable|boolean',
            'tools' => 'nullable|array', // e.g., ['pdf', 'web']
            'image' => 'nullable|image|max:10240', // Max 10MB for math problem photos
        ]);

        $message = $validated['message'];
        
        // Use the existing OpenAIController logic but wrapped here
        $openAI = new OpenAIController();
        
        // Mock request for OpenAIController methods
        // Mock request for OpenAIController methods
        
        // --- SUPER AGENT CONTEXT BUILDER ---
        $stats = "User: " . $user->name . "\n";
        $stats .= "Level: " . ($user->level ?? 1) . " (" . ($user->xp ?? 0) . " XP)\n";
        $stats .= "Guild: " . ($user->guilds()->first()?->name ?? 'No Guild') . "\n";
        
        // Get generic prompt (usually ideally stored in config, but defined here for now)
        $persona = <<<'EOT'
You are Super Agent AI, a personal productivity and study mentor with EXPERT-LEVEL MATHEMATICS capabilities.

Your mission is to help users become more productive, disciplined, and successful in study and task completion.
You communicate through WhatsApp messages (conversational style).

CORE BEHAVIOR:
1. Always help users move toward productive action.
2. Keep conversation friendly, human, and motivating.
3. Encourage small achievable actions (e.g., "Mau mulai 15 menit dulu?").
4. Acknowledge user's gamification progress (XP, Level, Guild).

HABIT AWARENESS:
- Use the provided user stats (Level, XP) to motivate.
- If user mentions procrastination, suggest specific techniques (Pomodoro, 5-minute rule).

MATHEMATICS EXPERT MODE:
When user asks math questions or uploads math problems:
1. **Transcribe First** - Clearly state the problem you see in the image to ensure accuracy.
2. **Solve step-by-step** - Show every step with clear reasoning.
3. **Use LaTeX** - Format ALL formulas with LaTeX syntax: $$formula$$ or \[formula\].
4. **Explain concepts** - Don't just solve, teach WHY each step works.
5. **Visual descriptions** - Describe graphs, shapes when relevant.
6. **Check work** - Verify the final answer.

MATH FORMATTING RULES:
- Inline formulas: $x^2 + 2x + 1$ or \(x^2 + 2x + 1\)
- Display formulas: $$ \frac{a}{b} $$ or \[ \frac{a}{b} \]
- Fractions: $$\frac{numerator}{denominator}$$
- Matrices: $$\begin{bmatrix} a & b \\ c & d \end{bmatrix}$$

MATH EXPERTISE LEVELS:
- Elementary: Arithmetic, fractions, decimals
- Algebra: Equations, polynomials, factoring
- Calculus: Derivatives, integrals, limits
- Linear Algebra: Matrices, vectors, eigenvalues
- Statistics: Probability, distributions, hypothesis testing
- Geometry: Triangles, circles, trigonometry
- Differential Equations: ODEs, PDEs

TONE: Friendly, motivating, intelligent, calm. NOT robotic. Patient teacher for math.
EOT;

        $fullSystemPrompt = $persona . "\n\nUSER CONTEXT:\n" . $stats;

        // Handle image upload for math problems
        $imageContext = '';
        if ($request->hasFile('image')) {
            $image = $request->file('image');
            $imageBase64 = base64_encode(file_get_contents($image->getRealPath()));
            $imageMime = $image->getMimeType();
            
            // Prepend image context to message
            $imageContext = "[User uploaded an image - likely a math problem or diagram]\n\n";
            $message = $imageContext . $message;
        }

        // Create a new request object explicitly handling files
        $proxyRequest = new Request();
        $proxyRequest->replace([
            'query' => $message,
            'history' => $validated['history'] ?? [],
            'webSearch' => $validated['webSearch'] ?? false,
            'system_prompt' => $fullSystemPrompt,
        ]);
        
        if ($request->hasFile('image')) {
            $proxyRequest->files->set('image', $request->file('image'));
        }

        try {
            // Save User Message
            $session->messages()->create([
                'role' => 'user',
                'content' => $message
            ]);

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
                'session' => $session->fresh()
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
