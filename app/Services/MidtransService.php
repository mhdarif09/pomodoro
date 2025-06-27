<?php 
namespace App\Services;

use Midtrans\Snap;
use Midtrans\Config;
use App\Models\Subscription;

class MidtransService
{
    public function __construct()
    {
        Config::$serverKey = config('services.midtrans.server_key');
        Config::$isProduction = config('services.midtrans.is_production');
        Config::$isSanitized = true;
        Config::$is3ds = true;
    }

  public function createTransaction(Subscription $subscription)
{
    $subscription->load('user');

    $price = $this->getPlanPrice($subscription->plan);
    if ($price <= 0) {
        \Log::error("Harga tidak valid untuk plan: " . $subscription->plan);
        throw new \Exception("Harga tidak valid");
    }

    $orderId = 'ORDER-' . uniqid() . '-' . $subscription->id;
    $subscription->update(['midtrans_order_id' => $orderId]);

    $params = [
        'transaction_details' => [
            'order_id' => $orderId,
            'gross_amount' => $price,
        ],
        'customer_details' => [
            'first_name' => $subscription->user->name,
            'email' => $subscription->user->email,
        ],
    ];

    // ✅ Buat Snap Transaction dan simpan token
    $snap = Snap::createTransaction($params);
    $subscription->update(['snap_token' => $snap->token]);

    return $snap;
}

    protected function getPlanPrice($planName)
    {
        return \App\Models\Plan::where('name', $planName)->first()?->price ?? 0;
    }
}
