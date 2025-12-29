import React from 'react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import TextArea from '@/Components/TextArea';
import Checkbox from '@/Components/Checkbox';

export default function CategoryForm({ data, setData, errors, handleSubmit, processing, isEditing = false }) {
    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nama Kategori */}
            <div>
                <InputLabel htmlFor="name" value="Nama Kategori" />
                <TextInput
                    id="name"
                    type="text"
                    name="name"
                    value={data.name}
                    className="mt-1 block w-full"
                    onChange={(e) => setData('name', e.target.value)}
                    required
                />
                <InputError message={errors.name} className="mt-2" />
            </div>

            {/* Deskripsi */}
            <div>
                <InputLabel htmlFor="description" value="Deskripsi (Opsional)" />
                <TextArea
                    id="description"
                    name="description"
                    value={data.description}
                    className="mt-1 block w-full"
                    onChange={(e) => setData('description', e.target.value)}
                />
                <InputError message={errors.description} className="mt-2" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Ikon (Emoji) */}
                <div>
                    <InputLabel htmlFor="icon" value="Ikon (Emoji)" />
                    <TextInput
                        id="icon"
                        type="text"
                        name="icon"
                        value={data.icon}
                        className="mt-1 block w-full"
                        maxLength="2"
                        placeholder="Contoh: 🚀"
                        onChange={(e) => setData('icon', e.target.value)}
                    />
                    <InputError message={errors.icon} className="mt-2" />
                </div>
                
                {/* Warna */}
                <div>
                    <InputLabel htmlFor="color" value="Warna Label" />
                    <input
                        id="color"
                        type="color"
                        name="color"
                        value={data.color}
                        className="mt-1 block w-full h-10 px-1 border border-gray-300 rounded-md"
                        onChange={(e) => setData('color', e.target.value)}
                    />
                    <InputError message={errors.color} className="mt-2" />
                </div>
                
                {/* Urutan */}
                <div>
                    <InputLabel htmlFor="sort_order" value="Nomor Urut" />
                    <TextInput
                        id="sort_order"
                        type="number"
                        name="sort_order"
                        value={data.sort_order}
                        className="mt-1 block w-full"
                        onChange={(e) => setData('sort_order', e.target.value)}
                    />
                    <InputError message={errors.sort_order} className="mt-2" />
                </div>
            </div>

            {/* Status Aktif */}
            <div className="flex items-center gap-4">
                 <Checkbox
                    id="is_active"
                    name="is_active"
                    checked={data.is_active}
                    onChange={(e) => setData('is_active', e.target.checked)}
                />
                <InputLabel htmlFor="is_active" value="Aktifkan Kategori ini?" />
                <InputError message={errors.is_active} className="mt-2" />
            </div>

            <div className="flex items-center gap-4">
                <PrimaryButton disabled={processing}>
                    {isEditing ? 'Update Kategori' : 'Simpan Kategori'}
                </PrimaryButton>
            </div>
        </form>
    );
}