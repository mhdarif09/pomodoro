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
}
