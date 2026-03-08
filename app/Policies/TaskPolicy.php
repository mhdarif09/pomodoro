<?php

namespace App\Policies;

use App\Models\Task;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class TaskPolicy
{
    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Task $task): bool
    {
        // Izinkan update HANYA jika ID user sama dengan user_id pada task.
        return $user->id === $task->user_id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Task $task): bool
    {
        // Izinkan delete HANYA jika ID user sama dengan user_id pada task.
        return $user->id === $task->user_id;
    }

    // Method lainnya bisa Anda biarkan atau sesuaikan jika perlu
}