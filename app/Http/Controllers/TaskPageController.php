<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Carbon;

class TaskPageController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $today = Carbon::today();
        $startOfWeek = Carbon::now()->startOfWeek();
        $endOfWeek = Carbon::now()->endOfWeek();
        $todayStr = $today->toDateString();
        $startOfWeekStr = $startOfWeek->toDateString();
        $endOfWeekStr = $endOfWeek->toDateString();

        // Task stats
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

        // Tasks with filters
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
                            ->paginate(50)
                            ->withQueryString();

        // Focus tasks for cycling
        $focusTasks = $user->tasks()->personal()
            ->whereDate('focus_date', today())
            ->with('subtasks')
            ->orderBy('is_completed', 'asc')
            ->get();

        // Smart Focus Suggestions
        $suggestedFocusTasks = collect([]);
        if ($focusTasks->where('is_completed', false)->count() < 3) {
            $smartFocusService = new \App\Services\SmartFocusService();
            $suggestedFocusTasks = $smartFocusService->getSuggestedTasks($user, 3);
        }

        // Resume task
        $resumeTask = $user->tasks()->personal()
            ->where('is_completed', false)
            ->orderBy('updated_at', 'desc')
            ->first();

        // Stagnant tasks (7+ days untouched)
        $stagnantTasks = $user->tasks()->personal()
            ->where('is_completed', false)
            ->where('updated_at', '<', now()->subDays(7))
            ->orderBy('updated_at', 'asc')
            ->take(5)
            ->get();

        return Inertia::render('Tasks/Index', [
            'tasks' => $tasks,
            'focusTasks' => $focusTasks,
            'suggestedFocusTasks' => $suggestedFocusTasks, // Pass to frontend
            'resumeTask' => $resumeTask,
            'stagnantTasks' => $stagnantTasks,
            'taskStats' => $taskStats,
            'filters' => $request->only(['filter']),
        ]);
    }
}
