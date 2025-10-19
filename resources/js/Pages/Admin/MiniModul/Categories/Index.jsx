import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AdminLayout';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';

export default function Index({ auth, categories }) {
    const handleDelete = (category) => {
        if (confirm(`Yakin ingin menghapus kategori "${category.name}"?`)) {
            router.delete(route('admin.mini-modul-categories.destroy', category.id));
        }
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Kelola Kategori Mini Modul" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-semibold">Kategori Mini Modul</h2>
                                <Link
                                    href={route('admin.mini-modul-categories.create')}
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded inline-flex items-center"
                                >
                                    <PlusIcon className="w-4 h-4 mr-2" />
                                    Tambah Kategori
                                </Link>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {categories.data.map((category) => (
                                    <div key={category.id} className="bg-white border rounded-lg shadow-sm p-6">
                                        <div className="flex items-center mb-4">
                                            {category.icon && (
                                                <span className="text-2xl mr-3">{category.icon}</span>
                                            )}
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold">{category.name}</h3>
                                                <p className="text-sm text-gray-600">{category.mini_moduls_count} modul</p>
                                            </div>
                                            <div 
                                                className="w-4 h-4 rounded-full"
                                                style={{ backgroundColor: category.color }}
                                            ></div>
                                        </div>

                                        {category.description && (
                                            <p className="text-gray-600 text-sm mb-4">{category.description}</p>
                                        )}

                                        <div className="flex items-center justify-between">
                                            <span className={`px-2 py-1 rounded-full text-xs ${
                                                category.is_active 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {category.is_active ? 'Aktif' : 'Nonaktif'}
                                            </span>

                                            <div className="flex space-x-2">
                                                <Link
                                                    href={route('admin.mini-modul-categories.show', category.id)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    <EyeIcon className="w-4 h-4" />
                                                </Link>
                                                <Link
                                                    href={route('admin.mini-modul-categories.edit', category.id)}
                                                    className="text-yellow-600 hover:text-yellow-900"
                                                >
                                                    <PencilIcon className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(category)}
                                                    className="text-red-600 hover:text-red-900"
                                                    disabled={category.mini_moduls_count > 0}
                                                >
                                                    <TrashIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
