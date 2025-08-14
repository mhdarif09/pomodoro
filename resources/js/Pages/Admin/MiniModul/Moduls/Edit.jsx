import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ModulForm from './Partials/ModulForm';

export default function Edit({ auth, modul, categories }) {
    // Inisialisasi useForm dengan data modul yang ada.
    // Penting: Inertia tidak bisa mengirim file dengan metode PUT/PATCH, jadi kita gunakan POST
    // dan tambahkan field _method: 'PUT'
    const { data, setData, post, processing, errors } = useForm({
        ...modul,
        _method: 'PUT', // Trik untuk mengirim file saat update
        thumbnail: null, // Reset thumbnail agar tidak mengirim string path
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        // Kirim data ke route 'update'. Karena ada file, kita harus gunakan POST.
        // Laravel akan membaca field `_method: 'PUT'` dan mengarahkannya ke metode update.
        post(route('admin.mini-moduls.update', modul.id), {
            // Force Inertia untuk melakukan visit penuh agar state form ter-reset jika perlu
            forceFormData: true, 
        });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`Edit Modul: ${modul.title}`} />

            <div className="py-12">
                <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h2 className="text-xl font-semibold mb-6">Form Edit Modul</h2>
                            
                             <ModulForm 
                                data={data}
                                setData={setData}
                                errors={errors}
                                categories={categories}
                                handleSubmit={handleSubmit}
                                processing={processing}
                                isEditing={true} // Beri tahu form bahwa ini adalah mode edit
                            />

                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}