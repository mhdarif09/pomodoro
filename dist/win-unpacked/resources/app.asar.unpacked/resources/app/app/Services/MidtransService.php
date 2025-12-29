<?php 
namespace App\Services;

use Midtrans\Snap;
use Midtrans\Config;
use Midtrans\Notification;
use App\Models\Subscription;
use Illuminate\Support\Facades\Log;

class MidtransService
{
    public function __construct()
    {
        Config::$serverKey = config('services.midtrans.server_key');
        Config::$isProduction = config('services.midtrans.is_production');
        Config::$isSanitized = true;
        Config::$is3ds = true; // Enable 3D Secure for extra security
    }

    public function createTransaction(Subscription $subscription)
    {
        $subscription->load('user');

        // Validate price
        $price = $this->getValidatedPlanPrice($subscription->plan);
        if ($price <= 0) {
            Log::error("Invalid price for plan: " . $subscription->plan);
            throw new \Exception("Invalid price");
        }

        // Generate secure order ID with subscription ID
        $orderId = $this->generateSecureOrderId($subscription->id);
        $subscription->update(['midtrans_order_id' => $orderId]);

        // Sanitize customer data
        $customerName = $this->sanitizeInput($subscription->user->name);
        $customerEmail = filter_var($subscription->user->email, FILTER_SANITIZE_EMAIL);

        $params = [
            'transaction_details' => [
                'order_id' => $orderId,
                'gross_amount' => (int) $price, // Ensure integer
            ],
            'customer_details' => [
                'first_name' => $customerName,
                'email' => $customerEmail,
            ],
            'item_details' => [
                [
                    'id' => 'PLAN-' . strtoupper($subscription->plan),
                    'price' => (int) $price,
                    'quantity' => 1,
                    'name' => 'Premium Subscription - ' . ucfirst($subscription->plan),
                ]
            ],
            // Add extra security
            'callbacks' => [
                'finish' => route('subscription.payment.success'),
            ]
        ];

        // Create Snap Transaction
        try {
            $snap = Snap::createTransaction($params);
            $subscription->update(['snap_token' => $snap->token]);
            
            Log::info("Transaction created", [
                'order_id' => $orderId,
                'user_id' => $subscription->user_id,
                'amount' => $price
            ]);
            
            return $snap;
        } catch (\Exception $e) {
            Log::error("Midtrans transaction creation failed", [
                'error' => $e->getMessage(),
                'user_id' => $subscription->user_id
            ]);
            throw $e;
        }
    }

    /**
     * Handle and validate Midtrans notification webhook
     */
    public function handleNotification($request)
    {
        // Verify signature to prevent tampering
        $this->verifySignature($request);

        // Create notification object
        $notification = new Notification();
        
        // Validate notification data
        $this->validateNotificationData($notification);
        
        Log::info("Webhook notification validated", [
            'order_id' => $notification->order_id,
            'transaction_status' => $notification->transaction_status,
            'fraud_status' => $notification->fraud_status ?? 'N/A'
        ]);
        
        return $notification;
    }

    /**
     * Verify Midtrans signature for webhook security
     */
    private function verifySignature($request)
    {
        $orderId = $request->input('order_id');
        $statusCode = $request->input('status_code');
        $grossAmount = $request->input('gross_amount');
        $serverKey = config('services.midtrans.server_key');
        $signatureKey = $request->input('signature_key');

        // Generate expected signature
        $expectedSignature = hash('sha512', $orderId . $statusCode . $grossAmount . $serverKey);

        // Compare signatures
        if ($signatureKey !== $expectedSignature) {
            Log::error("Invalid Midtrans signature", [
                'order_id' => $orderId,
                'expected' => substr($expectedSignature, 0, 10) . '...',
                'received' => substr($signatureKey ?? '', 0, 10) . '...'
            ]);
            throw new \Exception("Invalid signature - possible fraudulent webhook");
        }

        return true;
    }

    /**
     * Validate notification data
     */
    private function validateNotificationData($notification)
    {
        if (empty($notification->order_id)) {
            throw new \Exception("Invalid notification: missing order_id");
        }

        if (empty($notification->transaction_status)) {
            throw new \Exception("Invalid notification: missing transaction_status");
        }

        // Validate order_id format
        if (!preg_match('/^ORDER-[a-f0-9]+-\d+$/i', $notification->order_id)) {
            Log::warning("Suspicious order_id format", ['order_id' => $notification->order_id]);
        }

        return true;
    }

    /**
     * Generate secure order ID
     */
    private function generateSecureOrderId($subscriptionId)
    {
        return 'ORDER-' . uniqid() . '-' . (int) $subscriptionId;
    }

    /**
     * Get and validate plan price
     */
    protected function getValidatedPlanPrice($planName)
    {
        // Sanitize plan name
        $planName = $this->sanitizeInput($planName);
        
        $plan = \App\Models\Plan::where('name', $planName)->first();
        
        if (!$plan) {
            throw new \Exception("Plan not found: " . $planName);
        }

        $price = $plan->price ?? 0;

        // Validate price is positive number
        if (!is_numeric($price) || $price <= 0) {
            throw new \Exception("Invalid price for plan");
        }

        return $price;
    }

    /**
     * Sanitize input to prevent XSS
     */
    private function sanitizeInput($input)
    {
        return htmlspecialchars(strip_tags(trim($input)), ENT_QUOTES, 'UTF-8');
    }
}
