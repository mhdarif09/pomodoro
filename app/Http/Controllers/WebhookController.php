<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Subscription;
use App\Models\Plan;
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
    $subscription->update([
        'status' => 'paid',
        'midtrans_transaction_id' => $transactionId,
        'paid_at' => now(),
        'payment_type' => $payload['payment_type'] ?? null,
    ]);

    $subscription->user->update(['premium_until' => $subscription->expired_at]);

    // Auto renew logic:
    if ($subscription->auto_renew && in_array($subscription->payment_type, ['credit_card', 'debit'])) {
        $newExpiredAt = match ($subscription->duration) {
            'monthly' => now()->addMonth(),
            'yearly' => now()->addYear(),
            default => now()->addMonth(),
        };

        $newSub = Subscription::create([
            'user_id' => $subscription->user_id,
            'plan' => $subscription->plan,
            'duration' => $subscription->duration,
            'expired_at' => $newExpiredAt,
            'auto_renew' => true,
        ]);

        // Trigger Midtrans token here
        app(\App\Services\MidtransService::class)->createTransaction($newSub);
    }
}
        return response()->json(['message' => 'Webhook received']);
    }
}
