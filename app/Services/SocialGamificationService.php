<?php

namespace App\Services;

use App\Models\Guild;
use App\Models\User;
use App\Models\GuildQuest;
use Illuminate\Support\Str;

class SocialGamificationService
{
    public function createGuild(User $user, array $data): Guild
    {
        $guild = Guild::create([
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
            'is_private' => $data['is_private'] ?? false,
            'invite_code' => strtoupper(Str::random(6)),
            'capacity' => 20,
        ]);

        // Add creator as leader
        $guild->members()->attach($user->id, ['role' => 'leader', 'joined_at' => now()]);
        
        // Generate initial Quest
        $this->generateGuildQuest($guild);

        return $guild;
    }

    public function joinGuild(User $user, string $inviteCode): Guild
    {
        $guild = Guild::where('invite_code', $inviteCode)->firstOrFail();

        if ($guild->members()->count() >= $guild->capacity) {
            throw new \Exception('Guild is full.');
        }

        if ($guild->members()->where('user_id', $user->id)->exists()) {
            throw new \Exception('You are already in this guild.');
        }

        $guild->members()->attach($user->id, ['role' => 'member', 'joined_at' => now()]);
        
        return $guild;
    }

    public function generateGuildQuest(Guild $guild): GuildQuest
    {
        // Simple logic: Create a random quest
        $types = [
            ['title' => 'Productivity Sprint', 'type' => 'total_xp', 'target' => 5000, 'reward' => 1000],
            ['title' => 'Focus Week', 'type' => 'minutes_focused', 'target' => 600, 'reward' => 800],
            ['title' => 'Task Masters', 'type' => 'tasks_completed', 'target' => 50, 'reward' => 500],
        ];

        $questData = $types[array_rand($types)];

        return GuildQuest::create([
            'guild_id' => $guild->id,
            'title' => $questData['title'],
            'target_type' => $questData['type'],
            'target_amount' => $questData['target'],
            'reward_xp' => $questData['reward'],
            'expires_at' => now()->addDays(7),
        ]);
    }
    
    /**
     * Called whenever a user performs an action (via GamificationService perhaps)
     */
    public function contributeToQuest(User $user, string $type, int $amount)
    {
        $guild = $user->guilds()->first(); // Assuming one guild per user for now
        if (!$guild) return;

        $activeQuests = $guild->quests()
            ->where('is_completed', false)
            ->where('target_type', $type)
            ->where('expires_at', '>', now())
            ->get();

        foreach ($activeQuests as $quest) {
            $quest->current_progress += $amount;
            
            if ($quest->current_progress >= $quest->target_amount) {
                $quest->is_completed = true;
                $quest->current_progress = $quest->target_amount;
                
                // Reward Guild XP
                $guild->total_xp += $quest->reward_xp;
                $guild->save();
            }
            
            $quest->save();
        }
    }
}
