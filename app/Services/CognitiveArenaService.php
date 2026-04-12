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
    public function generateScenario(UserCognitiveStat $stats, ?string $topic = null, ?string $difficulty = null)
    {
        $level = $this->calculateOverallLevel($stats);
        
        $topicInstruction = $topic ? "The topic MUST be exactly focused on: {$topic}." : "Select one type randomly from: Logical Fallacy Detection, Ethical Dilemma, Career Decision, Bias Awareness, Argument Analysis.";
        
        $difficultyInstruction = $difficulty ? "The difficulty level MUST be set to: {$difficulty}." : "Difficulty should be proportional to their level.";

        $prompt = "You are the Game Master of the Cognitive Arena.
Generate a cohesive simulation scenario and EXACTLY 10 multiple-choice questions to test critical thinking, decision-making, or reasoning.
The user's current overall cognitive level is {$level} (out of 100).
{$difficultyInstruction}
The language MUST be primarily Indonesian, but you can use English if the context demands it.
{$topicInstruction}

You must provide EXACTLY 10 questions. Each question must have exactly 3 multiple choice options (A, B, C).

Return ONLY a raw JSON strictly adhering to the following structure, with no markdown code blocks:
{
    \"type\": \"string (The topic chosen, e.g., Ethical Dilemma)\",
    \"difficulty_level\": \"string (Beginner/Intermediate/Advanced/Expert)\",
    \"scenario_text\": \"The general scenario context or theme description (100-200 words).\",
    \"questions\": [
        {
            \"text\": \"Question string here?\",
            \"options\": {
                \"A\": \"Option A text\",
                \"B\": \"Option B text\",
                \"C\": \"Option C text\"
            },
            \"correct_option\": \"A, B, or C\"
        }
    ]
}";

        $response = $this->callOpenAI($prompt);
        if (!$response) return null;

        $jsonStr = $this->cleanJsonResponse($response);
        return json_decode($jsonStr, true);
    }

    /**
     * Evaluate the user's answer
     */
    public function evaluateAnswer(string $scenarioText, array $questions, array $userAnswers, int $score, int $timeTaken, UserCognitiveStat $stats)
    {
        $prompt = "You are the Game Master of the Cognitive Arena.
The user just completed a 10-question simulation. 
Scenario Theme: {$scenarioText}
Questions & Options: " . json_encode($questions) . "
User's Choosen Answers: " . json_encode($userAnswers) . "
User Score: {$score}/100
Time taken: {$timeTaken} seconds.

Evaluate their performance based on critical thinking, communication, and decision speed as indicated by their score and time taken.
Write a concluding review highlighting patterns you see in their correct/wrong answers.
The feedback MUST be in Indonesian.
Return ONLY a raw JSON strictly adhering to the following structure, with no markdown code blocks:
{
    \"feedback_text\": \"Your reasoning-based feedback (100-200 words).\",
    \"stat_changes\": {
        \"critical_thinking_level\": <integer from -2 to +10 based on score>,
        \"communication_level\": <integer from -2 to +10 based on score>,
        \"decision_speed\": <integer from -2 to +10 based on time_taken and score>
    },
    \"xp_earned\": <integer based on score, between 50 to 500>,
    \"reflection_prompt\": \"A short reflection question for their journal related to their quiz performance.\"
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
