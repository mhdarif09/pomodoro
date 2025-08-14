import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ModulForm from './Partials/ModulForm';

export default function Create({ auth, categories }) {
    // Inisialisasi state form dengan useForm dari Inertia
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        description: '',
        category_id: '',
        thumbnail: null,
        difficulty: 'beginner',
        estimated_duration: 10,
        is_published: false,
    });

    // Fungsi yang akan dijalankan saat form disubmit
    const handleSubmit = (e) => {
        e.preventDefault();
        // Kirim data ke route 'store' dengan metode POST
        post(route('admin.mini-moduls.store'));
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Tambah Modul Baru" />

            <div className="py-12">
                <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h2 className="text-xl font-semibold mb-6">Form Tambah Modul</h2>
                            
                            <ModulForm 
                                data={data}
                                setData={setData}
                                errors={errors}
                                categories={categories}
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