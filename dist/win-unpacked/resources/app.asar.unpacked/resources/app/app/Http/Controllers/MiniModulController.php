<?php

namespace App\Http\Controllers;

use App\Models\MiniModul;
use App\Models\MiniModulCategory;
use App\Models\MiniModulChapter;
use App\Models\UserModulProgress;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MiniModulController extends Controller
{
    /**
     * Menampilkan halaman utama daftar semua modul.
     */
    public function index(Request $request)
    {
        $query = MiniModul::with(['category', 'chapters'])
            ->published()
            ->withCount('chapters');

        if ($request->category_id) {
            $query->byCategory($request->category_id);
        }

        if ($request->search) {
            $query->search($request->search);
        }

        if ($request->difficulty) {
            $query->where('difficulty', $request->difficulty);
        }

        $moduls = $query->latest()->paginate(12);
        
        $isPremium = auth()->check() && auth()->user()->is_premium;

        $moduls->getCollection()->each(function ($modul, $index) use ($isPremium, $moduls) {
            // Index starts at 0 for the collection. 
            // Paginate(12) means for page 1, index 0-11.
            // Absolute index would be ($moduls->currentPage() - 1) * $moduls->perPage() + $index;
            $absoluteIndex = ($moduls->currentPage() - 1) * $moduls->perPage() + $index;
            
            $modul->is_locked = !$isPremium && $absoluteIndex >= 3;
            if (auth()->check()) {
                $modul->progress_percentage = $modul->progress_percentage;
            }
        });

        $categories = MiniModulCategory::active()
            ->withCount(['publishedModuls'])
            ->ordered()
            ->get();

        return Inertia::render('MiniModul/Index', [
            'moduls' => $moduls,
            'categories' => $categories,
            'filters' => $request->only(['category_id', 'search', 'difficulty'])
        ]);
    }

    /**
     * Menampilkan halaman detail sebuah modul.
     */
    public function show(MiniModul $miniModul)
    {
        if (!$miniModul->is_published) {
            abort(404);
        }

        // Premium Check: Find the index of this module in the published list
        if (!auth()->check() || !auth()->user()->is_premium) {
            $publishedIds = MiniModul::published()->latest()->pluck('id')->toArray();
            $index = array_search($miniModul->id, $publishedIds);
            
            if ($index !== false && $index >= 3) {
                // We'll pass a 'locked' flag instead of aborting, so the frontend can show the upgrade wall
                // Alternatively, we can let the frontend handle it if we pass the flag from index.
                // But for direct URL access, we need to check here.
                return Inertia::render('MiniModul/Show', [
                    'modul' => $miniModul,
                    'isLocked' => true,
                ]);
            }
        }

        $miniModul->load([
            'category',
            'publishedChapters' => function ($query) {
                $query->orderBy('chapter_number');
            }
        ]);

        $userProgress = null;
        if (auth()->check()) {
            $userProgress = UserModulProgress::where('user_id', auth()->id())
                ->where('mini_modul_id', $miniModul->id)
                ->with('chapter')
                ->get()
                ->keyBy('chapter_id');
        }

        return Inertia::render('MiniModul/Show', [
            'modul' => $miniModul,
            'userProgress' => $userProgress,
            'relatedModuls' => MiniModul::published()
                ->where('category_id', $miniModul->category_id)
                ->where('id', '!=', $miniModul->id)
                ->withCount('chapters')
                ->take(4)
                ->get()
        ]);
    }

    /**
     * Menampilkan halaman sebuah chapter spesifik.
     */
    public function chapter(MiniModul $miniModul, MiniModulChapter $chapter)
    {
        // 1. LOGIKA: Validasi Keamanan
        // Pastikan baik modul maupun chapter sudah dipublikasikan sebelum bisa diakses.
        if (!$miniModul->is_published || !$chapter->is_published) {
            abort(404);
        }

        if (!auth()->check() || !auth()->user()->is_premium) {
            $publishedIds = MiniModul::published()->latest()->pluck('id')->toArray();
            $index = array_search($miniModul->id, $publishedIds);
            
            if ($index !== false && $index >= 3) {
                return Inertia::render('MiniModul/Chapter', [
                    'modul' => $miniModul,
                    'chapter' => $chapter,
                    'isLocked' => true,
                ]);
            }
        }

        // 2. LOGIKA: Eager Loading (Perbaikan Inti)
        // Kita memuat relasi 'category' ke dalam objek $miniModul.
        // Ini memastikan bahwa saat kita mengirim $miniModul ke frontend,
        // properti 'category' akan tersedia.
        $miniModul->load('category');

        // Baris `$chapter->load(['miniModul.category']);` menjadi tidak perlu
        // karena kita sudah memuat data lengkap ke dalam $miniModul.

        // 3. LOGIKA: Mengelola Progress User
        // Jika user sudah login, cari progress-nya untuk chapter ini.
        // `firstOrCreate` adalah metode yang efisien: jika ada, ambil; jika tidak, buat baru.
        $userProgress = null;
        if (auth()->check()) {
            $userProgress = UserModulProgress::firstOrCreate(
                [
                    'user_id' => auth()->id(),
                    'mini_modul_id' => $miniModul->id,
                    'chapter_id' => $chapter->id
                ],
                [
                    'is_completed' => false,
                    'ai_discussions' => []
                ]
            );
        }

        // 4. LOGIKA: Membangun Navigasi Chapter
        // Ambil semua chapter yang sudah dipublikasikan dari modul ini untuk membuat navigasi "Sebelumnya" dan "Selanjutnya".
        $allChapters = $miniModul->publishedChapters()->orderBy('chapter_number')->get();
        $currentIndex = $allChapters->search(fn($c) => $c->id === $chapter->id);
        
        $navigation = [
            'prev' => $currentIndex > 0 ? $allChapters[$currentIndex - 1] : null,
            'next' => $currentIndex < $allChapters->count() - 1 ? $allChapters[$currentIndex + 1] : null,
            'current' => $currentIndex + 1,
            'total' => $allChapters->count()
        ];

        // 5. LOGIKA: Mengirim Data ke Frontend
        // Render komponen Inertia 'MiniModul/Chapter' dengan semua data yang dibutuhkan.
        return Inertia::render('MiniModul/Chapter', [
            'modul' => $miniModul, // Sekarang $miniModul sudah berisi data 'category'.
            'chapter' => $chapter,
            'userProgress' => $userProgress,
            'navigation' => $navigation,
            'allChapters' => $allChapters
        ]);
    }

    /**
     * Menandai sebuah chapter sebagai selesai.
     */
    public function completeChapter(Request $request, MiniModul $miniModul, MiniModulChapter $chapter)
    {
        if (!auth()->check()) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $progress = UserModulProgress::firstOrCreate(
            [
                'user_id' => auth()->id(),
                'mini_modul_id' => $miniModul->id,
                'chapter_id' => $chapter->id
            ]
        );

        if (!$progress->is_completed) {
            $progress->markAsCompleted(); // Asumsikan ada method ini di model UserModulProgress
        }

        return response()->json(['success' => true]);
    }
}