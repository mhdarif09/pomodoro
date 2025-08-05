<?php
namespace App\Http\Controllers;

use App\Models\Plan;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Redirect;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        if ($user instanceof \Illuminate\Database\Eloquent\Model) {
            $user->load('todaysGoal');
        }

        // Ambil semua plan
        $plans = Plan::all();

        // Cek langganan aktif
        $activeSubscription = Subscription::where('user_id', $user->id)
            ->where('status', 'paid')
            ->where('expired_at', '>=', now())
            ->latest('expired_at')
            ->first();

        // Tentukan apakah modal upgrade harus ditampilkan
        $showUpgradeModal = !$request->session()->get('dismissed_upgrade_modal', false) &&
            (!$activeSubscription || ($activeSubscription && $activeSubscription->expired_at->diffInDays(now()) <= 7));

        // Siapkan props untuk frontend
        $props = [
            'auth' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'onboarding_complete' => $user->onboarding_complete,
                    'is_premium' => $activeSubscription && $activeSubscription->expired_at >= now(),
                ],
            ],
            'showOnboarding' => !$user->onboarding_complete,
            'todaysGoal' => $user->todaysGoal,
            'hasTodaysGoal' => (bool) $user->todaysGoal,
            'hasReflectedToday' => $user->reflections()->whereDate('reflection_date', today())->whereNotNull('user_answer')->exists(),
            'weeklyStats' => $this->getWeeklyStats($user),
            'subscription' => $activeSubscription,
            'showTutorial' => $request->session()->pull('show_tutorial', false),
            'plans' => $plans,
            'snap_token' => $request->query('snap_token'),
            'flash' => [
                'show_upgrade_modal' => $showUpgradeModal,
            ],
        ];

        return Inertia::render('Dashboard', $props);
    }

    private function getWeeklyStats(User $user): array
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

    public function dismissUpgradeModal(Request $request)
    {
        $request->session()->put('dismissed_upgrade_modal', true);
        return Redirect::route('dashboard'); // Redirect to dashboard instead of JSON
    }
}