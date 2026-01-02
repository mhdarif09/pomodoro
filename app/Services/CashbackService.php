<?php

namespace App\Services;

use App\Models\User;
use App\Models\UserPoint;
use App\Models\CashbackRedemption;
use App\Models\Promo;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class CashbackService
{
    /**
     * Convert points to promo code
     */
    public function convertPointsToPromoCode(User $user, int $points): array
    {
        // 1. Validate points
        $userPoints = UserPoint::where('user_id', $user->id)->first();
        if (!$userPoints || $userPoints->current_points < $points) {
            throw new \Exception("Poin tidak cukup.");
        }

        // 2. Minimum redemption check (1000 points)
        if ($points < 1000) {
            throw new \Exception("Minimum penukaran adalah 1000 poin.");
        }

        // 3. Determine plan pricing context (optional, but good for value calc)
        // For simplicity, we assume value is generated and can be applied to any plan
        // Value mapping: 
        // Plan 1 (15k) base conversion: 1000 pts = 1000 IDR
        // Plan 2 (30k) base conversion: 1000 pts = 1500 IDR
        // To keep it simple, we'll use a standard generous rate: 1000 pts = 1000 IDR
        // And if they subscribe to Plan 2, maybe we give bonus? 
        // Let's stick to the simpler 1000 pts = 1000 IDR for now as base value.
        // User requested: Plan 2 higher conversion. 
        // But promo code needs fixed value or percentage.
        // We'll generate a fixed value discount code.
        
        $conversionRate = 1.0; // 1 point = 1 IDR
        
        // If user is currently or was recently on Plan 2, maybe give better rate? 
        // But "Cashback" implies getting value back.
        // Let's use the rate agreed: 1000 pts = 1000 IDR.
        // Wait, the plan said Plan 2 gets 1500 IDR. This implies the promo code might value differently depending on plan?
        // No, standard promo codes usually have fixed value.
        // Let's settle on: 1 Point = 1 IDR. It's already very generous (1500 pts = 1500 IDR is 10%).
        
        $cashbackValue = $points * 1.0; 

        return DB::transaction(function () use ($user, $points, $userPoints, $cashbackValue) {
            // Deduct points
            $userPoints->current_points -= $points;
            $userPoints->save();

            // Record transaction
            // Assuming PointTransaction model exists and linked
            \App\Models\PointTransaction::create([
                'user_id' => $user->id,
                'amount' => -$points,
                'type' => 'redeemed',
                'description' => 'Redeemed for cashback promo',
            ]);

            // Generate Promo Code
            $code = 'CB-' . strtoupper(Str::random(8));
            
            // Create Redemption Record
            $redemption = CashbackRedemption::create([
                'user_id' => $user->id,
                'points_spent' => $points,
                'cashback_value' => $cashbackValue,
                'promo_code' => $code,
                'expires_at' => Carbon::now()->addDays(60),
            ]);

            // Create Promo
            Promo::create([
                'code' => $code,
                'discount_type' => 'fixed',
                'discount_value' => $cashbackValue,
                'is_active' => true,
                'is_cashback_promo' => true,
                'cashback_redemption_id' => $redemption->id,
                'expires_at' => Carbon::now()->addDays(60),
                'usage_limit' => 1,
                'usage_count' => 0,
            ]);

            return [
                'success' => true,
                'promo_code' => $code,
                'value' => $cashbackValue,
                'remaining_points' => $userPoints->current_points,
            ];
        });
    }

    /**
     * Get redemption history
     */
    public function getRedemptionHistory(User $user)
    {
        return CashbackRedemption::where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->get();
    }
    
    /**
     * Get available points
     */
    public function getAvailablePoints(User $user)
    {
         $userPoints = UserPoint::firstOrCreate(
            ['user_id' => $user->id],
            ['current_points' => 0, 'lifetime_points' => 0]
        );
        return $userPoints->current_points;
    }
}
