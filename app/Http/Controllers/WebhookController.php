<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Subscription;
use Illuminate\Support\Facades\Log;

class WebhookController extends Controller
{
    public function handle(Request $request)
    {
        $payload = $request->all();

        $orderId = $payload['order_id'] ?? null;
        $transactionStatus = $payload['transaction_status'] ?? '';
        $transactionId = $payload['transaction_id'] ?? '';

        $subscription = Subscription::where('midtrans_order_id', $orderId)->first();

        if (!$subscription) {
            Log::warning('Subscription not found for order ID: ' . $orderId);
            return response()->json(['message' => 'Not found'], 404);
        }

        // Jika pembayaran sukses
        if ($transactionStatus === 'settlement') {
            // Hitung expired_at sesuai durasi plan
            $expiredAt = match ($subscription->duration) {
                'monthly' => now()->addMonth(),
                'yearly' => now()->addYear(),
                default => now()->addMonth(),
            };

            $subscription->update([
                'status' => 'paid',
                'midtrans_transaction_id' => $transactionId,
                'payment_type' => $payload['payment_type'] ?? null,
                'paid_at' => now(),
                'expired_at' => $expiredAt,
            ]);

            // Update user premium_until jika kamu gunakan kolom itu
            if ($subscription->user && $subscription->user->premium_until !== null) {
                $subscription->user->update(['premium_until' => $expiredAt]);
            }

            // Optional: Auto-renew
            if ($subscription->auto_renew && in_array($subscription->payment_type, ['credit_card', 'debit'])) {
                $newExpiredAt = match ($subscription->duration) {
                    'monthly' => now()->addMonth(),
                    'yearly' => now()->addYear(),
                    default => now()->addMonth(),
                };

                $newSub = Subscription::create([
                    'user_id'    => $subscription->user_id,
                    'plan'       => $subscription->plan,
                    'duration'   => $subscription->duration,
                    'status'     => 'unpaid',
                    'expired_at' => $newExpiredAt,
                    'auto_renew' => true,
                ]);

                app(\App\Services\MidtransService::class)->createTransaction($newSub);
            }
        }

        return response()->json(['message' => 'Webhook received']);
    }
}
