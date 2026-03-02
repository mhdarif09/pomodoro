<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'avatar' => $this->avatar,
            'timezone' => $this->timezone,
            'xp' => $this->xp,
            'level' => $this->level,
            'is_premium' => $this->is_premium, // computed property is safe
            // explicitly avoiding: role, is_admin, banned_at, password, remember_token, subscription_status
        ];
    }
}
