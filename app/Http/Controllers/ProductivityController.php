<?php

namespace App\Http\Controllers;

use App\Services\TaskPrioritizationService;
use App\Services\AntiOverplanningService;
use App\Services\TaskRecoveryService;
use Illuminate\Http\Request;

class ProductivityController extends Controller
{
    public function __construct(
        protected TaskPrioritizationService $prioritization,
        protected AntiOverplanningService $antiOverplanning,
        protected TaskRecoveryService $recovery
    ) {}
    
    /**
     * Get top 3 priority tasks recommendations
     */
    public function priorityRecommendations(Request $request)
    {
        $tasks = $this->prioritization->getTopPriorityTasks($request->user(), 3);
        
        return response()->json([
            'tasks' => $tasks->map(function ($task) {
                return [
                    'id' => $task->id,
                    'title' => $task->title,
                    'priority_score' => $task->priority_score,
                    'reasoning' => $this->prioritization->getReasoningText($task),
                    'due_date' => $task->due_date,
                    'complexity_score' => $task->complexity_score,
                    'status' => $task->status,
                ];
            }),
        ]);
    }
    
    /**
     * Get yesterday's in-progress task for continuation
     */
    public function continueWork(Request $request)
    {
        $task = $request->user()->tasks()
            ->where('status', 'in_progress')
            ->whereDate('updated_at', '<', today())
            ->orderBy('updated_at', 'desc')
            ->first();
            
        return response()->json([
            'task' => $task,
            'has_continuation' => !!$task,
        ]);
    }
    
    /**
     * Get recovery plan suggestion
     */
    public function recoveryPlan(Request $request)
    {
        $user = $request->user();
        
        if (!$this->recovery->shouldOfferRecovery($user)) {
            return response()->json([
                'should_offer' => false,
                'message' => 'No recovery needed',
            ]);
        }
        
        $plan = $this->recovery->generateRecoveryPlan($user);
        
        return response()->json([
            'should_offer' => true,
            'plan' => [
                'total_tasks' => $plan['total_tasks'],
                'to_archive' => $plan['to_archive'],
                'to_reschedule' => $plan['to_reschedule'],
                'to_keep' => $plan['to_keep'],
            ],
        ]);
    }
    
    /**
     * Apply recovery plan
     */
    public function applyRecovery(Request $request)
    {
        $user = $request->user();
        $plan = $this->recovery->generateRecoveryPlan($user);
        $this->recovery->applyRecoveryPlan($user, $plan);
        
        return back()->with('success', "Recovery plan applied! {$plan['to_archive']} tasks archived, {$plan['to_reschedule']} rescheduled.");
    }
    
    /**
     * Get daily focus stats
     */
    public function dailyFocusStats(Request $request)
    {
        $stats = $this->antiOverplanning->getDailyStats($request->user());
        
        return response()->json($stats);
    }
    
    /**
     * Set task as daily focus
     */
    public function setDailyFocus(Request $request, $taskId)
    {
        $task = $request->user()->tasks()->findOrFail($taskId);
        
        if (!$this->antiOverplanning->canAddNewTask($request->user())) {
            return response()->json([
                'success' => false,
                'message' => 'Daily focus limit reached',
            ], 422);
        }
        
        $this->antiOverplanning->setDailyFocus($task, true);
        
        return response()->json([
            'success' => true,
            'message' => 'Task set as daily focus',
        ]);
    }
    
    /**
     * Move task to tomorrow
     */
    public function moveToTomorrow(Request $request, $taskId)
    {
        $task = $request->user()->tasks()->findOrFail($taskId);
        $this->antiOverplanning->moveToTomorrow($task);
        
        return back()->with('success', 'Task moved to tomorrow');
    }
}
