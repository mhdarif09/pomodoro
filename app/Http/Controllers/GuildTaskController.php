<?php

namespace App\Http\Controllers;

use App\Models\Guild;
use App\Models\Task;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use App\Jobs\DetermineTaskPriority;

class GuildTaskController extends Controller
{
    /**
     * Display the guild's task board.
     */
    public function index(Guild $guild)
    {
        // Ensure user is member
        if (!auth()->user()->guilds->contains($guild->id)) {
            abort(403, 'Unauthorized');
        }

        $tasks = $guild->tasks()
            ->with(['subtasks', 'user', 'tags', 'assignee', 'completer']) // eager load user to see who created/assigned
            ->orderBy('is_completed', 'asc')
            ->orderBy('priority', 'desc')
            ->get();

        return Inertia::render('Guilds/ToDo', [
            'guild' => [
                'id' => $guild->id,
                'name' => $guild->name,
                'emblem' => $guild->emblem,
            ],
            'tasks' => $tasks,
            'members' => $guild->members()->get()->map(fn($m) => ['id' => $m->id, 'name' => $m->name, 'avatar' => $m->avatar]),
            'enableAi' => $guild->leader && $guild->leader->activePlan->has_ai_guild_features,
        ]);
    }

    /**
     * Store a newly created task for the guild.
     */
    public function store(Request $request, Guild $guild)
    {
        if (!auth()->user()->guilds->contains($guild->id)) {
            abort(403, 'Unauthorized');
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'due_date' => 'nullable|date',
            'priority' => 'nullable|string|in:Rendah,Sedang,Tinggi,Mendesak',
            'status' => 'nullable|string',
            'estimated_minutes' => 'nullable|integer',
            'assigned_to' => 'nullable|exists:users,id',
        ]);

        $task = $guild->tasks()->create([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'due_date' => $validated['due_date'] ?? null,
            'priority' => $validated['priority'] ?? 'Sedang',
            'status' => $validated['status'] ?? 'todo',
            'estimated_minutes' => $validated['estimated_minutes'] ?? 25,
            'user_id' => auth()->id(), // Creator
            'guild_id' => $guild->id,
            'assigned_to' => $validated['assigned_to'] ?? null,
        ]);

        DetermineTaskPriority::dispatch($task);

        return back()->with('success', 'Team task created successfully.');
    }

    /**
     * Update the specified task.
     */
    public function update(Request $request, Guild $guild, Task $task)
    {
        if ($task->guild_id !== $guild->id) {
            abort(404);
        }

        if (!auth()->user()->guilds->contains($guild->id)) {
            abort(403, 'Unauthorized');
        }

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'due_date' => 'nullable|date',
            'priority' => 'nullable|string',
            'status' => 'nullable|string',
            'is_completed' => 'nullable|boolean',
            'assigned_to' => 'nullable|exists:users,id',
        ]);

        $wasCompleted = $task->is_completed;
        
        // Handle completion logic
        if (isset($validated['is_completed']) && $validated['is_completed'] && !$wasCompleted) {
            $validated['completed_by'] = auth()->id();
        } elseif (isset($validated['is_completed']) && !$validated['is_completed']) {
            $validated['completed_by'] = null;
        }

        $task->update($validated);
        
        if (isset($validated['is_completed']) && $validated['is_completed'] && !$wasCompleted) {
             // Task marked as done: Send Notification to Guild Chat
             \App\Models\GuildChat::create([
                 'guild_id' => $guild->id,
                 'user_id' => auth()->id(),
                 'message' => "telah menyelesaikan misi: **{$task->title}** 🎉",
             ]);
        }

        return back()->with('success', 'Task updated.');
    }

    /**
     * Remove the specified task.
     */
    public function destroy(Guild $guild, Task $task)
    {
         if ($task->guild_id !== $guild->id) {
            abort(404);
        }

        // AUTHORIZATION: Leader, Creator, or Assignee can delete
        $isLeader = $guild->members()->where('user_id', auth()->id())->wherePivot('role', 'leader')->exists();
        $isCreator = $task->user_id === auth()->id();
        $isAssignee = $task->assigned_to === auth()->id();

        if (!$isLeader && !$isCreator && !$isAssignee) {
            abort(403, 'Anda tidak memiliki akses untuk menghapus misi ini.');
        }

        $task->delete();

        return back()->with('success', 'Task deleted.');
    }
}
