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
    // Definisikan kuota gratis di sini agar mudah diubah
    /** @var \App\Models\User $user */

        private const FREE_REFLECTION_LIMIT = 10;

    public function index(Request $request, \App\Services\DeadlineRiskService $riskService) {
        set_time_limit(0);
        $user = auth()->user();
        
        // --- Statistik Total dihitung di Backend ---
        $today = Carbon::today();
        $startOfWeek = Carbon::now()->startOfWeek();
        $endOfWeek = Carbon::now()->endOfWeek();
        
        // --- Statistik Total dihitung di Backend dalam satu query ---
        $todayStr = $today->toDateString();
        $startOfWeekStr = $startOfWeek->toDateString();
        $endOfWeekStr = $endOfWeek->toDateString();

        $statsQuery = $user->tasks()->personal()
            ->selectRaw("
                count(*) as total,
                count(case when is_completed = 1 then 1 end) as completed,
                count(case when is_completed = 0 and due_date >= ? and due_date <= ? then 1 end) as dueThisWeek,
                count(case when is_completed = 0 and due_date < ? then 1 end) as overdue
            ", [$startOfWeekStr, $endOfWeekStr, $todayStr])
            ->first();

        $taskStats = [
            'total' => (int) $statsQuery->total,
            'completed' => (int) $statsQuery->completed,
            'dueThisWeek' => (int) $statsQuery->dueThisWeek,
            'overdue' => (int) $statsQuery->overdue,
        ];

        // --- Logika Pengambilan Data dengan Pagination ---
        $tasksQuery = $user->tasks()->personal()->with('subtasks', 'tags');
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
        $usageCount = $user->reflections()->whereNotNull('user_answer')->count();
        $remainingQuota = self::FREE_REFLECTION_LIMIT - $usageCount;
        
        // --- Deadline/Workload Risk Detection ---
        // Pre-load subtasks for risk service to avoid N+1
        $user->load(['tasks' => function($query) {
            $query->where('is_completed', false)
                  ->whereNotNull('due_date')
                  ->where('due_date', '<=', now()->addHours(48))
                  ->with('subtasks');
        }]);
        
        $deadlineRisks = $riskService->detectRisks($user);
        
        $showUpgradeModal = !$request->session()->get('dismissed_upgrade_modal', false) &&
            (!$user->is_premium);
          return Inertia::render('Dashboard', [
            'auth' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'is_premium' => $user->is_premium,
                ],
            ],
            'tasks' => $tasks ?? ['data' => [], 'total' => 0],
            'taskStats' => $taskStats ?? ['total' => 0, 'completed' => 0, 'dueThisWeek' => 0, 'overdue' => 0],
            'filters' => $request->only(['filter']),
            'is_premium' => $user->is_premium,
            'hasReflectedToday' => $user->reflections()->whereDate('reflection_date', today())->exists(),
            'plans' => $plans ?? [],
            'snap_token' => $request->query('snap_token'),
            'flash' => [
            'show_upgrade_modal' => $request->session()->get('show_upgrade_modal') || $showUpgradeModal,
            ],
            'remainingQuota' => max(0, $remainingQuota),
             'midtrans_client_key' => config('services.midtrans.client_key'),
            'midtrans_is_production' => config('services.midtrans.is_production'),
            'deadlineRisks' => $deadlineRisks,
        ]);
    }
    //     $props = [
    //         'auth' => [
    //             'user' => [
    //                 'id' => $user->id,
    //                 'name' => $user->name,
    //                 'email' => $user->email,
    //                 'onboarding_complete' => $user->onboarding_complete,
    //                 'is_premium' => $activeSubscription && $activeSubscription->expired_at >= now(),
    //             ],
    //         ],
    //         'showOnboarding' => !$user->onboarding_complete,
    //         'todaysGoal' => $user->todaysGoal,
    //         'hasTodaysGoal' => (bool) $user->todaysGoal,
    //         'hasReflectedToday' => $user->reflections()->whereDate('reflection_date', today())->exists(),
    //         'weeklyStats' => $this->getWeeklyStats($user),
    //         'subscription' => $activeSubscription,
    //         'showTutorial' => $request->session()->pull('show_tutorial', false),
    //         'plans' => $plans,
    //         'snap_token' => $request->query('snap_token'),
    //         'flash' => [
    //             'show_upgrade_modal' => $request->session()->get('show_upgrade_modal') || $showUpgradeModal,
    //         ],
    //         // TAMBAHKAN PROP BARU INI
    //         'remainingQuota' => max(0, $remainingQuota), 
    //           'midtrans_client_key' => config('services.midtrans.client_key'),
    //         'midtrans_is_production' => config('services.midtrans.is_production'),
    //     ];

    //     return Inertia::render('Dashboard', $props);
    // }

    // private function getWeeklyStats(User $user): array
    // {
    //     $startOfWeek = now()->startOfWeek();
    //     $pomodoroCount = 0;
    //     if (method_exists($user, 'pomodoroSessions')) {
    //         $pomodoroCount = $user->pomodoroSessions()->where('created_at', '>=', $startOfWeek)->count();
    //     }
    //     $reflectionCount = $user->reflections()->where('reflection_date', '>=', $startOfWeek)->distinct('reflection_date')->count('reflection_date');
    //     $goalsAchievedCount = 0;
    //     if (method_exists($user, 'dailyGoals')) {
    //         $goalsAchievedCount = $user->dailyGoals()->where('is_completed', true)->where('goal_date', '>=', $startOfWeek)->count();
    //     }
    //     return [
    //         'pomodoros' => $pomodoroCount,
    //         'reflections' => $reflectionCount,
    //         'goalsAchieved' => $goalsAchievedCount,
    //     ];
    // }

     public function dismissUpgradeModal(Request $request)
    {
        $request->session()->put('dismissed_upgrade_modal', true);
        return Redirect::back();
    }
}