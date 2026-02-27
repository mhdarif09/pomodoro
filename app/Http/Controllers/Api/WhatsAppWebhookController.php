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
        $sender = $request->input('sender'); // Phone number (e.g., 62812...)
        $message = $request->input('message');
        
        // Basic validation
        if (!$sender || !$message) {
            return response()->json(['status' => false, 'reason' => 'Invalid payload'], 400);
        }

        // 1. Check if user exists
        // We might need to normalize phone number if stored differently
        $user = User::where('phone', $sender)->first();

        // If user not found, IGNORE (as per requirements)
        if (!$user) {
            Log::info("WhatsApp Webhook: Ignored unregistered number", ['sender' => $sender]);
            // Still return 200 to tell Fonnte we received it, otherwise it might retry
            return response()->json(['status' => true]); 
        }

        // 2. Log User Message & Generate Response
        Log::info("WhatsApp Webhook: Processing message from registered user", ['user' => $user->name]);
        
        \App\Models\ReminderLog::create([
            'user_id' => $user->id,
            'message' => $message,
            'sender' => 'user',
            'type' => 'chat',
            'status' => 'received'
        ]);

        $reply = $this->aiService->generateResponse($user, $message);

        // 3. Send Reply via Fonnte
        $this->whatsAppService->sendMessage($sender, $reply);

        return response()->json(['status' => true]);
    }
}
