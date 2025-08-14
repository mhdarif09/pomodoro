import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ChapterForm from './Partials/ChapterForm';

export default function Edit({ auth, modul, chapter }) {
    // Inisialisasi form dengan data chapter yang sudah ada
    const { data, setData, post, processing, errors } = useForm({
        ...chapter,
        _method: 'PUT', // Trik untuk update
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        // Kirim data ke route 'update'. Gunakan POST karena ada _method
        post(route('admin.mini-moduls.chapters.update', { miniModul: modul.id, chapter: chapter.id }));
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`Edit Chapter - ${chapter.title}`} />

            <div className="py-12">
                <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                             <h2 className="text-xl font-semibold mb-2">Edit Chapter untuk Modul:</h2>
                            <p className="text-lg text-blue-600 mb-6">{modul.title}</p>
                            
                             <ChapterForm 
                                data={data}
                                setData={setData}
                                errors={errors}
                                handleSubmit={handleSubmit}
                                processing={processing}
                                isEditing={true} // Beri tahu form ini mode edit
                            />

                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}