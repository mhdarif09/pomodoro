// resources/js/Pages/Admin/MiniModul/Categories/Create.jsx

import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AdminLayout';
import CategoryForm from './Partials/CategoryForm';

export default function Create({ auth }) {
    // Inisialisasi state form dengan `useForm` dari Inertia
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        icon: '📚', // Default ikon
        color: '#4A90E2', // Default warna biru
        sort_order: 0,
        is_active: true, // Defaultnya langsung aktif
    });

    // Fungsi yang dijalankan saat form disubmit
    const handleSubmit = (e) => {
        e.preventDefault();
        // Kirim data ke route `store` dengan metode POST
        post(route('admin.mini-modul-categories.store'));
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Tambah Kategori Baru" />

            <div className="py-12">
                <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h2 className="text-xl font-semibold mb-6">Form Tambah Kategori</h2>
                            
                            <CategoryForm 
                                data={data}
                                setData={setData}
                                errors={errors}
                                handleSubmit={handleSubmit}
                                processing={processing}
                            />

                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}