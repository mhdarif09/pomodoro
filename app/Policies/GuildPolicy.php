<?php

namespace App\Policies;

use App\Models\Guild;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class GuildPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Guild $guild): bool
    {
        return $guild->members()->where('user_id', $user->id)->exists();
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Guild $guild): bool
    {
        return $guild->members()->where('user_id', $user->id)->wherePivot('role', 'leader')->exists();
    }

    public function delete(User $user, Guild $guild): bool
    {
        return $this->update($user, $guild);
    }
}
