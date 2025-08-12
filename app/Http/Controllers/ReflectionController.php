<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\OpenAIService; // Ganti dari GeminiService
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Str;
use Inertia\Inertia;
use App\Models\Reflection;
use App\Models\User;

class ReflectionController extends Controller
{
    protected $openAIService; // Ganti nama variable
    // Definisikan batas kuota gratis di sini agar mudah diubah
    private const FREE_REFLECTION_LIMIT = 10;

    public function __construct(OpenAIService $openAIService) // Ganti dari GeminiService
    {
        $this->openAIService = $openAIService;
    }

    public function index()
    {
        /** @var User $user */
        $user = Auth::user();

        // --- LOGIKA KUOTA BARU ---
        // Hitung berapa banyak jawaban yang sudah diberikan oleh pengguna
        $usageCount = $user->reflections()->whereNotNull('user_answer')->count();

        // Cek jika pengguna BUKAN premium DAN kuota gratisnya sudah habis
        if (!$user->is_premium && $usageCount >= self::FREE_REFLECTION_LIMIT) {
            // Redirect kembali ke dashboard dengan pesan flash untuk memicu modal
            return Redirect::route('dashboard')->with('show_upgrade_modal', true);
        }
        // -------------------------

        $today_session = $user->reflections()->whereDate('reflection_date', today())->orderBy('created_at')->first();
        $session_id = $today_session?->session_id ?? (string) Str::uuid();
        $history = Reflection::where('session_id', $session_id)->orderBy('created_at')->get();
        
        if ($history->isEmpty()) {
            $initialQuestion = $this->openAIService->getInitialReflectionQuestion($user->name); // Ganti service
            Reflection::create([
                'user_id' => $user->id, 
                'session_id' => $session_id, 
                'ai_question' => $initialQuestion, 
                'reflection_date' => today()
            ]);
            $history = Reflection::where('session_id', $session_id)->get();
        }

        // Kirim sisa kuota dan status premium ke frontend
        return Inertia::render('ReflectionPage', [
            'history' => $history,
            'isPremium' => $user->is_premium,
            'remainingQuota' => self::FREE_REFLECTION_LIMIT - $usageCount,
        ]);
    }

    public function store(Request $request)
    {
        /** @var User $user */
        $user = Auth::user();

        // --- TAMBAHKAN GATE DI SINI UNTUK KEAMANAN ---
        $usageCount = $user->reflections()->whereNotNull('user_answer')->count();
        if (!$user->is_premium && $usageCount >= self::FREE_REFLECTION_LIMIT) {
            // Jika pengguna mencoba mengirim jawaban saat kuota habis, paksa redirect.
            return Redirect::route('dashboard')->with('show_upgrade_modal', true);
        }
        // ---------------------------------------------

        $validated = $request->validate([
            'answer' => 'required|string|max:1000',
            'session_id' => 'required|uuid',
        ]);
        
        $lastTurn = Reflection::where('session_id', $validated['session_id'])->whereNull('user_answer')->latest()->firstOrFail();
        $lastTurn->update(['user_answer' => $validated['answer']]);

        $chatHistory = Reflection::where('session_id', $validated['session_id'])->orderBy('created_at')->get();
        
        // Memanggil service OpenAI yang baru
        $aiResponse = $this->openAIService->getConversationResponse($chatHistory, $user);
        
        $lastTurn->update(['ai_feedback' => $aiResponse['feedback']]);

        Reflection::create([
            'user_id' => $user->id,
            'session_id' => $validated['session_id'],
            'ai_question' => $aiResponse['next_question'],
            'reflection_date' => today()
        ]);
        
        return redirect()->route('refleksi.index');
    }
}