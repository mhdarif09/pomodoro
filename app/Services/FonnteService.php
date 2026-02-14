<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FonnteService
{
    protected $apiUrl = 'https://api.fonnte.com/send';
    protected $token;

    public function __construct()
    {
        $this->token = config('services.fonnte.token');
    }

    /**
     * Send WhatsApp message via Fonnte API
     *
     * @param string $phone Phone number in international format (e.g., 628123456789)
     * @param string $message Message content
     * @return array Response from Fonnte API
     */
    public function sendMessage(string $phone, string $message): array
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => $this->token,
            ])->post($this->apiUrl, [
                'target' => $phone,
                'message' => $message,
                'countryCode' => '62', // Indonesia country code
            ]);

            $result = $response->json();

            if ($response->successful()) {
                Log::info('WhatsApp message sent successfully', [
                    'phone' => $phone,
                    'response' => $result,
                ]);
            } else {
                Log::error('Failed to send WhatsApp message', [
                    'phone' => $phone,
                    'response' => $result,
                    'status' => $response->status(),
                ]);
            }

            return [
                'success' => $response->successful(),
                'data' => $result,
            ];
        } catch (\Exception $e) {
            Log::error('Exception while sending WhatsApp message', [
                'phone' => $phone,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Send bulk WhatsApp messages
     *
     * @param array $recipients Array of ['phone' => '628xxx', 'message' => 'text']
     * @return array Results for each recipient
     */
    public function sendBulkMessages(array $recipients): array
    {
        $results = [];

        foreach ($recipients as $recipient) {
            $results[] = $this->sendMessage(
                $recipient['phone'],
                $recipient['message']
            );
        }

        return $results;
    }

    /**
     * Send a reminder message with rate limiting for free users.
     * Limit: 10 reminders per day for free users. Unlimited for premium.
     *
     * @param \App\Models\User $user
     * @param string $message
     * @return array
     */
    public function sendReminder(\App\Models\User $user, string $message): array
    {
        if (!$user->phone) {
            return ['success' => false, 'error' => 'User has no phone number'];
        }

        // Check premium status
        $isPremium = $user->is_premium;

        if (!$isPremium) {
            $key = 'whatsapp_limit:' . $user->id . ':' . now()->format('Y-m-d');
            $count = \Illuminate\Support\Facades\Cache::get($key, 0);

            if ($count >= 10) {
                Log::info('WhatsApp reminder limit reached for free user', ['user_id' => $user->id]);
                return ['success' => false, 'error' => 'Daily reminder limit reached (10/day)', 'limit_reached' => true];
            }

            // Increment count (expires in 24 hours)
            \Illuminate\Support\Facades\Cache::put($key, $count + 1, now()->addDay());
        }

        return $this->sendMessage($user->phone, $message);
    }
}
