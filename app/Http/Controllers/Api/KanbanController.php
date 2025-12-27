<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use Illuminate\Http\Request;
use App\Http\Requests\StoreTaskRequest;
use App\Http\Requests\UpdateTaskRequest;
use Illuminate\Support\Facades\Storage;
use App\Jobs\DetermineTaskPriority;
use App\Jobs\SendTaskDeadlineReminders;
use Illuminate\Support\Facades\DB;

class KanbanController extends Controller
{
    public function index(Request $request)
    {
        $tasks = $request->user()->tasks()
            ->with('subtasks') // Eager load subtasks
            ->when($request->status, function ($query, $status) {
                return $query->where('status', $status);
            })
            ->latest()
            ->get();

        // Group tasks by status for Kanban
        $kanbanTasks = [
            'todo' => $tasks->where('status', 'todo')->values(),
            'in_progress' => $tasks->where('status', 'in_progress')->values(),
            'done' => $tasks->where('status', 'done')->values(),
        ];

        return response()->json([
            'tasks' => $kanbanTasks
        ]);
    }

    /**
     * Menyimpan tugas baru yang dibuat oleh user yang terotentikasi.
     */
    public function store(StoreTaskRequest $request)
    {
        $validated = $request->validated();
        
        // Add estimated_minutes to validation in StoreTaskRequest or check here if manual
        // Assuming StoreTaskRequest will be updated or we handle extra fields if not strictly striping
        $estimatedMinutes = $request->input('estimated_minutes');

        $documentPath = null;
        if ($request->hasFile('document')) {
            $documentPath = $request->file('document')->store('documents', 'public');
        }

        // Otomatis mengisi `user_id` dari user yang sedang login
        $task = $request->user()->tasks()->create([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'start_date' => $validated['start_date'] ?? null,
            'due_date' => $validated['due_date'] ?? null,
            'document_path' => $documentPath,
            'priority' => 'Sedang', 
            'estimated_minutes' => $estimatedMinutes,
            'status' => $validated['status'] ?? 'todo'
        ]);

        if ($request->has('subtasks')) {
            foreach ($request->subtasks as $subtaskData) {
                $task->subtasks()->create(['title' => $subtaskData['title']]);
            }
        }

        DetermineTaskPriority::dispatch($task);

        // Send instant WhatsApp notification if deadline is tomorrow
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

    /**
     * Memperbarui tugas yang ada.
     */
    public function update(UpdateTaskRequest $request, Task $task)
    {
        // Otorisasi dengan Policy untuk keamanan
        $this->authorize('update', $task);
        
        $validated = $request->validated();
        $estimatedMinutes = $request->input('estimated_minutes');

        DB::transaction(function () use ($request, $validated, $task, $estimatedMinutes) {
            if ($request->hasFile('document')) {
                if ($task->document_path) {
                    Storage::disk('public')->delete($task->document_path);
                }
                $validated['document_path'] = $request->file('document')->store('documents', 'public');
            }
            
            $task->update(array_merge($validated, ['estimated_minutes' => $estimatedMinutes]));
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

        $task->is_completed = !$task->is_completed;
        $task->status = $task->is_completed ? 'done' : 'todo';
        $task->save();

        return response()->json([
            'message' => 'Task status toggled',
            'task' => $task
        ]);
    }

    /**
     * Get PHP timezone string from Indonesian timezone code
     */
    private function getTimezoneString($timezone)
    {
        $timezones = [
            'WIB' => 'Asia/Jakarta',      // UTC+7
            'WITA' => 'Asia/Makassar',    // UTC+8
            'WIT' => 'Asia/Jayapura',     // UTC+9
        ];

        return $timezones[$timezone] ?? 'Asia/Jakarta';
    }
}
