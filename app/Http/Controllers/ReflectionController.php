<?php

namespace App\Http\Controllers;

use App\Models\Reflection;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReflectionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        if (!$request->user()->activePlan->has_journal_access) {
            return redirect()->route('dashboard')->with('error', 'Fitur Journal tidak tersedia di plan Anda. Silakan upgrade plan.');
        }

        $reflections = $request->user()->reflections()
            ->latest()
            ->paginate(10);

        return Inertia::render('Journal/Index', [
            'reflections' => $reflections,
            'todayReflection' => $request->user()->reflections()->whereDate('reflection_date', today())->first(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'user_answer' => 'required|string',
            'ai_question' => 'nullable|string',
        ]);

        $reflection = $request->user()->reflections()->create([
            'user_answer' => $request->user_answer,
            'ai_question' => $request->ai_question ?? 'Apa yang kamu pelajari hari ini?',
            'reflection_date' => now(),
        ]);

        // Trigger AI feedback job here if needed
        // \App\Jobs\GenerateReflectionFeedback::dispatch($reflection);

        return back()->with('success', 'Refleksi hari ini berhasil disimpan.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Reflection $reflection)
    {
        if ($reflection->user_id !== auth()->id()) {
            abort(403);
        }
        
        return Inertia::render('Journal/Show', [
            'reflection' => $reflection,
        ]);
    }
}
