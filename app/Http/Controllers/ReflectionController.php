<?php

namespace App\Http\Controllers;

use App\Models\Reflection;
use App\Http\Requests\StoreReflectionRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Helpers\SecurityHelper;

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
            'prefilledPrompt' => $request->query('prefilled_prompt'),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreReflectionRequest $request)
    {
        $validated = $request->validated();

        // Check journal limit
        if (!$request->user()->canCreateReflection()) {
            $usage = $request->user()->getReflectionsUsage();
            return back()->with('error', "Batas journal gratis sudah tercapai ({$usage['current']}/{$usage['limit']}). Upgrade plan untuk unlimited journal!");
        }

        $reflection = $request->user()->reflections()->create([
            'user_answer' => SecurityHelper::sanitizeHtml($request->user_answer),
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
        $this->authorize('view', $reflection);
        
        return Inertia::render('Journal/Show', [
            'reflection' => $reflection,
        ]);
    }
}
