<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Http\Requests\StoreTaskRequest;
use App\Http\Requests\UpdateTaskRequest;
use App\Jobs\DetermineTaskPriority;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Redirect; // <-- Pastikan ini di-import

class TaskController extends Controller
{
    /**
     * Menyimpan tugas baru yang dibuat oleh user yang terotentikasi.
     */
    public function store(StoreTaskRequest $request)
    {
        $validated = $request->validated();
        $documentPath = null;
        
        if ($request->hasFile('document')) {
            $documentPath = $request->file('document')->store('documents', 'public');
        }

        // Otomatis mengisi `user_id` dari user yang sedang login
        $task = $request->user()->tasks()->create([
            'title' => $validated['title'],
            'description' => $validated['description'],
            'start_date' => $validated['start_date'],
            'due_date' => $validated['due_date'],
            'document_path' => $documentPath,
            'priority' => 'Sedang', 
        ]);

        DetermineTaskPriority::dispatch($task);

        // PERBAIKAN DI SINI: Gunakan Redirect::back()
        // Ini memberitahu Inertia untuk kembali ke halaman sebelumnya (Dashboard)
        // dan secara otomatis memuat ulang data (props) terbaru.
        return Redirect::back()->with('success', 'Tugas berhasil ditambahkan!');
    }

    /**
     * Memperbarui tugas yang ada.
     */
    public function update(UpdateTaskRequest $request, Task $task)
    {
        // Otorisasi dengan Policy untuk keamanan
        $this->authorize('update', $task);
        
        $validated = $request->validated();
        
        DB::transaction(function () use ($request, $validated, $task) {
            if ($request->hasFile('document')) {
                if ($task->document_path) {
                    Storage::disk('public')->delete($task->document_path);
                }
                $validated['document_path'] = $request->file('document')->store('documents', 'public');
            }
            $task->update($validated);
        });

        if ($task->wasChanged(['title', 'description', 'due_date'])) {
            DetermineTaskPriority::dispatch($task);
             // PERBAIKAN DI SINI: Gunakan Redirect::back()
             return Redirect::back()->with('success', 'Tugas diperbarui! Prioritas sedang disesuaikan ulang.');
        }
        
        // PERBAIKAN DI SINI: Gunakan Redirect::back()
        return Redirect::back()->with('success', 'Tugas berhasil diperbarui.');
    }
    
    /**
     * Menghapus tugas.
     */
    public function destroy(Task $task)
    {
        // Otorisasi dengan Policy untuk keamanan
        $this->authorize('delete', $task);

        DB::transaction(function () use ($task) {
            if ($task->document_path) {
                Storage::disk('public')->delete($task->document_path);
            }
            $task->delete();
        });

        // PERBAIKAN DI SINI: Gunakan Redirect::back()
        return Redirect::back()->with('success', 'Tugas berhasil dihapus.');
    }

     public function toggleComplete(Task $task)
    {
        // Gunakan Policy untuk memastikan hanya pemilik yang bisa mengubah
        $this->authorize('update', $task);

        // Ubah status boolean dan sync dengan status field
        $task->is_completed = !$task->is_completed;
        $task->status = $task->is_completed ? 'done' : 'todo';
        $task->save();

        // Kirim respons tanpa data, Inertia akan otomatis refresh
        return Redirect::back();
    }
}