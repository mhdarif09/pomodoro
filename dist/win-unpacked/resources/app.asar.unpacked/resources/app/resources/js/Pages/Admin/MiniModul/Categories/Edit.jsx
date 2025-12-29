// resources/js/Pages/Admin/MiniModul/Categories/Edit.jsx

import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AdminLayout';
import CategoryForm from './Partials/CategoryForm';

export default function Edit({ auth, category }) {
    // Inisialisasi useForm dengan data kategori yang sudah ada.
    const { data, setData, put, processing, errors } = useForm({
        ...category
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        // Kirim data ke route 'update' dengan metode PUT.
        put(route('admin.mini-modul-categories.update', category.id));
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`Edit Kategori: ${category.name}`} />

            <div className="py-12">
                <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h2 className="text-xl font-semibold mb-6">Form Edit Kategori</h2>
                            
                             <CategoryForm 
                                data={data}
                                setData={setData}
                                errors={errors}
                                handleSubmit={handleSubmit}
                                processing={processing}
                                isEditing={true} // Beri tahu form bahwa ini mode edit
                            />

                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}