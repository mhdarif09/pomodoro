<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\AiSubtaskUsage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Jobs\DetermineTaskPriority;
use Illuminate\Support\Facades\DB;
use App\Services\TaskAIService;
use Carbon\Carbon;
use App\Helpers\SecurityHelper;

class KanbanController extends Controller
{
    public function index(Request $request)
    {
        $tasks = $request->user()->tasks()
            ->personal()
            ->with('subtasks')
            ->when($request->status, function ($query, $status) {
                return $query->where('status', $status);
            })
            ->with(['subtasks', 'tags']) // Eager load tags
            ->orderBy('is_completed', 'asc')
            ->orderBy('priority', 'desc')
            ->orderBy('due_date', 'asc')
            ->get();

        return response()->json($tasks);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_date' => 'nullable|date',
            'due_date' => 'nullable|date',
            'priority' => 'nullable|string',
            'status' => 'nullable|string|in:todo,in_progress,done',
            'estimated_minutes' => 'nullable|integer',
            'document' => 'nullable|file|max:10240',
            'notes' => 'nullable|string', // Rich text notes
            'tags' => 'nullable|array',   // Array of tag IDs
            'tags.*' => 'exists:tags,id',
        ]);
        
        $estimatedMinutes = $request->input('estimated_minutes', 25);

        $documentPath = null;
        if ($request->hasFile('document')) {
            $documentPath = $request->file('document')->store('documents', 'public');
        }

        $task = $request->user()->tasks()->create([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'start_date' => $validated['start_date'] ?? now(),
            'due_date' => $validated['due_date'] ?? null,
            'document_path' => $documentPath,
            'priority' => $validated['priority'] ?? 'Sedang', 
            'estimated_minutes' => $estimatedMinutes,
            'status' => $validated['status'] ?? 'todo',
            'notes' => SecurityHelper::sanitizeHtml($validated['notes'] ?? null),
        ]);

        // Sync tags
        if (!empty($validated['tags'])) {
            $task->tags()->sync($validated['tags']);
        }

        if ($request->has('subtasks') && is_array($request->subtasks)) {
            foreach ($request->subtasks as $subtaskData) {
                if (!empty($subtaskData['title'])) {
                    $task->subtasks()->create(['title' => $subtaskData['title']]);
                }
            }
        }

        DetermineTaskPriority::dispatch($task);

        $user = $request->user();
        $userTimezone = $this->getTimezoneString($user->timezone ?? 'WIB');
        $tomorrow = now($userTimezone)->addDay()->toDateString();
        
        if ($task->due_date && $task->due_date->toDateString() == $tomorrow && $user->phone) {
            \App\Jobs\SendTaskDeadlineReminders::dispatch($task, 'instant');
        }

        // --- GOOGLE CALENDAR SYNC ---
        if ($user->google_access_token) {
            try {
                // Fire and forget or sync inline? Inline is fine for now as it's fast.
                // For better performance, dispatch a Job: SyncTaskToGoogleCalendar::dispatch($user, $task);
                // But for mvp inline is okay.
                $calendarService = app(\App\Services\GoogleCalendarService::class);
                $calendarService->syncTaskToCalendar($user, $task);
            } catch (\Exception $e) {
                \Log::error("Failed to auto-sync task to GCal: " . $e->getMessage());
            }
        }

        return response()->json([
            'message' => 'Tugas berhasil ditambahkan!',
            'task' => $task->load(['subtasks', 'tags'])
        ], 201);
    }

    public function update(Request $request, Task $task)
    {
        $this->authorize('update', $task);
        
        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'due_date' => 'nullable|date',
            'priority' => 'nullable|string',
            'status' => 'nullable|string',
            'estimated_minutes' => 'nullable|integer',
            'notes' => 'nullable|string',
            'auto_open_url' => 'nullable|url',
            'document' => 'nullable|file|max:10240',
            'tags' => 'nullable|array',
            'tags.*' => 'exists:tags,id',
        ]);

        $estimatedMinutes = $request->input('estimated_minutes', $task->estimated_minutes);

        DB::transaction(function () use ($request, $validated, $task, $estimatedMinutes) {
            if ($request->hasFile('document')) {
                if ($task->document_path) {
                    Storage::disk('public')->delete($task->document_path);
                }
                $validated['document_path'] = $request->file('document')->store('documents', 'public');
            }
            
            $task->update(array_merge($validated, [
                'estimated_minutes' => $estimatedMinutes,
                'notes' => SecurityHelper::sanitizeHtml($request->input('notes')),
                'auto_open_url' => $request->input('auto_open_url'),
            ]));

            // Sync tags
            if (isset($validated['tags'])) {
                $task->tags()->sync($validated['tags']);
            }
        });

        if ($task->wasChanged(['title', 'description', 'due_date'])) {
            DetermineTaskPriority::dispatch($task);
        }
        
        return response()->json([
            'message' => 'Tugas berhasil diperbarui.',
            'task' => $task->load(['subtasks', 'tags'])
        ]);
    }

    public function destroy(Task $task)
    {
        $this->authorize('delete', $task);

        if ($task->document_path) {
            Storage::disk('public')->delete($task->document_path);
        }
        
        $task->delete();

        return response()->json([
            'message' => 'Task deleted successfully'
        ]);
    }

    public function toggleComplete(Task $task)
    {
        $this->authorize('update', $task);

        $wasCompleted = $task->is_completed;
        
        DB::transaction(function () use ($task, $wasCompleted) {
            $task->is_completed = !$task->is_completed;
            $task->status = $task->is_completed ? 'done' : 'todo';
            $task->save();

            // Award XP for completing task
            if ($task->is_completed && !$wasCompleted) {
                $gamificationService = app(\App\Services\GamificationService::class);
                $xpAmount = match ($task->priority) {
                    'Tinggi', 'High' => 50,
                    'Sedang', 'Medium' => 30,
                    'Rendah', 'Low' => 20,
                    default => 25,
                };
                $gamificationService->awardXP($task->user, $xpAmount, 'task_completed', $task);
                $gamificationService->updateStreak($task->user);
                $gamificationService->checkAchievements($task->user);
            }
        });

        return response()->json([
            'message' => 'Task status toggled',
            'task' => $task
        ]);
    }

    public function toggleFocus(Task $task)
    {
        $this->authorize('update', $task);

        $today = now()->toDateString();
        $smartFocusService = new \App\Services\SmartFocusService();
        
        // If already focused today, unfocus
        if ($task->focus_date && $task->focus_date->toDateString() === $today) {
            $task->update(['focus_date' => null]);
            $message = 'Removed from Focus';
            
            // Record rejection/removal for learning
            $smartFocusService->recordUserChoice(auth()->user(), $task, 'rejected');
        } else {
            // Check limit (3 max)
            if ($task->guild_id) {
                // Guild Context: Count only UNCOMPLETED focused tasks (enables cycling)
                $count = Task::where('guild_id', $task->guild_id)
                    ->whereDate('focus_date', $today)
                    ->where('is_completed', false)
                    ->count();
                $limitMsg = 'Guild Focus List Full (Max 3 aktif)';
            } else {
                // Personal Context: Count only UNCOMPLETED focused tasks (enables cycling)
                $count = Task::where('user_id', auth()->id())
                    ->whereNull('guild_id')
                    ->whereDate('focus_date', $today)
                    ->where('is_completed', false)
                    ->count();
                $limitMsg = 'Personal Focus List Full (Max 3 aktif)';
            }
            
            if ($count >= 3) {
                return response()->json(['message' => $limitMsg], 422);
            }

            $task->update(['focus_date' => $today]);
            $message = 'Added to Focus';

            // Record acceptance for learning
            $smartFocusService->recordUserChoice(auth()->user(), $task, 'accepted');
        }

        return response()->json([
            'message' => $message,
            'task' => $task
        ]);
    }

    /**
     * Dismiss a suggested task (Smart Focus 3).
     * Records 'skipped' preference so it won't be suggested again immediately.
     */
    public function dismissSuggestion(Task $task)
    {
        $this->authorize('update', $task);
        
        $smartFocusService = new \App\Services\SmartFocusService();
        $smartFocusService->recordUserChoice(auth()->user(), $task, 'skipped');

        return response()->json(['message' => 'Suggestion dismissed']);
    }

    private function getTimezoneString($timezone)
    {
        $timezones = [
            'WIB' => 'Asia/Jakarta',
            'WITA' => 'Asia/Makassar',
            'WIT' => 'Asia/Jayapura',
        ];

        return $timezones[$timezone] ?? 'Asia/Jakarta';
    }

    public function suggestBreakdown(Task $task, TaskAIService $taskAIService)
    {
        set_time_limit(0);
        try {
            $this->authorize('update', $task);

            $user = $task->user;
            
            // Get user's plan limit (default 20 for free users)
            $maxSubtasks = 20; // Default for non-premium
            if ($user->is_premium && $user->subscription) {
                $plan = $user->subscription->planDetail;
                if ($plan) {
                    $maxSubtasks = $plan->max_subtasks ?? 20;
                }
            }
            
            // Check current usage for this month
            $currentMonth = now()->format('Y-m');
            $usage = AiSubtaskUsage::getUsageForMonth($user->id, $currentMonth);
            
            if ($usage->count >= $maxSubtasks) {
                return response()->json([
                    'success' => false,
                    'message' => "Limit AI Subtask tercapai! Kamu sudah generate {$maxSubtasks} subtask bulan ini. Upgrade untuk limit lebih tinggi!",
                    'limit_reached' => true,
                    'current_usage' => $usage->count,
                    'max_limit' => $maxSubtasks
                ], 403);
            }

            // Call AI service
            $result = $taskAIService->suggestSubtasks($task);

            if ($result['success']) {
                // Increment usage counter manually to avoid Eloquent method conflicts
                $usage->count += count($result['subtasks']);
                $usage->save();
                
                return response()->json([
                    'success' => true,
                    'message' => 'AI berhasil generate subtask suggestions',
                    'subtasks' => $result['subtasks'],
                    'count' => count($result['subtasks']),
                    'usage' => [
                        'used' => $usage->count,
                        'limit' => $maxSubtasks,
                        'remaining' => max(0, $maxSubtasks - $usage->count)
                    ]
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Gagal generate AI suggestions. Silakan coba lagi.',
                'error' => $result['error'] ?? 'Unknown error'
            ], 500);
            
        } catch (\Exception $e) {
            \Log::error('AI Suggest Error', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan sistem: ' . $e->getMessage(),
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reschedule failed tasks to tomorrow
     */
    public function rescheduleFailedTasks(Request $request)
    {
        $today = Carbon::today()->format('Y-m-d');
        
        // Find all tasks with due_date today and not completed
        $failedTasks = Task::where('user_id', $request->user()->id)
            ->whereDate('due_date', $today)
            ->where('is_completed', false)
            ->get();

        $rescheduledCount = 0;
        $tomorrow = Carbon::tomorrow();

        foreach ($failedTasks as $task) {
            $task->update([
                'due_date' => $tomorrow,
                'auto_rescheduled_count' => $task->auto_rescheduled_count + 1
            ]);
            $rescheduledCount++;
        }

        return response()->json([
            'success' => true,
            'message' => "Berhasil reschedule {$rescheduledCount} task ke besok",
            'rescheduled_count' => $rescheduledCount,
            'tasks' => $failedTasks->map(fn($t) => [
                'id' => $t->id,
                'title' => $t->title,
                'new_due_date' => $tomorrow->format('Y-m-d'),
                'reschedule_count' => $t->auto_rescheduled_count
            ])
        ]);
    }
}