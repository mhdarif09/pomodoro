<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Promo;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PromoController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Promo/Index', [
            'promos' => Promo::orderByDesc('created_at')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|unique:promos,code|max:20',
            'discount_type' => 'required|in:percentage,fixed',
            'discount_value' => 'required|integer|min:1',
            'is_active' => 'boolean',
            'expires_at' => 'nullable|date',
            'usage_limit' => 'nullable|integer|min:1',
        ]);

        Promo::create($validated);

        return redirect()->back()->with('success', 'Promo berhasil dibuat.');
    }

    public function update(Request $request, Promo $promo)
    {
        $validated = $request->validate([
            'code' => 'required|string|unique:promos,code,' . $promo->id . '|max:20',
            'discount_type' => 'required|in:percentage,fixed',
            'discount_value' => 'required|integer|min:1',
            'is_active' => 'boolean',
            'expires_at' => 'nullable|date',
            'usage_limit' => 'nullable|integer|min:1',
        ]);

        $promo->update($validated);

        return redirect()->back()->with('success', 'Promo berhasil diperbarui.');
    }

    public function destroy(Promo $promo)
    {
        $promo->delete();
        return redirect()->back()->with('success', 'Promo berhasil dihapus.');
    }

    public function toggleStatus(Promo $promo)
    {
        $promo->update(['is_active' => !$promo->is_active]);
        return redirect()->back()->with('success', 'Status promo berhasil diubah.');
    }
}
