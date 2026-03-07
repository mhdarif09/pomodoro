<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\WhatsAppService;
use App\Services\WhatsAppBotService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class WhatsAppBotController extends Controller
{
    protected WhatsAppBotService $botService;
    protected WhatsAppService $whatsAppService;

    public function __construct(WhatsAppBotService $botService, WhatsAppService $whatsAppService)
    {
        $this->botService = $botService;
        $this->whatsAppService = $whatsAppService;
    }

    /**
     * Handle incoming WhatsApp webhook.
     *
     * WA Service sends POST with: sender, pushName, message, timestamp, isGroup.
     * We must always return 200 OK.
     */
    public function handle(Request $request): JsonResponse
    {
        try {
            set_time_limit(0); 
            $sender = $request->input('sender');
            $message = $request->input('message');
            $pushName = $request->input('pushName');
            $isGroup = $request->input('isGroup', false);

            Log::info('WhatsApp webhook received', [
                'sender' => $sender,
                'message' => $message,
                'pushName' => $pushName,
                'isGroup' => $isGroup,
            ]);

            // Skip group messages
            if ($isGroup) {
                return response()->json(['status' => 'ok']);
            }

            // Validate required fields
            if (empty($sender) || empty($message)) {
                Log::warning('WhatsApp webhook: missing sender or message');
                return response()->json(['status' => 'ok']);
            }

            // Normalize phone number (remove + prefix, spaces, dashes)
            $phone = preg_replace('/[^0-9]/', '', $sender);

            // Try to find user by phone (check various formats)
            $user = $this->findUserByPhone($phone);

            if (!$user) {
                // User not found → send registration info
                $displayName = $pushName ?? 'Kak';
                $reply = "👋 Hai {$displayName}!\n\n"
                    . "Nomor kamu belum terdaftar di *Sarang Tumbuh*.\n\n"
                    . "Untuk menggunakan bot ini, silakan:\n"
                    . "1️⃣ Daftar di app Sarang Tumbuh\n"
                    . "2️⃣ Tambahkan nomor WhatsApp di profil kamu\n\n"
                    . "Setelah itu, kamu bisa manage task langsung dari WhatsApp! 🚀";

                $this->whatsAppService->sendMessage($phone, $reply);

                return response()->json(['status' => 'ok']);
            }

            // Log incoming user message
            \App\Models\ReminderLog::create([
                'user_id' => $user->id,
                'message' => $message,
                'sender' => 'user',
                'type' => 'chat',
                'status' => 'received',
                'sent_at' => now(),
            ]);

            // Process the message through bot service
            $reply = $this->botService->processMessage($user, $message);

            // Send reply via WhatsApp API
            $this->whatsAppService->sendMessage($phone, $reply);

            Log::info('WhatsApp bot reply sent', [
                'user_id' => $user->id,
                'phone' => $phone,
            ]);

        } catch (\Exception $e) {
            Log::error('WhatsApp webhook error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
        }

        // Always return 200 OK for webhook
        return response()->json(['status' => 'ok']);
    }

    /**
     * Find user by phone number, checking various format patterns.
     */
    protected function findUserByPhone(string $phone): ?User
    {
        // Direct match
        $user = User::where('phone', $phone)->first();
        if ($user) return $user;

        // If starts with 62, also try with 0
        if (str_starts_with($phone, '62')) {
            $withZero = '0' . substr($phone, 2);
            $user = User::where('phone', $withZero)->first();
            if ($user) return $user;
        }

        // If starts with 0, also try with 62
        if (str_starts_with($phone, '0')) {
            $with62 = '62' . substr($phone, 1);
            $user = User::where('phone', $with62)->first();
            if ($user) return $user;
        }

        return null;
    }
}
