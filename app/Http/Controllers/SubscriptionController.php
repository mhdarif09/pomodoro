<?php

namespace App\Http\Controllers;

use App\Models\Subscription;
use App\Models\Plan;
use App\Models\User;
use App\Models\Promo;
use App\Services\MidtransService;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Carbon\Carbon;

class SubscriptionController extends Controller
{
    public function index(Request $request)
    {
        $plans = Plan::when(Schema::hasColumn('plans', 'is_active'), function ($query) {
            return $query->where('is_active', true);
        }, function ($query) {
            return $query;
        })->get();
        
        return Inertia::render('Subscribe/Index', [
            'plans' => $plans,
            'message' => 'Pilih paket yang sesuai untuk kebutuhan Anda'
        ]);
    }

   public function checkout(Request $request, MidtransService $midtrans)
{
    // Validate and sanitize input
    $validated = $request->validate([
        'plan' => 'required|string|max:50|alpha_dash', // Only alphanumeric and dashes
    ]);

    $userId = auth()->id();
    $user = auth()->user();
    
    // Rate limiting: Prevent spam checkout requests
    $recentCheckouts = Subscription::where('user_id', $userId)
        ->where('created_at', '>=', now()->subMinutes(5))
        ->count();
        
    if ($recentCheckouts >= 3) {
        Log::warning("Too many checkout attempts", ['user_id' => $userId]);
        return response()->json([
            'success' => false,
            'message' => 'Terlalu banyak permintaan. Silakan tunggu beberapa menit.'
        ], 429);
    }
    
    // Sanitize plan name
    $planName = strip_tags(trim($validated['plan']));
    
    // Cari plan dengan validation
    $plan = Plan::where('name', $planName)->first();

    if (!$plan) {
        Log::warning("Invalid plan attempted", ['user_id' => $userId, 'plan' => $planName]);
        return response()->json([
            'success' => false,
            'message' => 'Paket tidak ditemukan'
        ], 404);
    }
    
    // Check if active column exists and validate
    if (Schema::hasColumn('plans', 'is_active') && !$plan->is_active) {
        return response()->json([
            'success' => false,
            'message' => 'Paket tidak tersedia saat ini'
        ], 403);
    }

    // Cek apakah user sudah punya subscription aktif
    $activeSubscription = Subscription::where('user_id', $userId)
        ->where('status', 'paid')
        ->where('expired_at', '>', now())
        ->first();
        
    if ($activeSubscription) {
        return response()->json([
            'success' => false,
            'message' => 'Anda sudah memiliki subscription aktif'
        ], 400);
    }

    // Cek apakah ada transaksi UNPAID sebelumnya dalam 24 jam
    $existing = Subscription::where('user_id', $userId)
        ->where('plan', $plan->name)
        ->where('status', 'unpaid')
        ->where('created_at', '>=', now()->subHours(24))
        ->latest()
        ->first();

    $snapToken = null;
    $subscription = null;

    if ($existing && $existing->snap_token) {
        $snapToken = $existing->snap_token;
        $subscription = $existing;
        Log::info("Using existing snap token", ['user_id' => $userId, 'subscription_id' => $existing->id]);
    } else {
        // Buat subscription baru dengan validated data
        $subscriptionData = [
            'user_id' => $userId,
            'plan' => $plan->name,
            'status' => 'unpaid',
            'expired_at' => null,
            'price' => $plan->price ?? 0,
            'duration' => $plan->duration ?? 'monthly',
        ];

        $subscription = Subscription::create($subscriptionData);
        Log::info("Created new subscription", ['user_id' => $userId, 'subscription_id' => $subscription->id]);

        // Buat transaksi Midtrans dengan error handling
        try {
            $snap = $midtrans->createTransaction($subscription);
            $snapToken = $snap->token;
            
            $subscription->update(['snap_token' => $snapToken]);
            Log::info("Created snap token", ['user_id' => $userId, 'subscription_id' => $subscription->id]);
            
        } catch (\Exception $e) {
            Log::error('Midtrans error', [
                'user_id' => $userId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            // Delete failed subscription
            $subscription->delete();
            
            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat transaksi pembayaran. Silakan coba lagi.'
            ], 500);
        }
    }

    return response()->json([
        'success' => true,
        'snap_token' => $snapToken,
        'subscription_id' => $subscription->id,
        'plan_name' => $plan->name,
        'message' => 'Transaksi berhasil dibuat'
    ]);
}
    public function directCheckout(Request $request, MidtransService $midtrans)
    {
        $request->validate([
            'plan_id' => 'required|exists:plans,id',
        ]);

        $userId = auth()->id();
        $user = auth()->user();
        
        // Cari plan
        $plan = Plan::where('id', $request->plan_id)->first();

        if (!$plan) {
            return redirect()->back()->withErrors(['msg' => 'Paket tidak ditemukan']);
        }

        // Cek apakah ada transaksi UNPAID sebelumnya untuk plan ini dalam 24 jam terakhir
        $existing = Subscription::where('user_id', $userId)
            ->where('plan', $plan->name)
            ->where('status', 'unpaid')
            ->where('created_at', '>=', now()->subHours(24))
            ->latest()
            ->first();

        $snapToken = null;
        $subscription = null;

        if ($existing && $existing->snap_token) {
            $snapToken = $existing->snap_token;
            $subscription = $existing;
        } else {
            // Buat subscription baru
            $subscriptionData = [
                'user_id' => $userId,
                'plan' => $plan->name,
                'status' => 'unpaid',
                'expired_at' => null,
            ];

            if (isset($plan->price)) {
                $subscriptionData['price'] = $plan->price;
            }
            
            if (isset($plan->duration)) {
                $subscriptionData['duration'] = $plan->duration;
            }

            $subscription = Subscription::create($subscriptionData);

            // Buat transaksi Midtrans
            try {
                $snap = $midtrans->createTransaction($subscription);
                $snapToken = $snap->token;
                
                $subscription->update(['snap_token' => $snapToken]);
                
                Log::info("Created new snap token via direct checkout for user {$userId}, subscription {$subscription->id}");
            } catch (\Exception $e) {
                Log::error('Midtrans direct checkout error: ' . $e->getMessage());
                return redirect()->back()->withErrors(['msg' => 'Gagal membuat transaksi pembayaran: ' . $e->getMessage()]);
            }
        }

        return Inertia::render('Subscribe/Index', [
            'plans' => Plan::all(),
            'snap_token' => $snapToken,
            'message' => 'Silakan lanjutkan pembayaran',
            'subscription' => $subscription,
            'auth' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'onboarding_complete' => $user->onboarding_complete,
                    'is_premium' => $user->is_premium,
                ],
            ],
        ]);
    }

    public function paymentSuccessRedirect(Request $request)
    {
        $request->session()->flash('success', 'Pembayaran berhasil! Selamat menikmati fitur premium.');
        
        // Update user premium status
        $user = auth()->user();
        if ($user) {
            // Cari subscription terbaru yang paid
            $latestSubscription = Subscription::where('user_id', $user->id)
                ->where('status', 'paid')
                ->latest()
                ->first();
                
            if ($latestSubscription && $latestSubscription->expired_at > now()) {
                $user->update(['is_premium' => true]);
            }
        }
        
        return Redirect::route('dashboard');
    }

    public function paymentCancel(Request $request)
    {
        $request->session()->flash('info', 'Pembayaran dibatalkan. Anda dapat mencoba lagi kapan saja.');
        return Redirect::route('subscribe.index');
    }

    public function history()
    {
        $userId = auth()->id();

        $subscriptions = Subscription::where('user_id', $userId)
            ->orderByDesc('created_at')
            ->get();

        return Inertia::render('Transactions/History', [
            'subscriptions' => $subscriptions,
        ]);
    }

    public function dismissModal(Request $request)
    {
         $request->session()->put('upgrade_modal_dismissed', now());
    
    // Return Inertia response instead of JSON untuk Inertia requests
    if ($request->header('X-Inertia')) {
        return redirect()->back();
    }
    
    // Return JSON hanya untuk non-Inertia requests
    return response()->json([
        'success' => true,
        'message' => 'Modal dismissed'
    ]);
    }

    public function webhookHandler(Request $request, MidtransService $midtrans)
    {
        try {
            $notification = $midtrans->handleNotification($request);
            
            $orderId = $notification->order_id;
            $transactionStatus = $notification->transaction_status;
            $fraudStatus = $notification->fraud_status;
            
            Log::info("Midtrans webhook received: order_id={$orderId}, status={$transactionStatus}, fraud={$fraudStatus}");
            
            // Cari subscription berdasarkan order_id
            $subscription = Subscription::where('id', $orderId)->first();
            
            if (!$subscription) {
                Log::error("Subscription not found for order_id: {$orderId}");
                return response()->json(['error' => 'Subscription not found'], 404);
            }
            
            // Handle status transaksi
            if ($transactionStatus == 'capture') {
                if ($fraudStatus == 'accept') {
                    $this->handleSuccessfulPayment($subscription);
                    Log::info("Payment captured and accepted for subscription: {$subscription->id}");
                }
            } else if ($transactionStatus == 'settlement') {
                $this->handleSuccessfulPayment($subscription);
                Log::info("Payment settled for subscription: {$subscription->id}");
            } else if ($transactionStatus == 'pending') {
                $subscription->update(['status' => 'pending']);
                Log::info("Payment pending for subscription: {$subscription->id}");
            } else if ($transactionStatus == 'deny' || $transactionStatus == 'cancel' || $transactionStatus == 'expire') {
                $subscription->update(['status' => 'failed']);
                Log::info("Payment failed for subscription: {$subscription->id}, status: {$transactionStatus}");
            } else if ($transactionStatus == 'refund' || $transactionStatus == 'partial_refund') {
                $subscription->update(['status' => 'refunded']);
                Log::info("Payment refunded for subscription: {$subscription->id}");
            }
            
            return response()->json(['message' => 'Webhook processed successfully']);
            
        } catch (\Exception $e) {
            Log::error('Webhook processing error: ' . $e->getMessage());
            return response()->json(['error' => 'Webhook processing failed'], 500);
        }
    }

    /**
     * Handle successful payment
     */
    private function handleSuccessfulPayment(Subscription $subscription)
    {
        $expiredAt = $this->calculateExpiryDate($subscription->duration);
        
        $subscription->update([
            'status' => 'paid',
            'expired_at' => $expiredAt
        ]);

        // Update user premium status
        $user = User::find($subscription->user_id);
        if ($user) {
            $user->update(['is_premium' => true]);
        }
    }

    /**
     * Calculate expiry date based on duration
     */
    private function calculateExpiryDate($duration)
    {
        if (!$duration) {
            return now()->addMonth();
        }
        
        return match ($duration) {
            'monthly' => now()->addMonth(),
            'yearly' => now()->addYear(),
            default => now()->addMonth(),
        };
    }

    /**
     * Return to dashboard with error
     */
    private function returnToDashboardWithError($errorMessage)
    {
        $user = auth()->user();
        
        return Inertia::render('Dashboard', [
            'error' => $errorMessage,
            'plans' => Plan::all(),
            'auth' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'onboarding_complete' => $user->onboarding_complete,
                    'is_premium' => $user->is_premium,
                ],
            ],
            'showOnboarding' => !$user->onboarding_complete,
            'todaysGoal' => $user->todaysGoal,
            'hasTodaysGoal' => (bool) $user->todaysGoal,
            'hasReflectedToday' => $user->reflections()->whereDate('reflection_date', today())->whereNotNull('user_answer')->exists(),
            'weeklyStats' => $this->getWeeklyStats($user),
            'flash' => [
                'error' => $errorMessage,
            ],
        ]);
    }

    /**
     * Return to dashboard with snap token
     */
    private function returnToDashboardWithSnapToken($snapToken, $user, $subscription)
    {
        return Inertia::render('Dashboard', [
            'snap_token' => $snapToken,
            'plans' => Plan::all(),
            'subscription' => $subscription,
            'auth' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'onboarding_complete' => $user->onboarding_complete,
                    'is_premium' => $user->is_premium,
                ],
            ],
            'showOnboarding' => !$user->onboarding_complete,
            'todaysGoal' => $user->todaysGoal,
            'hasTodaysGoal' => (bool) $user->todaysGoal,
            'hasReflectedToday' => $user->reflections()->whereDate('reflection_date', today())->whereNotNull('user_answer')->exists(),
            'weeklyStats' => $this->getWeeklyStats($user),
            'flash' => [
                'success' => 'Transaksi berhasil dibuat. Silakan lanjutkan pembayaran.',
                'show_upgrade_modal' => true,
            ],
        ]);
    }

    /**
     * Get weekly stats for dashboard
     */
    private function getWeeklyStats($user)
    {
        $startOfWeek = now()->startOfWeek();
        
        $pomodoroCount = 0;
        if (method_exists($user, 'pomodoroSessions')) {
            $pomodoroCount = $user->pomodoroSessions()->where('created_at', '>=', $startOfWeek)->count();
        }
        
        $reflectionCount = $user->reflections()
            ->where('reflection_date', '>=', $startOfWeek)
            ->distinct('reflection_date')
            ->count('reflection_date');
            
        $goalsAchievedCount = 0;
        if (method_exists($user, 'dailyGoals')) {
            $goalsAchievedCount = $user->dailyGoals()
                ->where('is_completed', true)
                ->where('goal_date', '>=', $startOfWeek)
                ->count();
        }
        
        return [
            'pomodoros' => $pomodoroCount,
            'reflections' => $reflectionCount,
            'goalsAchieved' => $goalsAchievedCount,
        ];
    }

    /**
     * Apply promo code and return discount info
     */
    public function applyPromo(Request $request)
    {
        $request->validate([
            'code' => 'required|string',
            'plan_id' => 'required|exists:plans,id',
        ]);

        $promo = Promo::where('code', $request->code)->first();
        $plan = Plan::find($request->plan_id);

        if (!$promo || !$promo->isValid()) {
            return response()->json([
                'success' => false,
                'message' => 'Kode promo tidak valid atau sudah kadaluarsa.'
            ], 422);
        }

        $discount = $promo->calculateDiscount($plan->price);
        $finalPrice = $plan->price - $discount;

        return response()->json([
            'success' => true,
            'discount_amount' => (int) $discount,
            'final_price' => (int) $finalPrice,
            'promo_code' => $promo->code,
            'message' => 'Kode promo berhasil digunakan!'
        ]);
    }

    /**
     * Handle upgrade for existing premium users
     */
    public function upgradePlan(Request $request, MidtransService $midtrans)
    {
        $request->validate([
            'plan_id' => 'required|exists:plans,id',
            'promo_code' => 'nullable|string',
        ]);

        $user = auth()->user();
        $plan = Plan::find($request->plan_id);

        // Calculate price and discount
        $price = $plan->price;
        $discountAmount = 0;
        $promoCode = null;

        if ($request->promo_code) {
            $promo = Promo::where('code', $request->promo_code)->first();
            if ($promo && $promo->isValid()) {
                $discountAmount = $promo->calculateDiscount($price);
                $promoCode = $promo->code;
            }
        }

        $finalPrice = $price - $discountAmount;

        // Create new subscription for upgrade
        $subscription = Subscription::create([
            'user_id' => $user->id,
            'plan' => $plan->name,
            'status' => 'unpaid',
            'price' => $price,
            'duration' => $plan->duration ?? 'monthly',
            'promo_code' => $promoCode,
            'discount_amount' => $discountAmount,
            'final_price' => $finalPrice,
        ]);

        try {
            $snap = $midtrans->createTransaction($subscription);
            
            return response()->json([
                'success' => true,
                'snap_token' => $snap->token,
                'subscription_id' => $subscription->id,
            ]);
        } catch (\Exception $e) {
            $subscription->delete();
            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat transaksi: ' . $e->getMessage()
            ], 500);
        }
    }
}