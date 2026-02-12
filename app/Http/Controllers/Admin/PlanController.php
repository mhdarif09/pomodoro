<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class PlanController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Plan/Index', [
            'plans' => Plan::orderBy('price')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:plans,name',
            'price' => 'required|integer|min:1000',
            'duration' => 'required|in:monthly,yearly',
            'description' => 'nullable|string|max:500',
            'features' => 'nullable|array',
            'is_active' => 'boolean',
            'max_subtasks' => 'nullable|integer|min:0',
            'has_ai_assistant' => 'boolean',
            'ai_chat_limit' => 'nullable|integer|min:-1',
            'has_productivity_report' => 'boolean',
            'has_auto_open_url' => 'boolean',
            'has_quick_notes' => 'boolean',
            'max_guild_members' => 'nullable|integer|min:0',
            'has_ai_guild_features' => 'boolean',
            'has_journal_access' => 'boolean',
            'has_learning_hub_access' => 'boolean',
            'has_gamification_access' => 'boolean',
        ]);

        // Set default values untuk features jika tidak diisi
        $validated['features'] = $validated['features'] ?? $this->getDefaultFeatures($validated['duration']);
        $validated['is_active'] = $validated['is_active'] ?? true;
        $validated['max_subtasks'] = $validated['max_subtasks'] ?? 3;
        $validated['has_ai_assistant'] = $request->has('has_ai_assistant') ? $request->boolean('has_ai_assistant') : false;
        $validated['ai_chat_limit'] = $validated['ai_chat_limit'] ?? 0;
        $validated['has_productivity_report'] = $request->has('has_productivity_report') ? $request->boolean('has_productivity_report') : false;
        $validated['has_auto_open_url'] = $request->has('has_auto_open_url') ? $request->boolean('has_auto_open_url') : false;
        $validated['has_quick_notes'] = $request->has('has_quick_notes') ? $request->boolean('has_quick_notes') : false;
        $validated['max_guild_members'] = $validated['max_guild_members'] ?? 10;
        $validated['has_ai_guild_features'] = $request->boolean('has_ai_guild_features');
        $validated['has_journal_access'] = $request->boolean('has_journal_access', true);
        $validated['has_learning_hub_access'] = $request->boolean('has_learning_hub_access', true);
        $validated['has_gamification_access'] = $request->boolean('has_gamification_access', true);
        $validated['has_ai_genius_access'] = $request->boolean('has_ai_genius_access', false);

        Plan::create($validated);

        return redirect()->back()->with('success', 'Plan berhasil ditambahkan.');
    }

    public function update(Request $request, Plan $plan)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:plans,name,' . $plan->id,
            'price' => 'required|integer|min:1000',
            'duration' => 'required|in:monthly,yearly',
            'description' => 'nullable|string|max:500',
            'features' => 'nullable|array',
            'is_active' => 'boolean',
            'max_subtasks' => 'nullable|integer|min:0',
            'has_ai_assistant' => 'boolean',
            'ai_chat_limit' => 'nullable|integer|min:-1',
            'has_productivity_report' => 'boolean',
            'has_auto_open_url' => 'boolean',
            'has_quick_notes' => 'boolean',
            'max_guild_members' => 'nullable|integer|min:0',
            'has_ai_guild_features' => 'boolean',
            'has_journal_access' => 'boolean',
            'has_learning_hub_access' => 'boolean',
            'has_gamification_access' => 'boolean',
        ]);

        $validated['has_ai_assistant'] = $request->boolean('has_ai_assistant');
        $validated['has_productivity_report'] = $request->boolean('has_productivity_report');
        $validated['has_auto_open_url'] = $request->boolean('has_auto_open_url');
        $validated['has_quick_notes'] = $request->boolean('has_quick_notes');
        $validated['has_ai_guild_features'] = $request->boolean('has_ai_guild_features');
        $validated['has_journal_access'] = $request->boolean('has_journal_access');
        $validated['has_learning_hub_access'] = $request->boolean('has_learning_hub_access');
        $validated['has_gamification_access'] = $request->boolean('has_gamification_access');
        $validated['has_ai_genius_access'] = $request->boolean('has_ai_genius_access');
        $validated['is_active'] = $request->boolean('is_active');

        $plan->update($validated);

        return redirect()->back()->with('success', 'Plan berhasil diperbarui.');
    }

    public function bulkUpdate(Request $request)
    {
        $request->validate([
            'plans' => 'required|array',
            'plans.*.id' => 'required|exists:plans,id',
            'plans.*.price' => 'required|integer|min:1000',
            'plans.*.duration' => 'required|in:monthly,yearly',
            'plans.*.is_active' => 'boolean',
        ]);

        DB::transaction(function () use ($request) {
            foreach ($request->plans as $planData) {
                Plan::where('id', $planData['id'])->update([
                    'price' => $planData['price'],
                    'duration' => $planData['duration'],
                    'is_active' => $planData['is_active'] ?? true,
                ]);
            }
        });

        return redirect()->back()->with('success', 'Plans berhasil diperbarui.');
    }

    public function toggleStatus(Plan $plan)
    {
        $plan->update([
            'is_active' => !$plan->is_active
        ]);

        $status = $plan->is_active ? 'diaktifkan' : 'dinonaktifkan';
        return redirect()->back()->with('success', "Plan berhasil $status.");
    }

    public function destroy(Plan $plan)
    {
        // Allow deletion for admin "fixing" purposes. 
        // We'll just delete it. If subscriptions exist, they will remain as orphan records 
        // linked by the 'plan' name string, which is fine for historical tracking.

        $plan->delete();

        return redirect()->back()->with('success', 'Plan berhasil dihapus.');
    }

    /**
     * Get default features based on plan duration
     */
    private function getDefaultFeatures($duration)
    {
        $baseFeatures = [
            'Akses refleksi AI tanpa batas',
            'Tracking emosi harian',
            'Rekomendasi pertumbuhan personal',
            'Laporan perkembangan mingguan'
        ];

        if ($duration === 'yearly') {
            $baseFeatures[] = 'Diskon 15% dari harga bulanan';
            $baseFeatures[] = 'Prioritas support';
        }

        return $baseFeatures;
    }
}