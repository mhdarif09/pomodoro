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
    public function index(Request $request)
    {
        $search = $request->input('search');

        $guilds = Guild::with('members')
            ->when($search, function($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%");
            })
            ->simplePaginate(12)
            ->withQueryString()
            ->through(function($guild) {
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
            'filters' => $request->only(['search']),
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
     * Invite member
     */
    public function invite(Request $request, Guild $guild)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
        ]);

        try {
            // Check authorization (leader only)
            if (!auth()->user()->guildMember || auth()->user()->guildMember->guild_id !== $guild->id || auth()->user()->guildMember->role !== 'leader') {
                return back()->with('error', 'Hanya leader yang dapat mengundang anggota.');
            }

            $this->guildService->inviteMemberByEmail($guild, $request->email);
            return back()->with('success', "Undangan berhasil dikirim ke {$request->email}!");
        } catch (\Exception $e) {
            return back()->with('error', $e.getMessage());
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
     * Show guild details (Overview Dashboard)
     */
    /**
     * Join guild by code
     */
    public function joinByCode(Request $request) 
    {
        $request->validate([
            'invite_code' => 'required|string|size:8'
        ]);

        try {
            $guild = $this->guildService->joinByCode(auth()->user(), strtoupper($request->invite_code));
            return back()->with('success', "Berhasil bergabung dengan Guild {$guild->name}!");
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Show guild details (Overview Dashboard)
     */
    public function show(Guild $guild)
    {
        // IDOR PROTECTION: Check if user is a member of this specific guild
        if (!$guild->members()->where('user_id', auth()->id())->exists()) {
             // If guild is public, maybe allow view? For now, STRICT DENY as per request to avoid IDOR.
             // Or redirect to index with error.
             return to_route('guilds.index')->with('error', 'Kamu bukan anggota guild ini.');
        }

        $guild->load(['members', 'chats.user']);

        return Inertia::render('Guilds/Show', [
            'guild' => [
                'id' => $guild->id,
                'name' => $guild->name,
                'description' => $guild->description,
                'emblem' => $guild->emblem,
                'invite_code' => $guild->invite_code, // Pass invite code to view
                'total_xp' => $guild->total_xp,
                'member_count' => $guild->members->count(),
                'max_members' => $guild->max_members,
                'is_leader' => $guild->members()->where('user_id', auth()->id())->wherePivot('role', 'leader')->exists(),
                'chats' => $guild->chats()->latest()->limit(20)->get()->map(function($chat) {
                    return [
                        'id' => $chat->id,
                        'user_name' => $chat->user->name,
                        'user_avatar' => $chat->user->avatar,
                        'message' => $chat->message,
                        'time' => $chat->created_at->diffForHumans(),
                        'is_system' => false
                    ];
                }),
                'recent_tasks_count' => $guild->tasks()->where('is_completed', true)->where('updated_at', '>=', now()->subDays(7))->count(),
            ],
            'members' => $guild->members->take(5)->map(fn($m) => ['id' => $m->id, 'name' => $m->name, 'avatar' => $m->avatar]),
            'enableAi' => $guild->leader && $guild->leader->is_premium,
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

    /**
     * Display Focus Nexus (Co-working Space)
     */
    public function focusNexus(Guild $guild)
    {
        if (!auth()->user()->guilds->contains($guild->id)) {
            abort(403, 'Unauthorized');
        }

        // Get members currently "focusing" (simulated or strictly by active timer if implemented)
        // For MVP: Get members online in last 15 mins
        $activeMembers = $guild->members()
            ->where('users.updated_at', '>=', now()->subMinutes(15)) // Assuming updated_at changes on activity, or use a cache
            ->get()
            ->map(function($m) {
                return [
                    'id' => $m->id,
                    'name' => $m->name,
                    'avatar' => $m->avatar,
                    'status' => 'focusing', // 'focusing', 'on_break', 'online'
                    'current_task' => 'Deep Work Session', // Placeholder or real task
                    'started_at' => now()->subMinutes(rand(5, 60)), // Mock start time
                ];
            });

        return Inertia::render('Guilds/FocusNexus', [
            'guild' => [
                'id' => $guild->id,
                'name' => $guild->name,
                'emblem' => $guild->emblem,
            ],
            'activeMembers' => $activeMembers,
            'enableAi' => $guild->leader && $guild->leader->is_premium,
        ]);
    }

    /**
     * Display Guild Report (Analytics)
     */
    public function report(Guild $guild)
    {
        if (!auth()->user()->guilds->contains($guild->id)) {
            abort(403, 'Unauthorized');
        }

        // Mock data or real calculations
        $totalFocusMinutes = $guild->tasks()->where('is_completed', true)->sum('estimated_minutes'); // Approximate
        $tasksCompleted = $guild->tasks()->where('is_completed', true)->count();
        $topContributors = $guild->members()
            ->withCount(['tasks as completed_tasks' => function($q) {
                $q->where('is_completed', true);
            }])
            ->orderByDesc('completed_tasks')
            ->limit(5)
            ->get()
            ->map(fn($m) => [
                'name' => $m->name,
                'avatar' => $m->avatar,
                'score' => $m->completed_tasks * 10, // Mock score
                'completed_tasks' => $m->completed_tasks
            ]);

        return Inertia::render('Guilds/Report', [
            'guild' => [
                'id' => $guild->id,
                'name' => $guild->name,
                'emblem' => $guild->emblem,
            ],
            'stats' => [
                'total_focus_hours' => round($totalFocusMinutes / 60, 1),
                'tasks_completed' => $tasksCompleted,
                'active_members' => $guild->members()->count(),
                // 'productivity_trend' => ... (chart data)
            ],
            'topContributors' => $topContributors,
        ]);
    }
}
