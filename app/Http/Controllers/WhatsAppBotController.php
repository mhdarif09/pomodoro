<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\FonnteService;
use App\Services\WhatsAppBotService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class WhatsAppBotController extends Controller
{
    protected WhatsAppBotService $botService;
    protected FonnteService $fonnteService;

    public function __construct(WhatsAppBotService $botService, FonnteService $fonnteService)
    {
        $this->botService = $botService;
        $this->fonnteService = $fonnteService;
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
            $sender = $request->input('sender');
            $message = $request->input('message');
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

            // Normalize phone number (remove + prefix, spaces, dashes)
            $phone = preg_replace('/[^0-9]/', '', $sender);

            // Try to find user by phone (check various formats)
            $user = $this->findUserByPhone($phone);

            if (!$user) {
                // User not found → send registration info
                $reply = "👋 Hai {$name}!\n\n"
                    . "Nomor kamu belum terdaftar di *Sarang Tumbuh*.\n\n"
                    . "Untuk menggunakan bot ini, silakan:\n"
                    . "1️⃣ Daftar di app Sarang Tumbuh\n"
                    . "2️⃣ Tambahkan nomor WhatsApp di profil kamu\n\n"
                    . "Setelah itu, kamu bisa manage task langsung dari WhatsApp! 🚀";

                $this->fonnteService->sendMessage($phone, $reply);

                return response()->json(['status' => 'ok']);
            }

            // Process the message through bot service
            $reply = $this->botService->processMessage($user, $message);

            // Send reply via Fonnte
            $this->fonnteService->sendMessage($phone, $reply);

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
