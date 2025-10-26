<?php

namespace App\Policies;

use App\Models\Document;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class DocumentPolicy
{
    public function view(User $user, Document $document): bool
    {
        if ($document->user_id === $user->id) {
            return true;
        }

        return $document->collaborators()->where('user_id', $user->id)->exists();
    }

    public function update(User $user, Document $document): bool
    {
        return $this->view($user, $document);
    }

    public function delete(User $user, Document $document): bool
    {
        return $document->user_id === $user->id;
    }

    public function invite(User $user, Document $document): bool
    {
        return $document->user_id === $user->id;
    }

    public function toggleSharing(User $user, Document $document): bool
    {
        return $document->user_id === $user->id;
    }
}