<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppAIService
{
    protected $openaiApiKey;
    protected $apiUrl = 'https://api.openai.com/v1/chat/completions';
    protected $calendarService;

    public function __construct(GoogleCalendarService $calendarService)
    {
        $this->openaiApiKey = config('services.openai.api_key');
        $this->calendarService = $calendarService;
    }

    /**
    /**
     * Generate a smart response for the WhatsApp bot
     */
    public function generateResponse(User $user, string $userMessage): string
    {
        try {
            // --- 1. Fetch Task Details ---
            $tasks = $user->tasks()
                ->where('status', '!=', 'completed')
                ->orderBy('due_date', 'asc')
                ->take(5)
                ->get();

            // --- 2. Fetch Conversation History (Last 5 interactions) ---
            $history = \App\Models\ReminderLog::where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->take(5)
                ->get()
                ->sortBy('created_at'); // Reorder for context

            $conversationHistory = "";
            foreach ($history as $log) {
                // Use sender column if available, fallback to type inference
                $role = $log->sender === 'user' ? 'user' : 'assistant';
                $conversationHistory .= "{$role}: {$log->message}\n";
            }

            $contextData = "=== KONTEKS USER ===\n";
            $contextData .= "[TUGAS PENDING]\n";
            if ($tasks->count() > 0) {
                foreach ($tasks as $task) {
                    $due = $task->due_date ? " (Deadline: {$task->due_date->format('d M Y')})" : "";
                    $est = $task->estimated_minutes ? " ({$task->estimated_minutes} min)" : ""; // Add duration info
                    $contextData .= "- {$task->title} {$due}{$est}\n";
                }
            } else {
                $contextData .= "Tidak ada tugas pending.\n";
            }

            // --- 1b. Fetch Google Calendar Events & Free Slots ---
            $calendarEvents = [];
            $freeSlotsContext = "";
            
            if ($user->google_access_token) {
                // Fetch events
                $calendarEvents = $this->calendarService->getUpcomingEvents($user, 2);
                
                // Fetch Free Slots for today
                $freeSlots = $this->calendarService->findFreeSlots($user, Carbon::today());
                if (!empty($freeSlots)) {
                    $freeSlotsContext = "SLOT KOSONG HARI INI (Ready untuk Deep Work):\n";
                    foreach ($freeSlots as $slot) {
                        $start = $slot['start']->format('H:i');
                        $end = $slot['end']->format('H:i');
                        $freeSlotsContext .= "- Pukul {$start} s/d {$end} ({$slot['duration']} menit)\n";
                    }
                } else {
                    $freeSlotsContext = "HARI INI PADAT MERAYAP. Tidak ada slot kosong > 15 menit.\n";
                }
            }

            $calendarContext = "[JADWAL GOOGLE CALENDAR (Hari Ini & Besok)]\n";
            if (empty($calendarEvents)) {
                $calendarContext .= "Tidak ada data jadwal (atau belum connect GCal).\n";
            } else {
                foreach ($calendarEvents as $event) {
                    $time = $event['is_all_day'] ? "All Day" : substr($event['start'], 11, 5) . " - " . substr($event['end'], 11, 5);
                    $date = substr($event['start'], 0, 10);
                    $summary = $event['summary'];
                    $calendarContext .= "- [{$date}] [{$time}] {$summary}\n";
                }
            }
            $contextData .= "\n" . $calendarContext . "\n" . $freeSlotsContext;

            // --- 3. Build System Prompt (High Premium Assistant) ---
            $userName = $user->name;
            $systemPrompt = "Kamu adalah Personal Assistant eksklusif untuk {$userName}.
            Karakter: Cerdas, Proaktif, Empatik, dan Sedikit Humoris (Human-like). 
            Kamu bukan bot kaku, melainkan partner produktivitas kelas atas.

            KONTEKS BARU SAJA TERJADI:
            {$conversationHistory}
            
            DATA LENGKAP USER:
            {$contextData}
            
            INSTRUKSI PENTING:
            1. **Cek Jadwal Dulu**: Sebelum menyarankan waktu, SELALU lihat [JADWAL GOOGLE CALENDAR] dan [SLOT KOSONG].
               - Jangan sarankan jam yang bertabrakan.
               - Jika padat, tunjukkan empati: 'Waduh, hari ini full banget bos. Mau selipin istirahat bentar?'
            
            2. **Respon Natural**:
               - Gunakan bahasa percakapan sehari-hari tapi tetap sopan.
               - Contoh: 'Oke sip', 'Siap bos', 'Gas keun', 'Hati-hati burnout ya'.
            
            3. **Kelola Tugas**:
               - Jika user minta saran tugas, pilih dari [TUGAS PENDING] yang ETIMASI WAKTUNYA muat di SLOT KOSONG terdekat.
               - Jika slot hanya 30 menit, jangan sarankan tugas berat 2 jam.
            
            4. **Handling 'Udah'/'Belum'**:
               - 'Udah': Rayakan! Beri pujian spesifik.
               - 'Belum': Tanya kendala atau tawarkan 'biar aku pecah jadi subtask kecil?'.

            5. **Insight**:
               - Sesekali berikan insight jika relevan, misal: 'Kamu produktif banget pagi ini!'

            Jawablah dengan singkat, padat, dan membantu. Jangan terlalu panjang lebar seperti artikel.
            ";

            // 4. Call OpenAI
            $messages = [
                ['role' => 'system', 'content' => $systemPrompt],
                ['role' => 'user', 'content' => $userMessage]
            ];

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->openaiApiKey,
                'Content-Type' => 'application/json',
            ])->timeout(30)->post($this->apiUrl, [
                'model' => 'gpt-4o-mini',
                'messages' => $messages,
                'temperature' => 0.8, // More creative/natural
                'max_tokens' => 300,
            ]);

            if ($response->successful()) {
                $result = $response->json();
                $reply = $result['choices'][0]['message']['content'] ?? 'Maaf, aku lagi loading nih.';
                
                // Log AI response as 'chat'
                \App\Models\ReminderLog::create([
                    'user_id' => $user->id,
                    'message' => $reply,
                    'sender' => 'assistant',
                    'type' => 'chat'
                ]);

                return $reply;
            }

            Log::error('WhatsAppAI: OpenAI API failed', ['status' => $response->status(), 'body' => $response->body()]);
            return 'Waduh, otakku lagi error nih. Coba nanti lagi ya kak! 🤕';

        } catch (\Exception $e) {
            Log::error('WhatsAppAI: Exception', ['error' => $e->getMessage()]);
            return 'Ada gangguan teknis nih kak. Maaf ya! 🙏';
        }
    }

    /**
     * Generate a Smart Reminder Message for a specific Task
     */
    public function generateSmartReminder(User $user, $task): string
    {
        $userName = $user->name;
        $taskTitle = $task->title;
        $dueDate = $task->due_date ? $task->due_date->format('d M Y H:i') : 'secepatnya';

        $prompt = "Buatkan pesan reminder WhatsApp yang natural, ramah, dan 'memancing interaksi' untuk {$userName}.
        Tugas: '{$taskTitle}'. Deadline: {$dueDate}.
        
        Contoh tone:
        - 'Halo {$userName}, gimana kabarnya? Tugas {$taskTitle} udah disentuh belum? Deadline besok lho 👀'
        - 'Siang {$userName}! Cuma mau ingetin {$taskTitle}. Mending dicicil sekarang yuk biar gak panik nanti.'
        
        Buat variasi yang beda, singkat, dan personal. Akhiri dengan pertanyaan yang bikin user mau bales ('udah brp persen?', 'gas skrg?', dll).";

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->openaiApiKey,
                'Content-Type' => 'application/json',
            ])->post($this->apiUrl, [
                'model' => 'gpt-4o-mini',
                'messages' => [['role' => 'user', 'content' => $prompt]],
                'temperature' => 0.9,
                'max_tokens' => 150,
            ]);

            return $response->json()['choices'][0]['message']['content'] ?? "Halo {$userName}, jangan lupa tugas {$taskTitle} ya!";
        } catch (\Exception $e) {
            return "Halo {$userName}, reminder untuk tugas: {$taskTitle}. Semangat!";
        }
    }
}
