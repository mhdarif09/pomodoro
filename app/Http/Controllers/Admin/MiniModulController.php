<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MiniModul;
use App\Models\MiniModulCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class MiniModulController extends Controller
{
    public function index(Request $request)
    {
        $query = MiniModul::with(['category', 'chapters'])
            ->withCount('chapters');

        if ($request->category_id) {
            $query->byCategory($request->category_id);
        }

        if ($request->search) {
            $query->search($request->search);
        }

        $moduls = $query->latest()->paginate(10);
        $categories = MiniModulCategory::active()->ordered()->get();

        return Inertia::render('Admin/MiniModul/Moduls/Index', [
            'moduls' => $moduls,
            'categories' => $categories,
            'filters' => $request->only(['category_id', 'search'])
        ]);
    }

    public function create()
    {
        $categories = MiniModulCategory::active()->ordered()->get();

        return Inertia::render('Admin/MiniModul/Moduls/Create', [
            'categories' => $categories
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'category_id' => 'required|exists:mini_modul_categories,id',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'thumbnail' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'difficulty' => 'required|in:beginner,intermediate,advanced',
            'estimated_duration' => 'required|integer|min:1',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
            'sort_order' => 'nullable|integer',
            'is_published' => 'boolean'
        ]);

        $data = $request->all();

        if ($request->hasFile('thumbnail')) {
            $data['thumbnail'] = $request->file('thumbnail')->store('moduls/thumbnails', 'public');
        }

        MiniModul::create($data);

        return redirect()->route('admin.mini-moduls.index')
            ->with('success', 'Modul berhasil dibuat!');
    }

    public function show(MiniModul $miniModul)
    {
        $miniModul->load(['category', 'chapters' => function ($query) {
            $query->orderBy('chapter_number');
        }]);

        return Inertia::render('Admin/MiniModul/Moduls/Show', [
            'modul' => $miniModul
        ]);
    }

    public function edit(MiniModul $miniModul)
    {
        $categories = MiniModulCategory::active()->ordered()->get();

        return Inertia::render('Admin/MiniModul/Moduls/Edit', [
            'modul' => $miniModul,
            'categories' => $categories
        ]);
    }

    public function update(Request $request, MiniModul $miniModul)
    {
        $request->validate([
            'category_id' => 'required|exists:mini_modul_categories,id',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'thumbnail' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'difficulty' => 'required|in:beginner,intermediate,advanced',
            'estimated_duration' => 'required|integer|min:1',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
            'sort_order' => 'nullable|integer',
            'is_published' => 'boolean'
        ]);

        $data = $request->all();

        if ($request->hasFile('thumbnail')) {
            if ($miniModul->thumbnail) {
                Storage::disk('public')->delete($miniModul->thumbnail);
            }
            $data['thumbnail'] = $request->file('thumbnail')->store('moduls/thumbnails', 'public');
        }

        $miniModul->update($data);

        return redirect()->route('admin.mini-moduls.index')
            ->with('success', 'Modul berhasil diperbarui!');
    }

    public function destroy(MiniModul $miniModul)
    {
        if ($miniModul->thumbnail) {
            Storage::disk('public')->delete($miniModul->thumbnail);
        }

        $miniModul->delete();

        return back()->with('success', 'Modul berhasil dihapus!');
    }
}