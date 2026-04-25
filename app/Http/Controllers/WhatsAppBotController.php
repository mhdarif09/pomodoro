<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\WhatsAppService;
use App\Services\WhatsAppBotService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
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
     * Handle incoming Fonnte webhook.
     *
     * Fonnte sends POST with: sender, message, name, device, timestamp, etc.
     * We must always return 200 OK.
     */
    public function handle(Request $request): JsonResponse
    {
        try {
            set_time_limit(0); 
            $sender = $request->input('sender') ?? $request->input('phone') ?? $request->input('number');
            $message = $request->input('message') ?? $request->input('text') ?? $request->input('body');
            $name = $request->input('name');

            Log::info('WhatsApp webhook received', [
                'sender' => $sender,
                'message' => $message,
                'name' => $name,
            ]);

            // Validate required fields
            if (empty($sender) || empty($message)) {
                Log::warning('WhatsApp webhook: missing sender or message');
                return response()->json(['status' => 'ok']);
            }

            // Deduplicate repeated webhook deliveries from the provider.
            $messageId = $request->input('message_id') ?? $request->input('id') ?? $request->input('messageId') ?? null;
            $cacheKey = 'whatsapp_webhook_dedup:' . $this->normalizePhone($sender);

            if ($messageId) {
                $cacheKey .= ':' . $messageId;
            } else {
                $cacheKey .= ':' . sha1($sender . '|' . $message . '|' . ($request->input('timestamp') ?? ''));
            }

            if (Cache::has($cacheKey)) {
                Log::info('WhatsApp webhook duplicate ignored', ['sender' => $sender, 'message' => substr($message, 0, 120)]);
                return response()->json(['status' => 'ok']);
            }

            Cache::put($cacheKey, true, now()->addMinutes(10));

            // Normalize phone number
            $phone = preg_replace('/[^0-9]/', '', $sender);

            // Try to find user by phone
            $user = $this->findUserByPhone($phone);

            if (!$user) {
                $displayName = $name ?? 'Kak';
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

            // Send reply via Fonnte
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

        // Always return 200 OK for Fonnte
        return response()->json(['status' => 'ok']);
    }

    /**
     * Find user by phone number, checking various format patterns.
     */
    protected function findUserByPhone(string $phone): ?User
    {
        $user = User::where('phone', $phone)->first();
        if ($user) return $user;

        if (str_starts_with($phone, '62')) {
            $withZero = '0' . substr($phone, 2);
            $user = User::where('phone', $withZero)->first();
            if ($user) return $user;
        }

        if (str_starts_with($phone, '0')) {
            $with62 = '62' . substr($phone, 1);
            $user = User::where('phone', $with62)->first();
            if ($user) return $user;
        }

        return null;
    }

    protected function normalizePhone(string $phone): string
    {
        return preg_replace('/[^0-9]/', '', $phone);
    }
}
