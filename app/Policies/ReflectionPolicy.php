<?php

namespace App\Policies;

use App\Models\Reflection;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class ReflectionPolicy
{
    public function view(User $user, Reflection $reflection): bool
    {
        return $user->id === $reflection->user_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Reflection $reflection): bool
    {
        return $user->id === $reflection->user_id;
    }

    public function delete(User $user, Reflection $reflection): bool
    {
        return $user->id === $reflection->user_id;
    }
}
