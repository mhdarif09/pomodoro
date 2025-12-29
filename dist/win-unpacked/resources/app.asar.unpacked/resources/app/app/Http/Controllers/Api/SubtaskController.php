<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Subtask;
use App\Models\Task;
use Illuminate\Http\Request;

class SubtaskController extends Controller
{
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, Task $task)
    {
        $this->authorize('update', $task);
        $user = auth()->user();

        // Admin has no limit
        if ($user->role !== 'admin') {
            $plan = $user->subscription?->planDetail; 
            // Fallback for free users or if plan not found
            $maxSubtasks = $plan ? $plan->max_subtasks : 3;

            if ($task->subtasks()->count() >= $maxSubtasks) {
                return response()->json([
                    'message' => "Limit subtask tercapai ($maxSubtasks). Silakan upgrade plan untuk menambah lebih banyak."
                ], 403);
            }
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
        ]);

        $subtask = $task->subtasks()->create([
            'title' => $validated['title'],
            'is_completed' => false,
        ]);

        return response()->json(['subtask' => $subtask], 201);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Subtask $subtask)
    {
        $this->authorize('update', $subtask->task);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'is_completed' => 'sometimes|boolean',
        ]);

        $subtask->update($validated);

        return response()->json(['subtask' => $subtask]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Subtask $subtask)
    {
        $this->authorize('update', $subtask->task);
        
        $subtask->delete();

        return response()->noContent();
    }
}
