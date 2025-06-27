<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PlanController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Plan/Index', [
            'plans' => Plan::all(),
        ]);
    }

    public function store(Request $request)
    {
       $validated = $request->validate([
    'name' => 'required|string|unique:plans,name',
    'price' => 'required|integer|min:1000',
    'duration' => 'required|in:monthly,yearly',
]);

Plan::create($validated);


        return redirect()->back()->with('success', 'Plan berhasil ditambahkan.');
    }

    public function update(Request $request)
    {
        foreach ($request->plans as $plan) {
           Plan::updateOrCreate(
    ['name' => $plan['name']],
    ['price' => $plan['price'], 'duration' => $plan['duration'] ?? 'monthly']
);
        }

        return redirect()->back()->with('success', 'Harga berhasil diperbarui.');
    }

    public function destroy(Plan $plan)
    {
        $plan->delete();

        return redirect()->back()->with('success', 'Plan berhasil dihapus.');
    }
}
