<?php

namespace App\Http\Controllers;

use App\Models\Guild;
use App\Models\GuildChat;
use Illuminate\Http\Request;

class GuildChatController extends Controller
{
    /**
     * Get chat messages for a guild
     */
    public function index(Guild $guild, Request $request)
    {
        // Check if user is member
        if (!$guild->members()->where('user_id', auth()->id())->exists()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $messages = $guild->chats()
            ->with('user:id,name')
            ->latest()
            ->limit(100)
            ->get()
            ->reverse()
            ->values()
            ->map(function($chat) {
                return [
                    'id' => $chat->id,
                    'user_id' => $chat->user_id,
                    'user_name' => $chat->user->name,
                    'message' => $chat->message,
                    'created_at' => $chat->created_at->diffForHumans(),
                ];
            });

        return response()->json(['messages' => $messages]);
    }

    /**
     * Send a chat message
     */
    public function store(Guild $guild, Request $request)
    {
        // Check if user is member
        if (!$guild->members()->where('user_id', auth()->id())->exists()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'message' => 'required|string|max:500',
        ]);

        $chat = GuildChat::create([
            'guild_id' => $guild->id,
            'user_id' => auth()->id(),
            'message' => $validated['message'],
        ]);

        $chat->load('user:id,name');

        return response()->json([
            'success' => true,
            'message' => [
                'id' => $chat->id,
                'user_id' => $chat->user_id,
                'user_name' => $chat->user->name,
                'message' => $chat->message,
                'created_at' => $chat->created_at->diffForHumans(),
            ],
        ]);
    }
}
