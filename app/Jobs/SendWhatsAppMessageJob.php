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

    /**
     * Create a new job instance.
     */
    public function __construct(string $phone, string $message)
    {
        $this->phone = $phone;
        $this->message = $message;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $apiUrl = env('WHATSAPP_API_URL', 'https://wa.muhammadarifrs.my.id/enqueue');

        try {
            $response = Http::asForm()
                ->timeout(10)
                ->connectTimeout(5)
                ->post($apiUrl, [
                    'phone' => $this->phone,
                    'message' => $this->message,
                ]);

            if ($response->successful()) {
                Log::info('WhatsApp message sent via Job', [
                    'phone' => $this->phone,
                    'response' => $response->json(),
                ]);
            } else {
                Log::error('Failed to send WhatsApp message via Job', [
                    'phone' => $this->phone,
                    'status' => $response->status(),
                    'response' => $response->body(),
                ]);
                
                // If the API returns a 5xx error, release back to the queue to try again
                if ($response->serverError()) {
                    $this->release(10); // Wait 10 seconds before retrying
                }
            }
        } catch (\Exception $e) {
            Log::error('Exception sending WhatsApp message via Job', [
                'phone' => $this->phone,
                'error' => $e->getMessage(),
            ]);
            
            // Release the job back to the queue to retry
            $this->release(10);
        }
    }
}
