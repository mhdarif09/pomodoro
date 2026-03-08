<?php
// app/Http/Controllers/Admin/MiniModulCategoryController.php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MiniModulCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MiniModulCategoryController extends Controller
{
    public function index()
    {
        $categories = MiniModulCategory::with('miniModuls')
            ->withCount('miniModuls')
            ->ordered()
            ->paginate(10);

        return Inertia::render('Admin/MiniModul/Categories/Index', [
            'categories' => $categories
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/MiniModul/Categories/Create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'icon' => 'nullable|string|max:255',
            'color' => 'nullable|string|max:7',
            'sort_order' => 'nullable|integer',
            'is_active' => 'boolean'
        ]);

        MiniModulCategory::create($request->all());

        return redirect()->route('admin.mini-modul-categories.index')
            ->with('success', 'Kategori berhasil dibuat!');
    }

    public function show(MiniModulCategory $miniModulCategory)
    {
        $miniModulCategory->load(['miniModuls' => function ($query) {
            $query->withCount('chapters')->ordered();
        }]);

        return Inertia::render('Admin/MiniModul/Categories/Show', [
            'category' => $miniModulCategory
        ]);
    }

    public function edit(MiniModulCategory $miniModulCategory)
    {
        return Inertia::render('Admin/MiniModul/Categories/Edit', [
            'category' => $miniModulCategory
        ]);
    }

    public function update(Request $request, MiniModulCategory $miniModulCategory)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'icon' => 'nullable|string|max:255',
            'color' => 'nullable|string|max:7',
            'sort_order' => 'nullable|integer',
            'is_active' => 'boolean'
        ]);

        $miniModulCategory->update($request->all());

        return redirect()->route('admin.mini-modul-categories.index')
            ->with('success', 'Kategori berhasil diperbarui!');
    }

    public function destroy(MiniModulCategory $miniModulCategory)
    {
        if ($miniModulCategory->miniModuls()->count() > 0) {
            return back()->with('error', 'Tidak dapat menghapus kategori yang masih memiliki modul!');
        }

        $miniModulCategory->delete();

        return back()->with('success', 'Kategori berhasil dihapus!');
    }
}