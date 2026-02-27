<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\UserCognitiveStat;

class CognitiveArenaService
{
    protected string $apiKey;
    protected string $apiUrl = 'https://api.openai.com/v1/chat/completions';

    public function __construct()
    {
        $this->apiKey = config('services.openai.api_key', env('OPENAI_API_KEY', ''));
    }

    /**
     * Generate a new scenario based on user's current cognitive level
     */
    public function generateScenario(UserCognitiveStat $stats)
    {
        $level = $this->calculateOverallLevel($stats);
        
        $prompt = "You are the Game Master of the Cognitive Arena.
Generate a 3-5 minute interactive simulation scenario to test critical thinking, decision-making, or ethical reasoning.
The user's current overall cognitive level is {$level} (out of 100).
Difficulty should be proportional to their level.

Scenario Types: Logical Fallacy Detection, Ethical Dilemma, Career Decision, Bias Awareness, Argument Analysis.
Select one type randomly.

Return ONLY a raw JSON strictly adhering to the following structure, with no markdown code blocks:
{
    \"type\": \"string (e.g., ethical_dilemma)\",
    \"difficulty_level\": \"string (Beginner/Intermediate/Advanced/Expert)\",
    \"scenario_text\": \"The full scenario description (100-200 words), ending with a question prompting the user's decision or analysis.\"
}";

        $response = $this->callOpenAI($prompt);
        if (!$response) return null;

        $jsonStr = $this->cleanJsonResponse($response);
        return json_decode($jsonStr, true);
    }

    /**
     * Evaluate the user's answer
     */
    public function evaluateAnswer(string $scenarioText, string $userAnswer, int $timeTaken, UserCognitiveStat $stats)
    {
        $prompt = "You are the Game Master of the Cognitive Arena.
Read the following scenario and the user's answer.
Scenario:
{$scenarioText}
User's Answer:
{$userAnswer}
Time taken: {$timeTaken} seconds.

Evaluate their answer based on critical thinking, communication, and decision speed. Provide reasoning-based feedback (not just right/wrong).
Return ONLY a raw JSON strictly adhering to the following structure, with no markdown code blocks:
{
    \"feedback_text\": \"Your reasoning-based feedback (100-150 words).\",
    \"stat_changes\": {
        \"critical_thinking_level\": <integer from -2 to +5>,
        \"communication_level\": <integer from -2 to +5>,
        \"decision_speed\": <integer from -2 to +5>
    },
    \"xp_earned\": <integer from 10 to 100>,
    \"reflection_prompt\": \"A short reflection question for their journal (e.g. 'What assumption influenced your choice?')\"
}";

        $response = $this->callOpenAI($prompt);
        if (!$response) return null;

        $jsonStr = $this->cleanJsonResponse($response);
        return json_decode($jsonStr, true);
    }

    private function calculateOverallLevel(UserCognitiveStat $stats): int
    {
        return (int) (($stats->critical_thinking_level + $stats->communication_level + $stats->decision_speed) / 3);
    }

    private function callOpenAI(string $prompt): ?string
    {
        try {
            $response = Http::withToken($this->apiKey)->timeout(45)->post($this->apiUrl, [
                'model' => 'gpt-4o',
                'response_format' => ['type' => 'json_object'],
                'messages' => [
                    ['role' => 'system', 'content' => 'You are the Game Master of the Cognitive Arena. Always return valid JSON object.'],
                    ['role' => 'user', 'content' => $prompt]
                ],
                'temperature' => 0.7,
            ]);

            if ($response->successful()) {
                $data = $response->json();
                if (isset($data['choices'][0]['message']['content'])) {
                    return $data['choices'][0]['message']['content'];
                }
            }
            
            Log::error('OpenAI API Error in CognitiveArenaService: ' . $response->body());
            return null;
        } catch (\Exception $e) {
            Log::error('OpenAI API Exception in CognitiveArenaService: ' . $e->getMessage());
            return null;
        }
    }

    private function cleanJsonResponse(string $text): string
    {
        $text = preg_replace('/```json\s*/', '', $text);
        $text = preg_replace('/```\s*/', '', $text);
        return trim($text);
    }
}
