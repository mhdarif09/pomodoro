<?php

namespace App\Services;

use App\Models\User;
use App\Models\Guild;
use App\Models\GuildMember;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class GuildService
{
    /**
     * Create a new guild
     */
    public function createGuild(User $creator, array $data): Guild
    {
        return DB::transaction(function () use ($creator, $data) {
            // Check if user is already in a guild
            if ($creator->guildMember) {
                throw new \Exception('Kamu sudah tergabung dalam guild.');
            }

            $guild = Guild::create([
                'name' => $data['name'],
                'description' => $data['description'] ?? null,
                'emblem' => $data['emblem'] ?? '🏰',
                'max_members' => $creator->activePlan->max_guild_members,
                'weekly_xp_reset_at' => now()->startOfWeek(),
            ]);

            // Add creator as leader
            GuildMember::create([
                'guild_id' => $guild->id,
                'user_id' => $creator->id,
                'role' => 'leader',
            ]);

            return $guild;
        });
    }

    /**
     * Join a guild
     */
    public function joinGuild(User $user, Guild $guild): void
    {
        DB::transaction(function () use ($user, $guild) {
            // Check if user is already in ANY guild
            if ($user->guildMembers()->exists()) {
                throw new \Exception('Kamu sudah tergabung dalam guild lain.');
            }

            // Check member limit based on LEADER's subscription
            $leader = $guild->leader;
            // Use leader's active plan limit or default to 10
            $limit = $leader ? $leader->activePlan->max_guild_members : 10;

            if ($guild->members()->count() >= $limit) {
                throw new \Exception($leader && $leader->is_premium ? 'Guild sudah penuh sesuai limit plan Leader.' : 'Guild Free terbatas. Upgrade Leader ke Premium untuk member lebih banyak!');
            }

            GuildMember::create([
                'guild_id' => $guild->id,
                'user_id' => $user->id,
                'role' => 'member',
            ]);
        });
    }

    /**
    * Join guild by invite code
    */
    public function joinByCode(User $user, string $code): Guild
    {
        $guild = Guild::where('invite_code', $code)->first();

        if (!$guild) {
            throw new \Exception('Kode invite tidak valid.');
        }

        $this->joinGuild($user, $guild);

        return $guild;
    }

    /**
     * Invite member by email
     */
    public function inviteMemberByEmail(Guild $guild, string $email): void
    {
        DB::transaction(function () use ($guild, $email) {
            $user = User::where('email', $email)->first();

            if (!$user) {
                throw new \Exception('User dengan email tersebut tidak ditemukan.');
            }

            if ($user->guildMember) {
                throw new \Exception('User tersebut sudah tergabung dalam guild.');
            }

            // Check member limit based on LEADER's subscription
            $leader = $guild->leader;
            // Use leader's active plan limit or default to 10
            $limit = $leader ? $leader->activePlan->max_guild_members : 10;

            if ($guild->members()->count() >= $limit) {
                throw new \Exception($leader && $leader->is_premium ? 'Guild sudah penuh sesuai limit plan Leader.' : 'Guild Free terbatas. Upgrade Leader ke Premium untuk member lebih banyak!');
            }

            GuildMember::create([
                'guild_id' => $guild->id,
                'user_id' => $user->id,
                'role' => 'member',
            ]);
        });
    }

    /**
     * Leave guild
     */
    public function leaveGuild(User $user): void
    {
        DB::transaction(function () use ($user) {
            $member = $user->guildMember;
            
            if (!$member) {
                throw new \Exception('Kamu tidak dalam guild.');
            }

            if ($member->role === 'leader') {
                $guild = $member->guild;
                $memberCount = $guild->members()->count();
                
                if ($memberCount > 1) {
                    throw new \Exception('Leader harus promote member lain atau bubarkan guild terlebih dahulu.');
                }
                
                // Delete guild if leader is the only member
                $guild->delete();
            } else {
                $member->delete();
            }
        });
    }

    /**
     * Update guild XP from members
     */
    public function updateGuildXP(Guild $guild): void
    {
        $totalXP = $guild->members()->sum('total_xp');
        $weeklyXP = $guild->guildMembers()->sum('weekly_contribution_xp');
        
        $guild->update([
            'total_xp' => $totalXP,
            'weekly_xp' => $weeklyXP,
        ]);
    }

    /**
     * Update member contribution when user earns XP
     */
    public function recordMemberContribution(User $user, int $xpAmount): void
    {
        $member = $user->guildMember;
        
        if (!$member) {
            return; // User not in guild
        }

        $member->increment('contribution_xp', $xpAmount);
        $member->increment('weekly_contribution_xp', $xpAmount);
        
        // Update guild totals
        $guild = $member->guild;
        $guild->increment('total_xp', $xpAmount);
        $guild->increment('weekly_xp', $xpAmount);
    }

    /**
     * Reset weekly XP for all guilds
     */
    public function resetWeeklyXP(): void
    {
        Guild::query()->update([
            'weekly_xp' => 0,
            'weekly_xp_reset_at' => now(),
        ]);
        
        GuildMember::query()->update([
            'weekly_contribution_xp' => 0,
        ]);
    }

    /**
     * Get guild leaderboard
     */
    public function getGuildLeaderboard(int $limit = 10, string $period = 'weekly'): array
    {
        $orderBy = $period === 'weekly' ? 'weekly_xp' : 'total_xp';
        
        return Guild::with('members')
            ->orderByDesc($orderBy)
            ->limit($limit)
            ->get()
            ->map(function ($guild) {
                return [
                    'id' => $guild->id,
                    'name' => $guild->name,
                    'emblem' => $guild->emblem,
                    'total_xp' => $guild->total_xp,
                    'weekly_xp' => $guild->weekly_xp,
                    'member_count' => $guild->members()->count(),
                    'rank' => $guild->getLeaderboardRank(),
                ];
            })
            ->toArray();
    }
}
