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

    public function index(
        Request $request, 
        \App\Services\DeadlineRiskService $riskService,
        \App\Services\TaskPrioritizationService $prioritization,
        \App\Services\AntiOverplanningService $antiOverplanning,
        \App\Services\TaskRecoveryService $recovery,
        \App\Services\FocusAnalyticsService $analytics
    ) {
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

        // --- New Features: Smart Focus 3 & Resume ---
        // Get ALL focused tasks today (completed + uncompleted) for cycling
        $focusTasks = $user->tasks()->personal()
            ->whereDate('focus_date', today())
            ->with('subtasks')
            ->orderBy('is_completed', 'asc')
            ->get();

        // Smart Focus Suggestions (if slots available)
        $suggestedFocusTasks = collect([]);
        if ($focusTasks->where('is_completed', false)->count() < 3) {
            $smartFocusService = new \App\Services\SmartFocusService();
            $suggestedFocusTasks = $smartFocusService->getSuggestedTasks($user, 3);
        }

        $lastTask = $user->tasks()->personal()
            ->where('is_completed', false)
            ->whereNull('focus_date') // Don't suggest if already focused? Optional.
            ->orderBy('updated_at', 'desc')
            ->first();

        // --- Task Aging Alert ---
        $stagnantTasks = $user->tasks()->personal()
            ->where('is_completed', false)
            ->where('updated_at', '<', now()->subDays(7))
            ->orderBy('updated_at', 'asc')
            ->take(5)
            ->get();

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
            
        // --- PRODUCTIVITY FEATURES ---
        // Get top 3 priority tasks
        $priorityTasks = $prioritization->getTopPriorityTasks($user, 3)->map(function($task) use ($prioritization) {
            return [
                'id' => $task->id,
                'title' => $task->title,
                'priority_score' => $task->priority_score,
                'reasoning' => $prioritization->getReasoningText($task),
                'due_date' => $task->due_date,
                'complexity_score' => $task->complexity_score,
            ];
        });
        
        // Get last in-progress task for continuation (anytime)
        $continueWorkTask = $user->tasks()
            ->where('status', 'in_progress')
            ->orderBy('updated_at', 'desc')
            ->first();
        
        // Check if recovery should be offered
        $recoveryPlan = null;
        if ($recovery->shouldOfferRecovery($user)) {
            $plan = $recovery->generateRecoveryPlan($user);
            $recoveryPlan = [
                'total_tasks' => $plan['total_tasks'],
                'to_archive' => $plan['to_archive'],
                'to_reschedule' => $plan['to_reschedule'],
                'to_keep' => $plan['to_keep'],
            ];
        }
        
        // Get daily focus stats
        $dailyStats = $antiOverplanning->getDailyStats($user);

        $todayTaskStats = $user->tasks()->personal()
            ->whereDate('focus_date', today())
            ->selectRaw("count(*) as total, count(case when is_completed = 1 then 1 end) as completed")
            ->first();

        $aiInsightSnippet = null;
        $insights = $analytics->getSimplifiedInsights($user->id);
        if (isset($insights['peak_hours'])) {
            $aiInsightSnippet = $insights['peak_hours']['message'];
        } elseif (isset($insights['focus_drop']) && $insights['focus_drop']['type'] === 'warning') {
            $aiInsightSnippet = $insights['focus_drop']['message'];
        }

        return Inertia::render('Dashboard', [
            'tasks' => $tasks ?? ['data' => [], 'total' => 0],
            'focusTasks' => $focusTasks,
            'suggestedFocusTasks' => $suggestedFocusTasks, // Pass to frontend
            'resumeTask' => $lastTask,
            'stagnantTasks' => $stagnantTasks,
            'taskStats' => $taskStats ?? ['total' => 0, 'completed' => 0, 'dueThisWeek' => 0, 'overdue' => 0],
            'todayTaskStats' => [
                'total' => (int) ($todayTaskStats->total ?? 0),
                'completed' => (int) ($todayTaskStats->completed ?? 0)
            ],
            'aiInsightSnippet' => $aiInsightSnippet,
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
            
            // Productivity features
            'priorityTasks' => $priorityTasks,
            'continueWorkTask' => $continueWorkTask,
            'recoveryPlan' => $recoveryPlan,
            'dailyStats' => $dailyStats,
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