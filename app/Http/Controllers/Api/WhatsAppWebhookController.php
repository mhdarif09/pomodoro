<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Services\WhatsAppAIService;
use App\Services\FonnteService;
use Illuminate\Support\Facades\Log;

class WhatsAppWebhookController extends Controller
{
    protected $aiService;
    protected $fonnteService;

    public function __construct(WhatsAppAIService $aiService, FonnteService $fonnteService)
    {
        $this->aiService = $aiService;
        $this->fonnteService = $fonnteService;
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

        // 2. Generate AI Response
        Log::info("WhatsApp Webhook: Processing message from registered user", ['user' => $user->name]);
        
        // Indicate typing or processing (Optional: Fonnte doesn't support typing status via API easily)
        
        $reply = $this->aiService->generateResponse($user, $message);

        // 3. Send Reply via Fonnte
        $this->fonnteService->sendMessage($sender, $reply);

        return response()->json(['status' => true]);
    }
}
