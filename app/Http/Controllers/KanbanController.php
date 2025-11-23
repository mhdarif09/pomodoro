<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;
use Inertia\Inertia;

class KanbanController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        
        // Get tasks grouped by status
        $tasks = Task::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->groupBy('status');
        
        // Ensure all statuses exist even if empty
        $kanbanData = [
            'todo' => $tasks->get('todo', collect()),
            'in_progress' => $tasks->get('in_progress', collect()),
            'done' => $tasks->get('done', collect()),
        ];
        
        return Inertia::render('Docs/Index', [
            'kanbanTasks' => $kanbanData,
            'activeTab' => 'kanban'
        ]);
    }
    
    public function updateStatus(Request $request, Task $task)
    {
        // Check authorization
        if ($task->user_id !== auth()->id()) {
            abort(403);
        }
        
        $validated = $request->validate([
            'status' => 'required|in:todo,in_progress,done'
        ]);
        
        // Update status and is_completed
        $task->update([
            'status' => $validated['status'],
            'is_completed' => $validated['status'] === 'done' ? 1 : 0
        ]);
        
        return response()->json([
            'success' => true,
            'message' => 'Task status updated successfully'
        ]);
    }
}
