<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\CashbackService; // Reuse for getting balance
use Illuminate\Http\Request;

class PointsController extends Controller
{
    protected $cashbackService;

    public function __construct(CashbackService $cashbackService)
    {
        $this->cashbackService = $cashbackService;
    }

    public function getBalance(Request $request)
    {
        $points = $this->cashbackService->getAvailablePoints($request->user());
        return response()->json([
            'success' => true,
            'points' => $points
        ]);
    }
}
