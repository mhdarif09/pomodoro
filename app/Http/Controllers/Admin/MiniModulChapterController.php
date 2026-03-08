<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MiniModul;
use App\Models\MiniModulChapter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class MiniModulChapterController extends Controller
{
    public function index(MiniModul $miniModul)
    {
        $chapters = $miniModul->chapters()->orderBy('chapter_number')->paginate(10);

        return Inertia::render('Admin/MiniModul/Chapters/Index', [
            'modul' => $miniModul->load('category'),
            'chapters' => $chapters
        ]);
    }

    public function create(MiniModul $miniModul)
    {
        $nextChapterNumber = $miniModul->chapters()->max('chapter_number') + 1;

        return Inertia::render('Admin/MiniModul/Chapters/Create', [
            'modul' => $miniModul->load('category'),
            'nextChapterNumber' => $nextChapterNumber
        ]);
    }

    public function store(Request $request, MiniModul $miniModul)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'content_type' => 'required|in:text,video,interactive,quiz',
            'media_files' => 'nullable|array',
            'media_files.*' => 'file|mimes:jpeg,png,jpg,gif,mp4,webm,pdf|max:10240',
            'ai_prompt' => 'nullable|string',
            'chapter_number' => 'required|integer|min:1',
            'estimated_duration' => 'required|integer|min:1',
            'is_published' => 'boolean'
        ]);

        $data = $request->all();
        $data['mini_modul_id'] = $miniModul->id;

        if ($request->hasFile('media_files')) {
            $mediaFiles = [];
            foreach ($request->file('media_files') as $file) {
                $path = $file->store('moduls/chapters/media', 'public');
                $mediaFiles[] = [
                    'name' => $file->getClientOriginalName(),
                    'path' => $path,
                    'type' => $file->getClientMimeType(),
                    'size' => $file->getSize()
                ];
            }
            $data['media_files'] = $mediaFiles;
        }

        MiniModulChapter::create($data);

        return redirect()->route('admin.mini-moduls.chapters.index', $miniModul)
            ->with('success', 'Chapter berhasil dibuat!');
    }

    public function show(MiniModul $miniModul, MiniModulChapter $chapter)
    {
        if ($chapter->mini_modul_id !== $miniModul->id) {
            abort(404);
        }

        return Inertia::render('Admin/MiniModul/Chapters/Show', [
            'modul' => $miniModul->load('category'),
            'chapter' => $chapter
        ]);
    }

    public function edit(MiniModul $miniModul, MiniModulChapter $chapter)
    {
        if ($chapter->mini_modul_id !== $miniModul->id) {
            abort(404);
        }

        return Inertia::render('Admin/MiniModul/Chapters/Edit', [
            'modul' => $miniModul->load('category'),
            'chapter' => $chapter
        ]);
    }

    public function update(Request $request, MiniModul $miniModul, MiniModulChapter $chapter)
    {
        if ($chapter->mini_modul_id !== $miniModul->id) {
            abort(404);
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'content_type' => 'required|in:text,video,interactive,quiz',
            'media_files' => 'nullable|array',
            'media_files.*' => 'file|mimes:jpeg,png,jpg,gif,mp4,webm,pdf|max:10240',
            'ai_prompt' => 'nullable|string',
            'chapter_number' => 'required|integer|min:1',
            'estimated_duration' => 'required|integer|min:1',
            'is_published' => 'boolean'
        ]);

        $data = $request->all();

        if ($request->hasFile('media_files')) {
            // Hapus file lama jika ada
            if ($chapter->media_files) {
                foreach ($chapter->media_files as $file) {
                    Storage::disk('public')->delete($file['path']);
                }
            }

            $mediaFiles = [];
            foreach ($request->file('media_files') as $file) {
                $path = $file->store('moduls/chapters/media', 'public');
                $mediaFiles[] = [
                    'name' => $file->getClientOriginalName(),
                    'path' => $path,
                    'type' => $file->getClientMimeType(),
                    'size' => $file->getSize()
                ];
            }
            $data['media_files'] = $mediaFiles;
        }

        $chapter->update($data);

        return redirect()->route('admin.mini-moduls.chapters.index', $miniModul)
            ->with('success', 'Chapter berhasil diperbarui!');
    }

    public function destroy(MiniModul $miniModul, MiniModulChapter $chapter)
    {
        if ($chapter->mini_modul_id !== $miniModul->id) {
            abort(404);
        }

        // Hapus media files
        if ($chapter->media_files) {
            foreach ($chapter->media_files as $file) {
                Storage::disk('public')->delete($file['path']);
            }
        }

        $chapter->delete();

        return back()->with('success', 'Chapter berhasil dihapus!');
    }

    public function reorder(Request $request, MiniModul $miniModul)
    {
        $request->validate([
            'chapters' => 'required|array',
            'chapters.*.id' => 'required|exists:mini_modul_chapters,id',
            'chapters.*.chapter_number' => 'required|integer|min:1'
        ]);

        foreach ($request->chapters as $chapterData) {
            MiniModulChapter::where('id', $chapterData['id'])
                ->update(['chapter_number' => $chapterData['chapter_number']]);
        }

        return back()->with('success', 'Urutan chapter berhasil diperbarui!');
    }
}