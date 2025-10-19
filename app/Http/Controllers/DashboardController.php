<?php
namespace App\Http\Controllers;

use App\Models\Plan;
use App\Models\Subscription;
use App\Models\User;
use App\Models\Task;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Carbon;

class DashboardController extends Controller
{
    private const FREE_REFLECTION_LIMIT = 10;

    public function index(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = auth()->user();
        $user->load('todaysGoal');
        
        // --- Statistik Total dihitung di Backend ---
        $today = Carbon::today();
        $startOfWeek = Carbon::now()->startOfWeek();
        $endOfWeek = Carbon::now()->endOfWeek();
        
        $taskStats = [
            'total' => $user->tasks()->count(),
            'completed' => $user->tasks()->where('is_completed', true)->count(),
            'dueThisWeek' => $user->tasks()->where('is_completed', false)->whereBetween('due_date', [$startOfWeek, $endOfWeek])->count(),
            'overdue' => $user->tasks()->where('is_completed', false)->where('due_date', '<', $today)->count(),
        ];

        // --- Logika Pengambilan Data dengan Pagination ---
        $tasksQuery = $user->tasks();
        $filter = $request->input('filter', 'all');

        switch ($filter) {
            case 'completed':
                $tasksQuery->where('is_completed', true);
                break;
            case 'week':
                $tasksQuery->where('is_completed', false)->whereBetween('due_date', [$startOfWeek, $endOfWeek]);
                break;
            case 'overdue':
                $tasksQuery->where('is_completed', false)->where('due_date', '<', $today);
                break;
        }

        $tasks = $tasksQuery->orderBy('is_completed', 'asc')
                             ->orderBy('due_date', 'asc')
                             ->paginate(20)
                             ->withQueryString();
        
        // --- Sisa Logika Controller Anda (Tidak Diubah) ---
        $plans = Plan::all();
        $activeSubscription = Subscription::where('user_id', $user->id)
            ->where('status', 'paid')
            ->where('expired_at', '>=', now())
            ->latest('expired_at')
            ->first();
            
        $usageCount = $user->reflections()->whereNotNull('user_answer')->count();
        $remainingQuota = self::FREE_REFLECTION_LIMIT - $usageCount;
        
        $showUpgradeModal = !$request->session()->get('dismissed_upgrade_modal', false) &&
            (!$activeSubscription || ($activeSubscription && $activeSubscription->expired_at->diffInDays(now()) <= 7));

        $isPremium = $activeSubscription && $activeSubscription->expired_at >= now();

        return Inertia::render('Dashboard', [
            'auth' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'onboarding_complete' => $user->onboarding_complete,
                    'is_premium' => $isPremium,
                ],
            ],
            'tasks' => $tasks,
            'taskStats' => $taskStats,
            'filters' => $request->only(['filter']),
            'is_premium' => $isPremium,
            'showOnboarding' => !$user->onboarding_complete,
            'todaysGoal' => $user->todaysGoal,
            'hasTodaysGoal' => (bool) $user->todaysGoal,
            'hasReflectedToday' => $user->reflections()->whereDate('reflection_date', today())->exists(),
            'plans' => $plans,
            'snap_token' => $request->query('snap_token'),
            'flash' => [
                'show_upgrade_modal' => $request->session()->get('show_upgrade_modal') || $showUpgradeModal,
            ],
            'remainingQuota' => max(0, $remainingQuota),
        ]);
    }

    public function dismissUpgradeModal(Request $request)
    {
        $request->session()->put('dismissed_upgrade_modal', true);
        return Redirect::back();
    }
}