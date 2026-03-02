<?php

namespace App\Policies;

use App\Models\Subtask;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class SubtaskPolicy
{
    public function view(User $user, Subtask $subtask): bool
    {
        return $user->id === $subtask->task->user_id;
    }

    public function create(User $user): bool
    {
        return true; // Parent Task ownership is checked in the controller before creation
    }

    public function update(User $user, Subtask $subtask): bool
    {
        return $user->id === $subtask->task->user_id;
    }

    public function delete(User $user, Subtask $subtask): bool
    {
        return $user->id === $subtask->task->user_id;
    }
}
