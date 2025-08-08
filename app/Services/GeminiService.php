<?php
namespace App\Services;
use App\Models\User;
use Gemini\Laravel\Facades\Gemini;
use Illuminate\Support\Collection;

class GeminiService {
    // Fungsi ini tetap sama
    public function getInitialReflectionQuestion(string $userName): string { 
        return "Hello " . $userName . ", let's start!"; 
    }
    
    /**
     * Otak utama AI, sekarang dengan mode premium.
     */
    public function getConversationResponse(Collection $chatHistory, User $user): array {
        $formattedHistory = $chatHistory->map(function ($turn) {
            $userAnswer = $turn->user_answer ?? "No answer yet.";
            $aiFeedback = $turn->ai_feedback ? "\nGrowthBot Feedback: " . $turn->ai_feedback : "";
            return "GrowthBot: " . $turn->ai_question . "\nUser: " . $userAnswer . $aiFeedback;
        })->implode("\n\n");
        
        // Memilih prompt berdasarkan status langganan user
        $prompt = $user->is_premium ? 
            $this->getPremiumPrompt($user, $formattedHistory) : 
            $this->getStandardPrompt($formattedHistory);
        
        try {
      $result = Gemini::generativeModel('models/gemini-1.5-pro-latest')
                            ->generateContent($prompt)
                            ->text();
            
            $parts = explode('|||', $result, 3);

            if ($user->is_premium && isset($parts[2]) && trim($parts[2]) !== "NONE") {
                $user->update(['personality_summary' => trim($parts[2])]);
            }

            return [
                'feedback' => trim($parts[0] ?? 'Terima kasih telah berbagi.'),
                'next_question' => trim($parts[1] ?? 'Ada lagi yang ingin diceritakan?'),
            ];
        } catch (\Exception $e) {
            // Saran: Log errornya untuk debugging di masa depan
            Log::error('Gemini API Error: ' . $e->getMessage()); 
            
            // Fallback response jika API gagal
            return ['feedback' => 'Terima kasih telah berbagi.', 'next_question' => 'Boleh ceritakan lebih lanjut?'];
        }
    }    
    // Prompt untuk pengguna non-premium (hanya tanya-jawab biasa)
    private function getStandardPrompt(string $history): string {
        return "You are 'GrowthBot', a supportive AI journaling assistant speaking Indonesian. Continue a natural conversation based on the history. Respond with feedback, then a new question.\n\n<HISTORY>\n{$history}\n</HISTORY>\n\nFormat: [Feedback]|||[New Question]";
    }

    // Prompt ADVANCED untuk pengguna PREMIUM
    private function getPremiumPrompt(User $user, string $history): string {
        $personalityMemory = $user->personality_summary ? "Here is the user's personality summary so far: " . $user->personality_summary : "This is our first deep reflection session.";
        
        return <<<PROMPT
You are 'GrowthBot', a highly insightful AI psychologist and growth coach speaking Indonesian.
Your goal is to provide deep, personal insights based on a conversation with a user named {$user->name}.

{$personalityMemory}

<CONVERSATION_HISTORY>
{$history}
</CONVERSATION_HISTORY>

Based on the **ENTIRE** conversation, especially the user's LAST message, your task is three-fold:
1.  **FEEDBACK:** Write a deeply empathetic and validating response. Connect their answer to previous points if possible.
2.  **NEW QUESTION:** Ask a new, piercing follow-up question that uncovers motivations, underlying beliefs, or suggests a new perspective. Don't be afraid to be a little challenging, but always be kind.
3.  **PERSONALITY INSIGHT (Key Part):** After analyzing the ENTIRE conversation, update or create a concise, one-sentence summary of the user's current state, struggles, or emerging strengths. Example: "User seems to be linking their self-worth to productivity," or "User is learning to find joy in small, quiet moments." If it's too early to tell, respond with "NONE".

Format your response STRICTLY as follows, using '|||' as a separator:
[Your deep feedback here]|||[Your new insightful question here]|||[Your one-sentence personality insight, or NONE]
PROMPT;
    }
}
