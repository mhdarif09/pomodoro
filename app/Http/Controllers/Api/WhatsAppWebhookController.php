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
     * Handle incoming WhatsApp messages from WA Service webhook
     */
    public function handle(Request $request)
    {
        // WA Service sends: sender, pushName, message, timestamp, isGroup
        $sender = $request->input('sender'); // Phone number (e.g., 6281234567890)
        $message = $request->input('message');
        $isGroup = $request->input('isGroup', false);
        
        // Basic validation
        if (!$sender || !$message) {
            return response()->json(['status' => false, 'reason' => 'Invalid payload'], 400);
        }

        // Skip group messages
        if ($isGroup) {
            return response()->json(['status' => true]);
        }

        // 1. Check if user exists (try multiple phone formats)
        $phone = preg_replace('/[^0-9]/', '', $sender);
        $user = User::where('phone', $phone)->first();

        // Try alternate formats: 62xxx ↔ 0xxx
        if (!$user && str_starts_with($phone, '62')) {
            $user = User::where('phone', '0' . substr($phone, 2))->first();
        }
        if (!$user && str_starts_with($phone, '0')) {
            $user = User::where('phone', '62' . substr($phone, 1))->first();
        }

        // If user not found, IGNORE
        if (!$user) {
            Log::info("WhatsApp Webhook: Ignored unregistered number", ['sender' => $sender]);
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

        // 3. Send Reply via WhatsApp API
        $this->whatsAppService->sendMessage($sender, $reply);

        return response()->json(['status' => true]);
    }
}
