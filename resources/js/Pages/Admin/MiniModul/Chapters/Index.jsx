import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AdminLayout';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import PrimaryButton from '@/Components/PrimaryButton';

export default function Index({ auth, modul, chapters }) {
    
    const handleDelete = (chapter) => {
        if (confirm(`Yakin ingin menghapus chapter "${chapter.title}"?`)) {
            // Kirim request DELETE ke route destroy chapter
            router.delete(route('admin.mini-moduls.chapters.destroy', { miniModul: modul.id, chapter: chapter.id }), {
                preserveScroll: true,
            });
        }
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`Kelola Chapter - ${modul.title}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="mb-4">
                        <Link 
                            href={route('admin.mini-moduls.index')}
                            className="inline-flex items-center px-4 py-2 bg-gray-200 border border-transparent rounded-md font-semibold text-xs text-gray-800 uppercase tracking-widest hover:bg-gray-300"
                        >
                            <ArrowLeftIcon className="w-4 h-4 mr-2" />
                            Kembali ke Daftar Modul
                        </Link>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h2 className="text-xl font-semibold">Kelola Chapter untuk Modul:</h2>
                                    <p className="text-lg text-blue-600">{modul.title}</p>
                                </div>
                                <Link href={route('admin.mini-moduls.chapters.create', modul.id)}>
                                    <PrimaryButton>
                                        <PlusIcon className="w-4 h-4 mr-2" />
                                        Tambah Chapter
                                    </PrimaryButton>
                                </Link>
                            </div>

                            {/* Tabel Daftar Chapter */}
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No.</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Judul Chapter</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipe</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durasi</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {chapters.data.length > 0 ? (
                                            chapters.data.map((chapter) => (
                                                <tr key={chapter.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap">{chapter.chapter_number}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{chapter.title}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{chapter.content_type}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{chapter.estimated_duration} mnt</td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                            chapter.is_published 
                                                                ? 'bg-green-100 text-green-800' 
                                                                : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                            {chapter.is_published ? 'Published' : 'Draft'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <div className="flex justify-end space-x-4">
                                                            <Link href={route('admin.mini-moduls.chapters.edit', { miniModul: modul.id, chapter: chapter.id })} className="text-yellow-600 hover:text-yellow-900">
                                                                <PencilIcon className="w-5 h-5" />
                                                            </Link>
                                                            <button onClick={() => handleDelete(chapter)} className="text-red-600 hover:text-red-900">
                                                                <TrashIcon className="w-5 h-5" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                                                    Belum ada chapter di modul ini.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            {/* Pagination
                            {chapters.links && (
                                <div className="mt-6">
                                    // Komponen pagination
                                </div>
                            )} */}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}