<?php

namespace App\Policies;

use App\Models\ChatSession;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class ChatSessionPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, ChatSession $chatSession): bool
    {
        return $user->id === $chatSession->user_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, ChatSession $chatSession): bool
    {
        return $user->id === $chatSession->user_id;
    }

    public function delete(User $user, ChatSession $chatSession): bool
    {
        return $user->id === $chatSession->user_id;
    }
}
