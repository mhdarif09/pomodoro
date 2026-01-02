<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\CashbackService;
use Illuminate\Http\Request;

class CashbackController extends Controller
{
    protected $cashbackService;

    public function __construct(CashbackService $cashbackService)
    {
        $this->cashbackService = $cashbackService;
    }

    public function redeemToPromoCode(Request $request)
    {
        $request->validate([
            'points' => 'required|integer|min:1000'
        ]);

        try {
            $user = $request->user();
            $result = $this->cashbackService->convertPointsToPromoCode($user, $request->points);
            
            return response()->json([
                'success' => true,
                'data' => $result,
                'message' => 'Poin berhasil ditukar menjadi kode promo!'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    public function getRedemptionHistory(Request $request)
    {
        $history = $this->cashbackService->getRedemptionHistory($request->user());
        return response()->json([
            'success' => true,
            'data' => $history
        ]);
    }
}
