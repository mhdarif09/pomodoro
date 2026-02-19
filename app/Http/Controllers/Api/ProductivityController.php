<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\ProductivityStatsService;

class ProductivityController extends Controller
{
    protected $statsService;

    public function __construct(ProductivityStatsService $statsService)
    {
        $this->statsService = $statsService;
    }

    public function summary(Request $request)
    {
        $user = $request->user();
        return response()->json($this->statsService->getDailyStats($user));
    }

    public function trends(Request $request)
    {
        $user = $request->user();
        // Trends are now available for ALL users (Free & Premium)
        return response()->json([
            'trends' => $this->statsService->getWeeklyTrends($user),
            'is_locked' => false
        ]);
    }

    public function insights(Request $request)
    {
        $user = $request->user();
        if (!$user->is_premium) {
             return response()->json([
                 'message' => 'Premium required',
                 'insights' => null,
                 'is_locked' => true
             ]);
        }
        return response()->json($this->statsService->getInsights($user));
    }
}
