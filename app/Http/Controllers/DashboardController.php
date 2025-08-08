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
    // Definisikan kuota gratis di sini agar mudah diubah
    private const FREE_REFLECTION_LIMIT = 10;

    public function index(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = auth()->user();
        if ($user instanceof \Illuminate\Database\Eloquent\Model) {
            $user->load('todaysGoal');
        }

        $plans = Plan::all();
        $activeSubscription = Subscription::where('user_id', $user->id)
            ->where('status', 'paid')
            ->where('expired_at', '>=', now())
            ->latest('expired_at')
            ->first();
            
        // --- LOGIKA BARU UNTUK KUOTA GRATIS ---
        // Hitung berapa banyak jawaban yang sudah diberikan oleh pengguna
        $usageCount = $user->reflections()->whereNotNull('user_answer')->count();
        $remainingQuota = self::FREE_REFLECTION_LIMIT - $usageCount;
        // ------------------------------------

        $showUpgradeModal = !$request->session()->get('dismissed_upgrade_modal', false) &&
            (!$activeSubscription || ($activeSubscription && $activeSubscription->expired_at->diffInDays(now()) <= 7));

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
            'hasReflectedToday' => $user->reflections()->whereDate('reflection_date', today())->exists(),
            'weeklyStats' => $this->getWeeklyStats($user),
            'subscription' => $activeSubscription,
            'showTutorial' => $request->session()->pull('show_tutorial', false),
            'plans' => $plans,
            'snap_token' => $request->query('snap_token'),
            'flash' => [
                'show_upgrade_modal' => $request->session()->get('show_upgrade_modal') || $showUpgradeModal,
            ],
            // TAMBAHKAN PROP BARU INI
            'remainingQuota' => max(0, $remainingQuota), 
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
        return Redirect::route('dashboard');
    }
}