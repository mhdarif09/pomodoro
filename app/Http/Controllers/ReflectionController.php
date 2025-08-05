<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Services\GeminiService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Str;
use Inertia\Inertia;
use App\Models\Reflection;

class ReflectionController extends Controller {
    protected $geminiService;
    public function __construct(GeminiService $geminiService) { $this->geminiService = $geminiService; }

    public function index() {
        $user = Auth::user();

        // CEK AKSES PREMIUM DI SINI
        if (!$user->is_premium) {
            // Redirect kembali ke dashboard dengan pesan flash untuk memicu modal
            return Redirect::route('dashboard')->with('show_upgrade_modal', true);
        }

        $today_session = $user->reflections()->whereDate('reflection_date', today())->orderBy('created_at')->first();
        $session_id = $today_session?->session_id ?? (string) Str::uuid();
        $history = Reflection::where('session_id', $session_id)->orderBy('created_at')->get();
        if ($history->isEmpty()) {
            $initialQuestion = $this->geminiService->getInitialReflectionQuestion($user->name);
            Reflection::create(['user_id' => $user->id, 'session_id' => $session_id, 'ai_question' => $initialQuestion, 'reflection_date' => today()]);
            $history = Reflection::where('session_id', $session_id)->get();
        }
        return Inertia::render('ReflectionPage', ['history' => $history]);
    }

    public function store(Request $request) {
        $user = Auth::user();
        $validated = $request->validate([
            'answer' => 'required|string|max:1000',
            'session_id' => 'required|uuid',
        ]);
        
        $lastTurn = Reflection::where('session_id', $validated['session_id'])->whereNull('user_answer')->latest()->firstOrFail();
        $lastTurn->update(['user_answer' => $validated['answer']]);

        $chatHistory = Reflection::where('session_id', $validated['session_id'])->orderBy('created_at')->get();
        
        // Memanggil fungsi baru yang lebih pintar
        $aiResponse = $this->geminiService->getConversationResponse($chatHistory, $user);
        
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