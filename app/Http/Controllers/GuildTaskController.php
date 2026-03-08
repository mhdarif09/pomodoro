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
        if (!auth()->user()->guilds->contains('id', $guild->id)) {
            abort(403, 'Unauthorized');
        }

        $tasks = $guild->tasks()
            ->where('approval_status', 'approved')
            ->with(['subtasks', 'user', 'tags', 'assignee', 'completer', 'missionTasks', 'mission', 'comments.user']) // eager load relations
            ->orderBy('is_completed', 'asc')
            ->orderBy('priority', 'desc')
            ->paginate(15);

        $pendingTasks = [];
        $isLeader = $guild->members()->where('user_id', auth()->id())->wherePivot('role', 'leader')->exists();
        
        if ($isLeader) {
            $pendingTasks = $guild->tasks()
                ->where('approval_status', 'pending')
                ->with(['user', 'comments.user'])
                ->orderBy('created_at', 'desc')
                ->get();
        } else {
            // Member sees their own pending tasks
            $pendingTasks = $guild->tasks()
                ->where('approval_status', 'pending')
                ->where('user_id', auth()->id())
                ->with(['user', 'comments.user'])
                ->orderBy('created_at', 'desc')
                ->get();
        }

        // Get ALL focused tasks today (completed + uncompleted) for cycling
        $focusTasks = $guild->tasks()
            ->whereDate('focus_date', today())
            ->orderBy('is_completed', 'asc')
            ->with(['subtasks', 'user', 'tags', 'assignee'])
            ->get();

        // Resume: last active uncompleted task for current user in this guild
        $resumeTask = $guild->tasks()
            ->where('is_completed', false)
            ->where(function ($q) {
                $q->where('user_id', auth()->id())
                  ->orWhere('assigned_to', auth()->id());
            })
            ->orderBy('updated_at', 'desc')
            ->first();

        // Stagnant tasks: not updated in 7+ days
        $stagnantTasks = $guild->tasks()
            ->where('is_completed', false)
            ->where('updated_at', '<', now()->subDays(7))
            ->orderBy('updated_at', 'asc')
            ->take(5)
            ->get();

        return Inertia::render('Guilds/ToDo', [
            'guild' => [
                'id' => $guild->id,
                'name' => $guild->name,
                'emblem' => $guild->emblem,
                'xp_balance' => $guild->xp_balance,
                'is_leader' => $guild->members()->where('user_id', auth()->id())->wherePivot('role', 'leader')->exists(),
            ],
            'tasks' => $tasks,
            'pendingTasks' => $pendingTasks,
            'focusTasks' => $focusTasks,
            'resumeTask' => $resumeTask,
            'stagnantTasks' => $stagnantTasks,
            'members' => $guild->members()->get()->map(fn($m) => ['id' => $m->id, 'name' => $m->name, 'avatar' => $m->avatar]),
            'enableAi' => $guild->leader && $guild->leader->activePlan->has_ai_guild_features,
        ]);
    }

    /**
     * Store a newly created task for the guild.
     */
    public function store(Request $request, Guild $guild)
    {
        if (!auth()->user()->guilds->contains('id', $guild->id)) {
            abort(403, 'Unauthorized');
        }

        // ROLE CHECK: Allow members to propose, but Leaders skip approval
        $isLeader = $guild->members()->where('user_id', auth()->id())->wherePivot('role', 'leader')->exists();

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'due_date' => 'nullable|date',
            'priority' => 'nullable|string|in:Rendah,Sedang,Tinggi,Mendesak',
            'status' => 'nullable|string',
            'estimated_minutes' => 'nullable|integer',
            'assigned_to' => 'nullable|exists:users,id',
            'mission_id' => $isLeader ? 'nullable|exists:tasks,id' : 'required|exists:tasks,id',
        ], [
            'mission_id.required' => 'Member harus memilih Misi Guild (Category) untuk tugas ini.',
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
            'mission_id' => $validated['mission_id'] ?? null,
            'approval_status' => $isLeader ? 'approved' : 'pending',
            'approved_by' => $isLeader ? auth()->id() : null,
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

        if (!auth()->user()->guilds->contains('id', $guild->id)) {
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

             // [REFINED] Award XP only if 100% of subtasks are complete
             if ($task->mission_id) {
                 $mission = $task->mission;
                 
                 // Check if all approved subtasks for this mission are complete
                 $allDone = $mission->missionTasks()
                     ->where('approval_status', 'approved')
                     ->where('is_completed', false)
                     ->count() === 0;

                 if ($allDone && !$mission->is_completed) {
                     // 100% completion!
                     $mission->update([
                         'is_completed' => true,
                         'status' => 'done',
                         'completed_by' => auth()->id()
                     ]);

                     if ($mission->xp_reward > 0) {
                         // Collect unique contributors (users who completed subtasks)
                         $contributorIds = $mission->missionTasks()
                             ->where('approval_status', 'approved')
                             ->whereNotNull('completed_by')
                             ->pluck('completed_by')
                             ->unique()
                             ->values();

                         // Fallback: if no completed_by tracked, give to assignee or current user
                         if ($contributorIds->isEmpty()) {
                             $contributorIds = collect([$mission->assigned_to ?: auth()->id()]);
                         }

                         $totalXp = $mission->xp_reward;
                         $contributorCount = $contributorIds->count();
                         $xpPerPerson = intdiv($totalXp, $contributorCount);
                         $remainder = $totalXp % $contributorCount;

                         $rewardDetails = [];

                         foreach ($contributorIds as $index => $userId) {
                             $share = $xpPerPerson + ($index === $contributorCount - 1 ? $remainder : 0);
                             
                             \App\Models\User::where('id', $userId)->increment('redeemable_xp', $share);

                             \App\Models\XpTransaction::create([
                                 'user_id' => $userId,
                                 'amount' => $share,
                                 'reason' => "Kontribusi Misi '{$mission->title}' ({$contributorCount} kontributor). Share: {$share} XP",
                                 'source_type' => get_class($mission),
                                 'source_id' => $mission->id,
                             ]);

                             $contributor = \App\Models\User::find($userId);
                             $rewardDetails[] = "**{$contributor->name}** (+{$share} XP)";
                         }

                         // Success Message in Chat with split details
                         $detailStr = implode(', ', $rewardDetails);
                         \App\Models\GuildChat::create([
                             'guild_id' => $guild->id,
                             'user_id' => auth()->id(),
                             'message' => "Misi **{$mission->title}** tuntas 100%! 🎉 Reward **{$totalXp} XP** dibagi rata: {$detailStr}",
                         ]);
                     }
                 }
             }
             
             // If marking the mission itself as done manually by leader
             elseif ($task->is_mission && $task->xp_reward > 0) {
                 $completer = auth()->user();
                 $completer->increment('redeemable_xp', $task->xp_reward);
                 
                 // Log Transaction
                 \App\Models\XpTransaction::create([
                     'user_id' => $completer->id,
                     'amount' => $task->xp_reward,
                     'reason' => "Menyelesaikan Misi Guild (Manual): {$task->title}",
                     'source_type' => get_class($task),
                     'source_id' => $task->id,
                 ]);
             }
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

    /**
     * Approve a task proposal (Leader only).
     */
    public function approve(Request $request, Guild $guild, Task $task)
    {
        $isLeader = $guild->members()->where('user_id', auth()->id())->wherePivot('role', 'leader')->exists();
        if (!$isLeader) {
            abort(403, 'Hanya Leader yang dapat menyetujui misi.');
        }

        $validated = $request->validate([
            'xp_reward' => 'nullable|integer|min:0',
            'is_mission' => 'nullable|boolean',
        ]);

        $isMission = $validated['is_mission'] ?? ($task->mission_id === null);
        $xpReward = $validated['xp_reward'] ?? 0;

        $task->update([
            'approval_status' => 'approved',
            'approved_by' => auth()->id(),
            'xp_reward' => $xpReward,
            'is_mission' => $isMission,
            'funded_by_guild_id' => $guild->id,
        ]);

        // Notify member
        \App\Models\GuildChat::create([
            'guild_id' => $guild->id,
            'user_id' => auth()->id(),
            'message' => "telah menyetujui misi: **{$task->title}** status: ACC! 🚀",
        ]);

        return back()->with('success', 'Misi telah disetujui.');
    }

    /**
     * Add a comment to a task.
     */
    public function addComment(Request $request, Guild $guild, Task $task)
    {
        if ($task->guild_id !== $guild->id) abort(404);
        
        $validated = $request->validate([
            'message' => 'required|string',
        ]);

        $task->comments()->create([
            'user_id' => auth()->id(),
            'message' => $validated['message'],
        ]);

        return back()->with('success', 'Komentar ditambahkan.');
    }
}
