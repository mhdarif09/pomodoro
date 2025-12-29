import React from 'react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import TextArea from '@/Components/TextArea';
import SelectInput from '@/Components/SelectInput';
import Checkbox from '@/Components/Checkbox';

export default function ModulForm({ data, setData, errors, categories, handleSubmit, processing, isEditing = false }) {
    
    // Untuk menampilkan preview gambar yang diupload
    const [thumbnailPreview, setThumbnailPreview] = React.useState(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('thumbnail', file);
            setThumbnailPreview(URL.createObjectURL(file));
        }
    };

    const difficultyOptions = [
        { value: 'beginner', label: 'Pemula' },
        { value: 'intermediate', label: 'Menengah' },
        { value: 'advanced', label: 'Lanjutan' },
    ];
    
    // Jika sedang mode edit dan ada thumbnail, tampilkan thumbnail lama
    const existingThumbnail = isEditing && data.thumbnail && typeof data.thumbnail === 'string' 
        ? `/storage/${data.thumbnail}` 
        : null;

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Kategori */}
            <div>
                <InputLabel htmlFor="category_id" value="Kategori" />
                <SelectInput
                    id="category_id"
                    name="category_id"
                    value={data.category_id}
                    className="mt-1 block w-full"
                    onChange={(e) => setData('category_id', e.target.value)}
                    required
                >
                    <option value="">Pilih Kategori</option>
                    {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                            {category.name}
                        </option>
                    ))}
                </SelectInput>
                <InputError message={errors.category_id} className="mt-2" />
            </div>

            {/* Judul */}
            <div>
                <InputLabel htmlFor="title" value="Judul Modul" />
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

            {/* Deskripsi */}
            <div>
                <InputLabel htmlFor="description" value="Deskripsi Singkat" />
                <TextArea
                    id="description"
                    name="description"
                    value={data.description}
                    className="mt-1 block w-full"
                    onChange={(e) => setData('description', e.target.value)}
                    required
                />
                <InputError message={errors.description} className="mt-2" />
            </div>

            {/* Thumbnail */}
            <div>
                <InputLabel htmlFor="thumbnail" value="Thumbnail" />
                <input
                    id="thumbnail"
                    type="file"
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    onChange={handleFileChange}
                />
                {/* Tampilkan preview */}
                {(thumbnailPreview || existingThumbnail) && (
                    <div className="mt-4">
                        <img src={thumbnailPreview || existingThumbnail} alt="Preview" className="w-48 h-auto rounded-lg" />
                    </div>
                )}
                <InputError message={errors.thumbnail} className="mt-2" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Tingkat Kesulitan */}
                <div>
                    <InputLabel htmlFor="difficulty" value="Tingkat Kesulitan" />
                    <SelectInput
                        id="difficulty"
                        name="difficulty"
                        value={data.difficulty}
                        className="mt-1 block w-full"
                        onChange={(e) => setData('difficulty', e.target.value)}
                        required
                    >
                         {difficultyOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </SelectInput>
                    <InputError message={errors.difficulty} className="mt-2" />
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

            {/* Status Publikasi */}
            <div className="flex items-center gap-4">
                 <Checkbox
                    id="is_published"
                    name="is_published"
                    checked={data.is_published}
                    onChange={(e) => setData('is_published', e.target.checked)}
                />
                <InputLabel htmlFor="is_published" value="Publikasikan Modul?" />
                <InputError message={errors.is_published} className="mt-2" />
            </div>

            <div className="flex items-center gap-4">
                <PrimaryButton disabled={processing}>
                    {isEditing ? 'Update Modul' : 'Simpan Modul'}
                </PrimaryButton>
            </div>
        </form>
    );
}