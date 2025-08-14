import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ChapterForm from './Partials/ChapterForm';

export default function Create({ auth, modul, nextChapterNumber }) {
    // Inisialisasi state form
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        content: '',
        content_type: 'text',
        ai_prompt: '',
        chapter_number: nextChapterNumber, // Diambil dari controller
        estimated_duration: 5,
        is_published: false,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        // Kirim data ke controller 'store'
        post(route('admin.mini-moduls.chapters.store', modul.id));
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Tambah Chapter Baru" />

            <div className="py-12">
                <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h2 className="text-xl font-semibold mb-2">Tambah Chapter untuk Modul:</h2>
                            <p className="text-lg text-blue-600 mb-6">{modul.title}</p>
                            
                            <ChapterForm 
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