<?php

namespace App\Http\Controllers;

use App\Models\MiniModul;
use App\Models\MiniModulChapter;
use App\Models\UserModulProgress;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use OpenAI\Laravel\Facades\OpenAI;

class MiniModulAiController extends Controller
{
    /**
     * Memulai atau melanjutkan diskusi dengan AI tutor (general).
     */
    public function startDiscussion(Request $request, MiniModul $miniModul, MiniModulChapter $chapter)
    {
        try {
            $request->validate(['message' => 'required|string|max:2000']);

            if ($chapter->mini_modul_id !== $miniModul->id) {
                return response()->json(['error' => 'Resource mismatch'], 404);
            }

            $progress = UserModulProgress::firstOrCreate(
                [
                    'user_id' => auth()->id(),
                    'mini_modul_id' => $miniModul->id,
                    'chapter_id' => $chapter->id
                ],
                ['is_completed' => false, 'ai_discussions' => []]
            );

            // Memory dari diskusi sebelumnya
            $history = $progress->ai_discussions ?? [];

            $aiResponse = $this->generateAiResponseWithMemory($chapter, $request->message, $history);

            $discussion = [
                'id'           => uniqid('disc_'),
                'timestamp'    => now()->toISOString(),
                'user_message' => $request->message,
                'ai_response'  => $aiResponse,
                'context'      => ['chapter_title' => $chapter->title, 'modul_title' => $miniModul->title]
            ];

            $history[] = $discussion;
            $progress->ai_discussions = $history;
            $progress->save();

            return response()->json(['success' => true, 'discussion' => $discussion]);

        } catch (ValidationException $e) {
            return response()->json(['success' => false, 'message' => 'Pesan tidak boleh kosong.', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            Log::error('AI Discussion Error', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);
            return response()->json(['success' => false, 'message' => 'Terjadi kesalahan pada server AI.'], 500);
        }
    }

    /**
     * Mendapatkan riwayat diskusi.
     */
    public function getDiscussions(MiniModul $miniModul, MiniModulChapter $chapter)
    {
        if ($chapter->mini_modul_id !== $miniModul->id) {
            return response()->json(['error' => 'Resource mismatch'], 404);
        }

        $progress = UserModulProgress::where('user_id', auth()->id())
            ->where('mini_modul_id', $miniModul->id)
            ->where('chapter_id', $chapter->id)
            ->first();

        return response()->json(['discussions' => $progress->ai_discussions ?? []]);
    }

    /**
     * Memulai simulasi role-playing dengan memory.
     */
    public function simulateRole(Request $request, MiniModul $miniModul, MiniModulChapter $chapter)
    {
        try {
            $request->validate([
                'role'     => 'required|string|in:teacher,student,expert,beginner',
                'scenario' => 'required|string|max:1000'
            ]);

            if ($chapter->mini_modul_id !== $miniModul->id) {
                return response()->json(['error' => 'Resource mismatch'], 404);
            }

            $progress = UserModulProgress::firstOrCreate(
                [
                    'user_id' => auth()->id(),
                    'mini_modul_id' => $miniModul->id,
                    'chapter_id' => $chapter->id
                ],
                ['is_completed' => false, 'ai_discussions' => []]
            );

            $history = $progress->ai_discussions ?? [];

            $response = $this->generateRoleBasedResponseWithMemory(
                $chapter,
                $request->scenario,
                $request->role,
                $history
            );

            $discussion = [
                'id'           => uniqid('role_'),
                'timestamp'    => now()->toISOString(),
                'user_message' => "[Role: {$request->role}] " . $request->scenario,
                'ai_response'  => $response,
                'context'      => ['chapter_title' => $chapter->title, 'modul_title' => $miniModul->title, 'role' => $request->role]
            ];

            $history[] = $discussion;
            $progress->ai_discussions = $history;
            $progress->save();

            return response()->json(['success' => true, 'role_response' => $response]);

        } catch (ValidationException $e) {
            return response()->json(['success' => false, 'message' => 'Input tidak valid.', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            Log::error('AI RolePlay Error', ['message' => $e->getMessage()]);
            return response()->json(['success' => false, 'message' => 'Gagal memulai simulasi.'], 500);
        }
    }

    /**
     * AI General Discussion dengan Memory.
     */
    private function generateAiResponseWithMemory(MiniModulChapter $chapter, string $userMessage, array $history): string
    {
        if (empty(env('OPENAI_API_KEY'))) {
            Log::warning('OpenAI API Key is not set.');
            return "Maaf, fitur AI belum dikonfigurasi oleh administrator.";
        }

        $systemPrompt = "Anda adalah AI Tutor bernama SinauBot. 
Jawab dalam bahasa Indonesia, ramah, natural, dan interaktif. 
Konteks materi: '{$chapter->title}'. Isi materi: " . strip_tags($chapter->content);

        $messages = [['role' => 'system', 'content' => $systemPrompt]];

        foreach ($history as $item) {
            $messages[] = ['role' => 'user', 'content' => $item['user_message']];
            $messages[] = ['role' => 'assistant', 'content' => $item['ai_response']];
        }

        $messages[] = ['role' => 'user', 'content' => $userMessage];

        try {
            $result = OpenAI::chat()->create([
                'model'    => 'gpt-4o-mini',
                'messages' => $messages,
                'temperature' => 0.8,
                'max_tokens' => 400,
            ]);
            return trim($result->choices[0]->message->content ?? '');
        } catch (\Exception $e) {
            Log::error('OpenAI API Call Failed', ['error' => $e->getMessage()]);
            return "Maaf, terjadi kendala saat menghubungi AI.";
        }
    }

    /**
     * AI Role-based dengan Memory.
     */
    private function generateRoleBasedResponseWithMemory(MiniModulChapter $chapter, string $scenario, string $role, array $history): string
    {
        if (empty(env('OPENAI_API_KEY'))) {
            return "Fitur AI belum dikonfigurasi.";
        }

        $roleStyles = [
            'teacher' => [
                'tone' => "Bahasa formal namun ramah. Gunakan analogi sehari-hari. Jawab dengan langkah-langkah sistematis.",
                'goal' => "Memastikan murid paham materi secara menyeluruh."
            ],
            'student' => [
                'tone' => "Bahasa santai dan akrab. Gunakan sedikit humor jika cocok. Sertakan pertanyaan balik untuk memancing diskusi.",
                'goal' => "Belajar bareng dan saling tukar ide."
            ],
            'expert' => [
                'tone' => "Bahasa profesional dan fokus pada detail teknis. Sertakan istilah khusus tapi jelaskan artinya.",
                'goal' => "Memberikan wawasan mendalam dan perspektif luas."
            ],
            'beginner' => [
                'tone' => "Bahasa sangat sederhana dan penuh rasa ingin tahu. Ajukan pertanyaan lanjutan untuk menggali pemahaman.",
                'goal' => "Memahami konsep dasar dengan jelas."
            ]
        ];

        $selectedStyle = $roleStyles[$role] ?? $roleStyles['teacher'];

        $systemPrompt = "
Anda adalah SinauBot yang berperan sebagai {$role}.
Instruksi utama: {$selectedStyle['tone']}
Tujuan: {$selectedStyle['goal']}
Skenario: '{$scenario}'
Kaitkan jawaban dengan materi bab '{$chapter->title}'.
Materi inti: " . strip_tags($chapter->content) . "
Jawablah secara natural, sesuai peran, dan mudah dipahami.
";

        $messages = [['role' => 'system', 'content' => $systemPrompt]];

        foreach ($history as $item) {
            $messages[] = ['role' => 'user', 'content' => $item['user_message']];
            $messages[] = ['role' => 'assistant', 'content' => $item['ai_response']];
        }

        $messages[] = ['role' => 'user', 'content' => $scenario];

        try {
            $result = OpenAI::chat()->create([
                'model'    => 'gpt-4o-mini',
                'messages' => $messages,
                'temperature' => 0.85,
                'max_tokens' => 500,
            ]);

            return trim($result->choices[0]->message->content ?? '');
        } catch (\Exception $e) {
            Log::error('OpenAI API Call Failed', ['error' => $e->getMessage()]);
            return "Maaf, terjadi masalah saat memulai simulasi.";
        }
    }
}
