import { useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import TagSelector from './TagSelector';
import NotionEditor from './NotionEditor';

export default function TaskForm({ existingTask, onCancel }) {
    const isEditing = !!existingTask;

    const { data, setData, post, processing, errors } = useForm({
        _method: isEditing ? 'PUT' : 'POST',
        title: existingTask?.title || '',
        description: existingTask?.description || '',
        start_date: existingTask?.start_date || new Date().toISOString().split('T')[0],
        due_date: existingTask?.due_date || '',
        document: null,
        notes: existingTask?.notes || '',
        tags: existingTask?.tags?.map(t => t.id) || [],
        priority: existingTask?.priority || 'Sedang',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        const url = isEditing ? route('tasks.update', existingTask.id) : route('tasks.store');

        const dataToSubmit = isEditing ? { ...data, _method: 'PUT' } : data;

        post(url, {
            data: dataToSubmit,
            onSuccess: () => onCancel(),
            preserveScroll: true,
            forceFormData: true, // Pastikan ini ada untuk file upload saat update
        });
    };

    const inputStyle = "w-full bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 text-sm p-2";
    const labelStyle = "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1";

    return (
        <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 mb-4"
        >
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
                <div>
                    <label htmlFor="title" className={labelStyle}>Judul Tugas</label>
                    <input type="text" id="title" value={data.title} onChange={e => setData('title', e.target.value)} className={inputStyle} placeholder="Contoh: Selesaikan desain halaman utama" />
                    {errors.title && <p className="text-rose-500 text-xs mt-1">{errors.title}</p>}
                </div>

                <div>
                    <label className={labelStyle}>Prioritas</label>
                    <div className="flex gap-2">
                        {['Rendah', 'Sedang', 'Tinggi'].map(p => (
                            <button
                                key={p}
                                type="button"
                                onClick={() => setData('priority', p)}
                                className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border transition-all ${data.priority === p
                                    ? p === 'Tinggi' ? 'bg-red-500 border-red-500 text-white shadow-red-500/20 shadow-lg'
                                        : p === 'Sedang' ? 'bg-amber-500 border-amber-500 text-white shadow-amber-500/20 shadow-lg'
                                            : 'bg-blue-500 border-blue-500 text-white shadow-blue-500/20 shadow-lg'
                                    : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-500 hover:border-slate-400'
                                    }`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className={labelStyle}>Tags / Label</label>
                    <TagSelector
                        selectedTags={data.tags}
                        onTagsChange={tags => setData('tags', tags)}
                    />
                </div>

                <div>
                    <label className={labelStyle}>Catatan</label>
                    <NotionEditor
                        content={data.notes}
                        onChange={html => setData('notes', html)}
                    />
                </div>

                <div>
                    <label htmlFor="description" className={labelStyle}>Deskripsi Singkat (Opsional)</label>
                    <textarea id="description" value={data.description} onChange={e => setData('description', e.target.value)} className={inputStyle} rows="2"></textarea>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="start_date" className={labelStyle}>Tanggal Mulai</label>
                        <input type="date" id="start_date" value={data.start_date} onChange={e => setData('start_date', e.target.value)} className={inputStyle} />
                        {errors.start_date && <p className="text-rose-500 text-xs mt-1">{errors.start_date}</p>}
                    </div>
                    <div>
                        <label htmlFor="due_date" className={labelStyle}>Tenggat Waktu</label>
                        <input type="date" id="due_date" value={data.due_date} onChange={e => setData('due_date', e.target.value)} className={inputStyle} />
                        {errors.due_date && <p className="text-rose-500 text-xs mt-1">{errors.due_date}</p>}
                    </div>
                </div>

                <div>
                    <label htmlFor="document" className={labelStyle}>Dokumen Pendukung (Maks 2MB)</label>
                    <input type="file" onChange={e => setData('document', e.target.files[0])} className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 dark:file:bg-teal-700 dark:file:text-teal-200" />
                    {errors.document && <p className="text-rose-500 text-xs mt-1">{errors.document}</p>}
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                    <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-600 hover:bg-slate-200 rounded-md">Batal</button>
                    <button type="submit" disabled={processing} className="px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-md disabled:bg-teal-400 dark:disabled:bg-teal-500/50">
                        {processing ? 'Memproses...' : (isEditing ? 'Simpan Perubahan' : 'Buat Tugas')}
                    </button>
                </div>
            </form>
        </motion.div>
    );
}