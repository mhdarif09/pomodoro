<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Guild;
use App\Services\SocialGamificationService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GuildController extends Controller
{
    protected $socialService;

    public function __construct(SocialGamificationService $socialService)
    {
        $this->socialService = $socialService;
    }

    public function index(Request $request)
    {
        $user = $request->user();
        $userGuild = $user->guilds()->with(['members', 'quests'])->first();

        // If user is in a guild, show that guild's dashboard
        if ($userGuild) {
            return Inertia::render('Guild/GuildDashboard', [
                'guild' => $userGuild,
                'members' => $userGuild->members,
                'quests' => $userGuild->quests()->where('expires_at', '>', now())->get(),
                'rank' => 1, // Placeholder for global guild rank
            ]);
        }

        // Otherwise (or additionally), show list of public guilds to join or create option
        return Inertia::render('Guild/Discovery', [
            'publicGuilds' => Guild::where('is_private', false)
                ->orderByDesc('total_xp')
                ->take(10)
                ->get()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:guilds|max:50',
            'description' => 'nullable|string|max:255',
            'is_private' => 'boolean'
        ]);

        try {
            $guild = $this->socialService->createGuild($request->user(), $validated);
            return redirect()->route('guild.index');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    public function join(Request $request)
    {
        $validated = $request->validate([
            'invite_code' => 'required|string|size:6'
        ]);

        try {
            $this->socialService->joinGuild($request->user(), $validated['invite_code']);
            return redirect()->route('guild.index');
        } catch (\Exception $e) {
            return back()->withErrors(['invite_code' => $e->getMessage()]);
        }
    }
}
