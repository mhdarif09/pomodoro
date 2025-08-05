<?php

namespace App\Http\Controllers;

use App\Models\Subscription;
use App\Models\Plan;
use App\Services\MidtransService;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;

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

        // Cek apakah ada transaksi UNPAID sebelumnya untuk plan ini
        $existing = Subscription::where('user_id', $userId)
            ->where('plan', $plan->name)
            ->where('status', 'unpaid')
            ->latest()
            ->first();

        if ($existing && $existing->snap_token) {
            return Inertia::render('Dashboard', [
                'snap_token' => $existing->snap_token,
                'plans' => Plan::all(),
                'auth' => [
                    'user' => [
                        'id' => $userId,
                        'name' => auth()->user()->name,
                        'email' => auth()->user()->email,
                        'onboarding_complete' => auth()->user()->onboarding_complete,
                        'is_premium' => $existing && $existing->expired_at >= now(),
                    ],
                ],
                'showOnboarding' => !auth()->user()->onboarding_complete,
                'todaysGoal' => auth()->user()->todaysGoal,
                'hasTodaysGoal' => (bool) auth()->user()->todaysGoal,
                'hasReflectedToday' => auth()->user()->reflections()->whereDate('reflection_date', today())->whereNotNull('user_answer')->exists(),
                'weeklyStats' => $this->getWeeklyStats(auth()->user()),
                'subscription' => $existing,
                'showTutorial' => $request->session()->pull('show_tutorial', false),
                'flash' => [
                    'show_upgrade_modal' => true,
                ],
            ]);
        }

        // Hitung expired_at jika nanti berhasil (untuk ditampilkan)
        $expiredAt = match ($plan->duration) {
            'monthly' => now()->addMonth(),
            'yearly' => now()->addYear(),
            default => now()->addMonth(),
        };

        // Buat subscription baru
        $subscription = Subscription::create([
            'user_id' => $userId,
            'plan' => $plan->name,
            'duration' => $plan->duration,
            'status' => 'unpaid',
            'expired_at' => null, // Akan diisi saat pembayaran sukses via webhook
        ]);

        // Kirim ke Midtrans
        $snap = $midtrans->createTransaction($subscription);

        // Return Inertia response with snap_token
        return Inertia::render('Dashboard', [
            'snap_token' => $snap->token,
            'plans' => Plan::all(),
            'auth' => [
                'user' => [
                    'id' => $userId,
                    'name' => auth()->user()->name,
                    'email' => auth()->user()->email,
                    'onboarding_complete' => auth()->user()->onboarding_complete,
                    'is_premium' => false,
                ],
            ],
            'showOnboarding' => !auth()->user()->onboarding_complete,
            'todaysGoal' => auth()->user()->todaysGoal,
            'hasTodaysGoal' => (bool) auth()->user()->todaysGoal,
            'hasReflectedToday' => auth()->user()->reflections()->whereDate('reflection_date', today())->whereNotNull('user_answer')->exists(),
            'weeklyStats' => $this->getWeeklyStats(auth()->user()),
            'subscription' => $subscription,
            'showTutorial' => $request->session()->pull('show_tutorial', false),
            'flash' => [
                'show_upgrade_modal' => true,
            ],
        ]);
    }

    private function getWeeklyStats($user)
    {
        $startOfWeek = now()->startOfWeek();
        $pomodoroCount = 0;
        if (method_exists($user, 'pomodoroSessions')) {
            $pomodoroCount = $user->pomodoroSessions()->where('created_at', '>=', $startOfWeek)->count();
        }
        $reflectionCount = $user->reflections()->where('reflection_date', '>=', $startOfWeek)->distinct('reflection_date')->count('reflection_date');
        $goalsAchievedCount = 0;
        if (method_exists($user, 'dailyGoals')) {
            $goalsAchievedCount = $user->dailyGoals()->where('is_completed', true)->where('goal_date', '>=', $startOfWeek)->count();
        }
        return [
            'pomodoros' => $pomodoroCount,
            'reflections' => $reflectionCount,
            'goalsAchieved' => $goalsAchievedCount,
        ];
    }

    public function paymentSuccessRedirect(Request $request)
    {
        session()->flash('show_tutorial', true);
        return Redirect::route('dashboard');
    }

    public function history()
    {
        $userId = auth()->id();

        $paidAndFailed = Subscription::where('user_id', $userId)
            ->whereIn('status', ['paid', 'failed', 'cancel'])
            ->orderByDesc('created_at');

        $latestPending = Subscription::where('user_id', $userId)
            ->where('status', 'pending')
            ->orderByDesc('created_at')
            ->limit(1);

        $subscriptions = $paidAndFailed->unionAll($latestPending)->get();

        return Inertia::render('Transactions/History', [
            'subscriptions' => $subscriptions,
        ]);
    }
}