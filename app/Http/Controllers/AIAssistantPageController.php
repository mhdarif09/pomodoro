<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class AIAssistantPageController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        if (!$user->activePlan->has_ai_genius_access) {
            return redirect()->route('dashboard')->with('error', 'Fitur AI Genius tidak tersedia di plan Anda. Silakan upgrade plan.');
        }

        return Inertia::render('AIAssistant/Index');
    }
}
