<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Carbon\Carbon;

class UserController extends Controller
{
   public function index(Request $request)
{
    $users = User::query()
        ->where('id', '!=', Auth::id())
        ->when($request->input('search'), function ($query, $search) {
            $query->where(fn($q) => $q->where('name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%"));
        })
        ->with('subscription') // Ambil semua kolom subscription
        ->latest()
        ->paginate(15)
        ->withQueryString();

    $plans = Plan::select('id', 'name', 'price', 'duration')->get();

    return Inertia::render('Admin/Users/Index', [
        'users' => $users,
        'plans' => $plans,
        'filters' => $request->only(['search']),
        'flash' => [
            'success' => session('success'),
            'error' => session('error'),
        ]
    ]);
}

    // TERMODIFIKASI: Menerima Request untuk mendapatkan plan_id
  public function promote(Request $request, User $user)
{
    $validated = $request->validate([
        'plan_id' => 'required|exists:plans,id'
    ]);

    $plan = Plan::find($validated['plan_id']);

    Subscription::updateOrCreate(
        ['user_id' => $user->id],
        [
            'plan'         => $plan->name,
            'status'       => 'paid',
            'expired_at'   => Carbon::now()->addMonth(), // 1 bulan dari sekarang
            'paid_at'      => Carbon::now(),
            'payment_type' => 'gopay',
            // TAMBAHKAN INI - isi dengan nilai dummy untuk admin promote
            'midtrans_order_id' => 'MID_ORDER' . time(),
            'midtrans_transaction_id' => 'MID_TRANS' . time(),
        ]
    );

    return back()->with('success', "Pengguna {$user->name} berhasil di-promote ke paket {$plan->name}.");
}

    // Metode lain (demote, ban, unban) tidak perlu diubah.
    public function demote(User $user)
    {
        Subscription::where('user_id', $user->id)->delete();
        return back()->with('success', "Langganan premium untuk {$user->name} berhasil dicabut.");
    }

    public function ban(User $user)
    {
        $user->update(['banned_at' => now()]);
        return back()->with('success', "Pengguna {$user->name} berhasil dibanned.");
    }

    public function unban(User $user)
    {
        $user->update(['banned_at' => null]);
        return back()->with('success', "Ban untuk pengguna {$user->name} berhasil dicabut.");
    }
}