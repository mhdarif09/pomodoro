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
        ]);

        // Set default values untuk features jika tidak diisi
        $validated['features'] = $validated['features'] ?? $this->getDefaultFeatures($validated['duration']);
        $validated['is_active'] = $validated['is_active'] ?? true;
        $validated['max_subtasks'] = $validated['max_subtasks'] ?? 3;

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
        ]);

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
        // Cek apakah plan sedang digunakan di subscription
        if ($plan->subscriptions()->exists()) {
            return redirect()->back()->with('error', 'Tidak dapat menghapus plan yang sedang digunakan.');
        }

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