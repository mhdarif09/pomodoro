<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\XpTopup;
use App\Models\Subscription;
use App\Models\XpTransaction;
use App\Services\MidtransService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PaymentCallbackController extends Controller
{
    public function handle(Request $request, MidtransService $midtransService)
    {
        try {
            $notification = $midtransService->handleNotification($request);
            $orderId = $notification->order_id;
            $status = $notification->transaction_status;

            if (str_starts_with($orderId, 'TOPUP-')) {
                return $this->handleTopup($orderId, $status);
            } elseif (str_starts_with($orderId, 'ORDER-')) {
                return $this->handleSubscription($orderId, $status);
            }

            return response()->json(['message' => 'Unknown order type'], 400);

        } catch (\Exception $e) {
            Log::error('Midtrans Webhook Error: ' . $e->getMessage());
            return response()->json(['message' => 'Error processing webhook'], 500);
        }
    }

    private function handleTopup($orderId, $status)
    {
        $topup = XpTopup::where('midtrans_order_id', $orderId)->first();
        if (!$topup) return response()->json(['message' => 'Topup not found'], 404);

        if ($status == 'capture' || $status == 'settlement') {
            if ($topup->status !== 'success') {
                DB::transaction(function() use ($topup) {
                    $topup->update(['status' => 'success']);
                    $topup->guild->increment('xp_balance', $topup->amount_xp);
                    
                    // Log transaction
                    XpTransaction::create([
                        'user_id' => $topup->user_id,
                        'amount' => $topup->amount_xp,
                        'reason' => "Top Up XP Guild {$topup->guild->name}",
                        'source_type' => get_class($topup),
                        'source_id' => $topup->id,
                    ]);
                });
            }
        } elseif ($status == 'deny' || $status == 'expire' || $status == 'cancel') {
            $topup->update(['status' => 'failed']);
        }

        return response()->json(['message' => 'OK']);
    }

    private function handleSubscription($orderId, $status)
    {
        $subscription = Subscription::where('midtrans_order_id', $orderId)->first();
        if (!$subscription) return response()->json(['message' => 'Subscription not found'], 404);

        if ($status == 'capture' || $status == 'settlement') {
             $subscription->update(['status' => 'active', 'payment_status' => 'paid']);
             $subscription->user->update(['is_premium' => true]);
        } elseif ($status == 'deny' || $status == 'expire' || $status == 'cancel') {
             $subscription->update(['status' => 'expired', 'payment_status' => 'failed']);
        }

        return response()->json(['message' => 'OK']);
    }
}
