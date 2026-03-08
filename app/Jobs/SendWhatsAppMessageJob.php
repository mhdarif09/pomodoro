<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SendWhatsAppMessageJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;
    public $timeout = 30;

    protected string $phone;
    protected string $message;

    public function __construct(string $phone, string $message)
    {
        $this->phone = $phone;
        $this->message = $message;
    }

    public function handle(): void
    {
        $token = config('services.fonnte.token');

        try {
            $response = Http::withHeaders([
                    'Authorization' => $token,
                ])
                ->timeout(10)
                ->connectTimeout(5)
                ->post('https://api.fonnte.com/send', [
                    'target' => $this->phone,
                    'message' => $this->message,
                ]);

            if ($response->successful()) {
                Log::info('WhatsApp message sent via Fonnte', [
                    'phone' => $this->phone,
                    'response' => $response->json(),
                ]);
            } else {
                Log::error('Failed to send WhatsApp message via Fonnte', [
                    'phone' => $this->phone,
                    'status' => $response->status(),
                    'response' => $response->body(),
                ]);

                if ($response->serverError()) {
                    $this->release(10);
                }
            }
        } catch (\Exception $e) {
            Log::error('Exception sending WhatsApp message via Fonnte', [
                'phone' => $this->phone,
                'error' => $e->getMessage(),
            ]);

            $this->release(10);
        }
    }
}
