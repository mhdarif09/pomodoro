<?php

namespace App\Http\Controllers;

use App\Models\Subscription;
use App\Models\Plan;
use App\Services\MidtransService;
use Inertia\Inertia;
use Illuminate\Http\Request;

class SubscriptionController extends Controller
{
    public function index()
    {
        $plans = Plan::all();
        return Inertia::render('Subscribe/Index', ['plans' => $plans]);
    }

    public function checkout(Request $request, MidtransService $midtrans)
{
    $request->validate([
        'plan' => 'required|string',
    ]);

    $userId = auth()->id();
    $plan = Plan::where('name', $request->plan)->firstOrFail();

    // Cek apakah sudah ada transaksi unpaid yang aktif
    $existing = Subscription::where('user_id', $userId)
        ->where('plan', $plan->name)
        ->where('status', 'unpaid')
        ->latest()
        ->first();

    if ($existing && $existing->snap_token) {
        return response()->json(['snap_token' => $existing->snap_token]);
    }

    // Buat subscription baru tanpa expired_at dulu
    $subscription = Subscription::create([
        'user_id' => $userId,
        'plan' => $plan->name,
        'duration' => $plan->duration,
        'status' => 'unpaid',
    ]);

    // Kirim ke Midtrans
    $snap = $midtrans->createTransaction($subscription);

    return response()->json(['snap_token' => $snap->token]);
}
public function history()
{
    $userId = auth()->id();

    $paidAndFailed = \App\Models\Subscription::where('user_id', $userId)
        ->whereIn('status', ['paid', 'failed', 'cancel'])
        ->orderByDesc('created_at');

    $latestPending = \App\Models\Subscription::where('user_id', $userId)
        ->where('status', 'pending')
        ->orderByDesc('created_at')
        ->limit(1);

    $subscriptions = $paidAndFailed->unionAll($latestPending)->get();

    return Inertia::render('Transactions/History', [
        'subscriptions' => $subscriptions,
    ]);
}

}
