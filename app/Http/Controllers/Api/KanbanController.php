<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Jobs\DetermineTaskPriority;
use Illuminate\Support\Facades\DB;

class KanbanController extends Controller
{
    public function index(Request $request)
    {
        $tasks = $request->user()->tasks()
            ->with('subtasks')
            ->when($request->status, function ($query, $status) {
                return $query->where('status', $status);
            })
            ->latest()
            ->get();

        $kanbanTasks = [
            'todo' => $tasks->where('status', 'todo')->values(),
            'in_progress' => $tasks->where('status', 'in_progress')->values(),
            'done' => $tasks->where('status', 'done')->values(),
        ];

        return response()->json([
            'tasks' => $kanbanTasks
        ]);
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
            'document' => 'nullable|file|max:10240'
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
            'status' => $validated['status'] ?? 'todo'
        ]);

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

        return response()->json([
            'message' => 'Tugas berhasil ditambahkan!',
            'task' => $task->load('subtasks')
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
            'document' => 'nullable|file|max:10240'
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
                'notes' => $request->input('notes'),
                'auto_open_url' => $request->input('auto_open_url'),
            ]));
        });

        if ($task->wasChanged(['title', 'description', 'due_date'])) {
            DetermineTaskPriority::dispatch($task);
        }
        
        return response()->json([
            'message' => 'Tugas berhasil diperbarui.',
            'task' => $task->load('subtasks')
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

    private function getTimezoneString($timezone)
    {
        $timezones = [
            'WIB' => 'Asia/Jakarta',
            'WITA' => 'Asia/Makassar',
            'WIT' => 'Asia/Jayapura',
        ];

        return $timezones[$timezone] ?? 'Asia/Jakarta';
    }
}