<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppService
{
    protected $apiUrl;

    public function __construct()
    {
        $this->apiUrl = env('WHATSAPP_API_URL', 'https://wa.muhammadarifrs.my.id/enqueue');
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
            // Normalize phone number: remove non-numeric chars
            $phone = preg_replace('/[^0-9]/', '', $phone);
            
            // Format phone to start with 62 instead of 0
            if (str_starts_with($phone, '0')) {
                $phone = '62' . substr($phone, 1);
            }
            
            $response = Http::asForm()->post($this->apiUrl, [
                'phone' => $phone,
                'message' => $message,
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
    public function sendReminder(\App\Models\User $user, string $message, $taskId = null): array
    {
        if (!$user->phone) {
            return ['success' => false, 'error' => 'User has no phone number'];
        }

        // 1. Check Monthly Limit per Task (Max 20)
        if ($taskId) {
            $monthStart = now()->startOfMonth();
            $count = \App\Models\ReminderLog::where('user_id', $user->id)
                ->where('task_id', $taskId)
                ->where('created_at', '>=', $monthStart)
                ->count();
            
            if ($count >= 20) {
                Log::info('WhatsApp reminder limit reached for task', ['user_id' => $user->id, 'task_id' => $taskId]);
                return ['success' => false, 'error' => 'Monthly reminder limit reached for this task (20/month)', 'limit_reached' => true];
            }
        }

        // 2. Check Daily Limit for Free Users
        $isPremium = $user->is_premium;
        if (!$isPremium) {
            $key = 'whatsapp_limit:' . $user->id . ':' . now()->format('Y-m-d');
            $dailyCount = \Illuminate\Support\Facades\Cache::get($key, 0);

            if ($dailyCount >= 10) {
                 return ['success' => false, 'error' => 'Daily reminder limit reached (10/day)', 'limit_reached' => true];
            }
            \Illuminate\Support\Facades\Cache::put($key, $dailyCount + 1, now()->addDay());
        }

        // 3. Send Message
        $result = $this->sendMessage($user->phone, $message);

        // 4. Log to DB
        if ($result['success']) {
            \App\Models\ReminderLog::create([
                'user_id' => $user->id,
                'task_id' => $taskId,
                'message' => $message,
                'sender' => 'assistant', // Reminders are sent by the assistant/system
                'type' => 'reminder',
                'status' => 'sent'
            ]);
        }

        return $result;
    }
}
