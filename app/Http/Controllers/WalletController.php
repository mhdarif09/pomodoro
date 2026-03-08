<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Services\CashbackService;

class WalletController extends Controller
{
    protected $cashbackService;

    public function __construct(CashbackService $cashbackService)
    {
        $this->cashbackService = $cashbackService;
    }

    /**
     * Display the wallet dashboard.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        $balance = $this->cashbackService->getAvailablePoints($user);
        $history = $user->xpTransactions() // Assuming we track points here or make a new relation
                       ->latest()
                       ->limit(20)
                       ->get();

        return Inertia::render('Wallet/Index', [
            'balance' => $balance,
            'history' => $history,
            'exchangeRate' => 1000, // 1000 Points = Rp 1000 (Example)
        ]);
    }

    /**
     * Redeem points for promo code (simple implementation)
     */
    public function redeem(Request $request)
    {
        $request->validate([
            'amount' => 'required|integer|min:1000',
        ]);

        try {
            // Logic to redeem would go here
            // For now just flash success
            return back()->with('success', 'Redemption feature coming soon!');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }
}
