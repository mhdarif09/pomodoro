<?php

namespace App\Http\Controllers;

use App\Models\Guild;
use App\Services\GuildService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GuildController extends Controller  
{
    protected $guildService;

    public function __construct(GuildService $guildService)
    {
        $this->guildService = $guildService;
    }

    /**
     * Display all guilds
     */
    public function index()
    {
        $guilds = Guild::with('members')->get()->map(function($guild) {
            return [
                'id' => $guild->id,
                'name' => $guild->name,
                'description' => $guild->description,
                'emblem' => $guild->emblem,
                'member_count' => $guild->members()->count(),
                'max_members' => $guild->max_members,
                'total_xp' => $guild->total_xp,
                'is_full' => $guild->isFull(),
            ];
        });

        return Inertia::render('Guilds/Index', [
            'guilds' => $guilds,
            'userGuild' => auth()->user()->guildMember ? auth()->user()->guild() : null,
        ]);
    }

    /**
     * Create new guild
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:guilds',
            'description' => 'nullable|string',
            'emblem' => 'nullable|string|max:10',
        ]);

        try {
            $guild = $this->guildService->createGuild(auth()->user(), $validated);
            return back()->with('success', "Guild {$guild->name} berhasil dibuat!");
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Join guild
     */
    public function join(Request $request, Guild $guild)
    {
        try {
            $this->guildService->joinGuild(auth()->user(), $guild);
            return back()->with('success', "Kamu berhasil bergabung dengan Guild {$guild->name}!");
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Leave guild
     */
    public function leave()
    {
        try {
            $this->guildService->leaveGuild(auth()->user());
            return back()->with('success', 'Kamu berhasil keluar dari guild.');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Show guild details
     */
    public function show(Guild $guild)
    {
        $guild->load(['members', 'chats' => function($q) {
            $q->with('user')->latest()->limit(50);
        }]);

        return Inertia::render('Guilds/Show', [
            'guild' => [
                'id' => $guild->id,
                'name' => $guild->name,
                'description' => $guild->description,
                'emblem' => $guild->emblem,
                'total_xp' => $guild->total_xp,
                'weekly_xp' => $guild->weekly_xp,
                'rank' => $guild->getLeaderboardRank(),
                'members' => $guild->members->map(fn($m) => [
                    'id' => $m->id,
                    'name' => $m->name,
                    'level' => $m->level,
                    'role' => $m->pivot->role,
                    'contribution_xp' => $m->pivot->contribution_xp,
                ]),
                'chats' => $guild->chats->map(fn($c) => [
                    'id' => $c->id,
                    'user' => $c->user,
                    'message' => $c->message,
                    'created_at' => $c->created_at,
                ])->reverse()->values(),
            ],
            'canManage' => $guild->members()->wherePivot('user_id', auth()->id())->wherePivot('role', 'leader')->exists(),
        ]);
    }

    /**
     * Get guild leaderboard
     */
    public function leaderboard(Request $request)
    {
        $period = $request->get('period', 'weekly');
        $leaderboard = $this->guildService->getGuildLeaderboard(50, $period);

        return response()->json([
            'leaderboard' => $leaderboard,
        ]);
    }
}
