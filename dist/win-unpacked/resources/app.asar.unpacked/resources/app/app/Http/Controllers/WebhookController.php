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
        if ($transactionStatus === 'settlement' || $transactionStatus === 'capture') {
            // Hitung expired_at sesuai durasi plan
            $expiredAt = match ($subscription->plan) {
                'annual', 'yearly' => now()->addYear(),
                'pro', 'monthly' => now()->addMonth(),
                default => now()->addMonth(),
            };

            $subscription->update([
                'status' => 'paid',
                'midtrans_transaction_id' => $transactionId,
                'payment_type' => $payload['payment_type'] ?? null,
                'paid_at' => now(),
                'expired_at' => $expiredAt,
            ]);

            Log::info('Subscription payment successful for order: ' . $orderId);
        } elseif (in_array($transactionStatus, ['expire', 'cancel', 'deny'])) {
            $subscription->update([
                'status' => 'failed',
                'midtrans_transaction_id' => $transactionId,
                'payment_type' => $payload['payment_type'] ?? null,
            ]);
            Log::info('Subscription payment failed for order: ' . $orderId);
        }

        return response()->json(['message' => 'Webhook received']);
    }
}
