<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Services\WhatsAppAIService;
use App\Services\WhatsAppService;
use Illuminate\Support\Facades\Log;

class WhatsAppWebhookController extends Controller
{
    protected $aiService;
    protected $whatsAppService;

    public function __construct(WhatsAppAIService $aiService, WhatsAppService $whatsAppService)
    {
        $this->aiService = $aiService;
        $this->whatsAppService = $whatsAppService;
    }

    /**
     * Handle incoming WhatsApp messages from Fonnte
     */
    public function handle(Request $request)
    {
        // Fonnte sends: sender, message, name, etc.
        $sender = $request->input('sender') ?? $request->input('phone') ?? $request->input('number');
        $message = $request->input('message') ?? $request->input('text') ?? $request->input('body');
        
        // Basic validation
        if (!$sender || !$message) {
            return response()->json(['status' => false, 'reason' => 'Invalid payload'], 400);
        }

        // Normalize phone and find user
        $phone = preg_replace('/[^0-9]/', '', $sender);
        $user = User::where('phone', $phone)->first();

        if (!$user && str_starts_with($phone, '62')) {
            $user = User::where('phone', '0' . substr($phone, 2))->first();
        }
        if (!$user && str_starts_with($phone, '0')) {
            $user = User::where('phone', '62' . substr($phone, 1))->first();
        }

        if (!$user) {
            Log::info("WhatsApp Webhook: Ignored unregistered number", ['sender' => $sender]);
            return response()->json(['status' => true]); 
        }

        // Log User Message & Generate Response
        Log::info("WhatsApp Webhook: Processing message from registered user", ['user' => $user->name]);
        
        \App\Models\ReminderLog::create([
            'user_id' => $user->id,
            'message' => $message,
            'sender' => 'user',
            'type' => 'chat',
            'status' => 'received',
            'sent_at' => now(),
        ]);

        $reply = $this->aiService->generateResponse($user, $message);

        // Send Reply via Fonnte
        $this->whatsAppService->sendMessage($sender, $reply);

        return response()->json(['status' => true]);
    }
}
