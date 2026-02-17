import React from 'react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SelectInput from '@/Components/SelectInput';
import Checkbox from '@/Components/Checkbox';
import ReactQuill from 'react-quill';
import "quill/dist/quill.snow.css";

export default function ChapterForm({ data, setData, errors, handleSubmit, processing, isEditing = false }) {
    
    const contentTypeOptions = [
        { value: 'text', label: 'Teks / Artikel' },
        { value: 'video', label: 'Video' },
        { value: 'interactive', label: 'Interaktif (AI)' },
        { value: 'quiz', label: 'Kuis' },
    ];

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Judul */}
                <div className="md:col-span-2">
                    <InputLabel htmlFor="title" value="Judul Chapter" />
                    <TextInput
                        id="title"
                        type="text"
                        name="title"
                        value={data.title}
                        className="mt-1 block w-full"
                        onChange={(e) => setData('title', e.target.value)}
                        required
                    />
                    <InputError message={errors.title} className="mt-2" />
                </div>

                {/* Nomor Chapter */}
                <div>
                    <InputLabel htmlFor="chapter_number" value="Nomor Urut Chapter" />
                    <TextInput
                        id="chapter_number"
                        type="number"
                        name="chapter_number"
                        value={data.chapter_number}
                        className="mt-1 block w-full bg-gray-100"
                        onChange={(e) => setData('chapter_number', e.target.value)}
                        required
                        readOnly={isEditing}
                    />
                    <InputError message={errors.chapter_number} className="mt-2" />
                </div>
            </div>

            {/* Konten */}
            <div>
                <InputLabel htmlFor="content" value="Konten Chapter" />
                <ReactQuill
                    theme="snow"
                    value={data.content}
                    onChange={(value) => setData('content', value)}
                    className="bg-white"
                />
                <InputError message={errors.content} className="mt-2" />
                <p className="text-xs text-gray-500 mt-1">
                    Anda bisa menambahkan teks, gambar, atau embed video langsung di sini.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Tipe Konten */}
                <div>
                    <InputLabel htmlFor="content_type" value="Tipe Konten" />
                    <SelectInput
                        id="content_type"
                        name="content_type"
                        value={data.content_type}
                        className="mt-1 block w-full"
                        onChange={(e) => setData('content_type', e.target.value)}
                    >
                        {contentTypeOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </SelectInput>
                    <InputError message={errors.content_type} className="mt-2" />
                </div>

                {/* Estimasi Durasi */}
                <div>
                    <InputLabel htmlFor="estimated_duration" value="Estimasi Durasi (menit)" />
                    <TextInput
                        id="estimated_duration"
                        type="number"
                        name="estimated_duration"
                        value={data.estimated_duration}
                        className="mt-1 block w-full"
                        onChange={(e) => setData('estimated_duration', e.target.value)}
                        required
                    />
                    <InputError message={errors.estimated_duration} className="mt-2" />
                </div>
            </div>

            {/* AI Prompt */}
            <div>
                <InputLabel htmlFor="ai_prompt" value="Prompt untuk Diskusi AI (Opsional)" />
                <textarea
                    id="ai_prompt"
                    name="ai_prompt"
                    value={data.ai_prompt}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                    placeholder="Contoh: Fokus pada penjelasan praktis tentang cara kerja fotosintesis."
                    onChange={(e) => setData('ai_prompt', e.target.value)}
                />
                <InputError message={errors.ai_prompt} className="mt-2" />
            </div>

            {/* Status Publikasi */}
            <div className="flex items-center gap-4">
                <Checkbox
                    id="is_published"
                    name="is_published"
                    checked={data.is_published}
                    onChange={(e) => setData('is_published', e.target.checked)}
                />
                <InputLabel htmlFor="is_published" value="Publikasikan Chapter?" />
                <InputError message={errors.is_published} className="mt-2" />
            </div>

            {/* Tombol */}
            <div className="flex items-center gap-4">
                <PrimaryButton disabled={processing}>
                    {isEditing ? 'Update Chapter' : 'Simpan Chapter'}
                </PrimaryButton>
            </div>
        </form>
    );
}
