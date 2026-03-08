<?php

namespace App\Http\Controllers;

use App\Models\Plan;
use App\Models\User;
use App\Models\XpTransaction;
use App\Models\Promo;
use App\Models\CashbackRedemption;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class UpgradePageController extends Controller
{
    /**
     * Show the Upgrade Plan page with XP info
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $plans = Plan::when(\Illuminate\Support\Facades\Schema::hasColumn('plans', 'is_active'), function ($query) {
            return $query->where('is_active', true);
        })->get();

        // XP info
        $xpInfo = [
            'total_xp' => (int) ($user->total_xp ?? 0),
            'current_xp' => (int) ($user->xp ?? 0),
            'level' => (int) ($user->level ?? 1),
            'level_title' => $user->level_title ?? 'Pemula',
            'xp_for_next_level' => $user->getXpForNextLevel(),
        ];

        // Available promo codes from XP redemption (unused)
        $availablePromoCodes = CashbackRedemption::where('user_id', $user->id)
            ->where('is_used', false)
            ->where('expires_at', '>', now())
            ->orderBy('created_at', 'desc')
            ->get();

        // Active subscription
        $activeSubscription = \App\Models\Subscription::where('user_id', $user->id)
            ->where('status', 'paid')
            ->where('expired_at', '>', now())
            ->latest()
            ->first();

        return Inertia::render('Upgrade/Index', [
            'plans' => $plans,
            'xpInfo' => $xpInfo,
            'availablePromoCodes' => $availablePromoCodes,
            'activeSubscription' => $activeSubscription,
            'is_premium' => $user->is_premium,
            'midtrans_client_key' => config('services.midtrans.client_key'),
            'midtrans_is_production' => config('services.midtrans.is_production'),
        ]);
    }

    /**
     * Redeem XP for a promo code discount.
     * Rate: 100 XP = Rp 1,000
     */
    public function redeemXP(Request $request)
    {
        $request->validate([
            'xp_amount' => 'required|integer|min:100',
        ]);

        $user = $request->user();
        $xpAmount = $request->input('xp_amount');

        // Validate user has enough XP
        if (($user->total_xp ?? 0) < $xpAmount) {
            return response()->json([
                'success' => false,
                'message' => 'XP tidak cukup. Kamu punya ' . ($user->total_xp ?? 0) . ' XP.',
            ], 400);
        }

        // Minimum 100 XP
        if ($xpAmount < 100) {
            return response()->json([
                'success' => false,
                'message' => 'Minimum penukaran adalah 100 XP.',
            ], 400);
        }

        // Maximum cap
        $maxXP = min($xpAmount, $user->total_xp);

        // Conversion: 100 XP = Rp 1,000
        $discountValue = ($maxXP / 100) * 1000;

        return DB::transaction(function () use ($user, $maxXP, $discountValue) {
            // Deduct XP
            $user->total_xp -= $maxXP;
            $user->save();

            // Record XP transaction
            XpTransaction::create([
                'user_id' => $user->id,
                'amount' => -$maxXP,
                'reason' => 'xp_redeemed_for_discount',
            ]);

            // Generate promo code
            $code = 'XP-' . strtoupper(Str::random(8));

            // Create redemption record
            $redemption = CashbackRedemption::create([
                'user_id' => $user->id,
                'points_spent' => $maxXP,
                'cashback_value' => $discountValue,
                'promo_code' => $code,
                'expires_at' => Carbon::now()->addDays(30),
            ]);

            // Create actual promo
            Promo::create([
                'code' => $code,
                'discount_type' => 'fixed',
                'discount_value' => $discountValue,
                'is_active' => true,
                'is_cashback_promo' => true,
                'cashback_redemption_id' => $redemption->id,
                'expires_at' => Carbon::now()->addDays(30),
                'usage_limit' => 1,
                'usage_count' => 0,
            ]);

            return response()->json([
                'success' => true,
                'promo_code' => $code,
                'discount_value' => $discountValue,
                'xp_spent' => $maxXP,
                'remaining_xp' => $user->total_xp,
            ]);
        });
    }
}
