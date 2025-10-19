import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AdminLayout';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function Index({ auth, moduls, categories, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [categoryFilter, setCategoryFilter] = useState(filters.category_id || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('admin.mini-moduls.index'), {
            search,
            category_id: categoryFilter
        }, {
            preserveState: true,
            replace: true
        });
    };

    const handleDelete = (modul) => {
        if (confirm(`Yakin ingin menghapus modul "${modul.title}"?`)) {
            router.delete(route('admin.mini-moduls.destroy', modul.id));
        }
    };

    const getDifficultyBadge = (difficulty) => {
        const badges = {
            beginner: 'bg-green-100 text-green-800',
            intermediate: 'bg-yellow-100 text-yellow-800',
            advanced: 'bg-red-100 text-red-800'
        };
        const labels = {
            beginner: 'Pemula',
            intermediate: 'Menengah',
            advanced: 'Lanjutan'
        };
        return { class: badges[difficulty], label: labels[difficulty] };
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Kelola Mini Modul" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-semibold">Mini Modul</h2>
                                <div className="flex gap-2">
                                    <Link
                                        href={route('admin.mini-modul-categories.create')}
                                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded inline-flex items-center"
                                    >
                                        <PlusIcon className="w-4 h-4 mr-2" />
                                        Tambah Kategori
                                    </Link>
                                    <Link
                                        href={route('admin.mini-moduls.create')}
                                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded inline-flex items-center"
                                    >
                                        <PlusIcon className="w-4 h-4 mr-2" />
                                        Tambah Modul
                                    </Link>
                                </div>
                            </div>

                            {/* Search & Filter */}
                            <form onSubmit={handleSearch} className="mb-6 flex flex-col sm:flex-row gap-4">
                                <div className="flex-1">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Cari modul..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                        />
                                        <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                                    </div>
                                </div>
                                <select
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Semua Kategori</option>
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    type="submit"
                                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                                >
                                    Filter
                                </button>
                            </form>

                            {/* Moduls Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {moduls.data.map((modul) => {
                                    const difficultyBadge = getDifficultyBadge(modul.difficulty);
                                    
                                    return (
                                        <div key={modul.id} className="bg-white border rounded-lg shadow-sm overflow-hidden">
                                            {modul.thumbnail && (
                                                <img
                                                    src={`/storage/${modul.thumbnail}`}
                                                    alt={modul.title}
                                                    className="w-full h-48 object-cover"
                                                />
                                            )}
                                            
                                            <div className="p-6">
                                                <div className="flex items-start justify-between mb-2">
                                                    <h3 className="text-lg font-semibold line-clamp-2">{modul.title}</h3>
                                                    <span className={`px-2 py-1 rounded-full text-xs ${difficultyBadge.class}`}>
                                                        {difficultyBadge.label}
                                                    </span>
                                                </div>

                                                <p className="text-sm text-gray-600 mb-2">{modul.category.name}</p>
                                                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{modul.description}</p>

                                                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                                                    <span>{modul.chapters_count} chapter</span>
                                                    <span>{modul.estimated_duration} menit</span>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <span className={`px-2 py-1 rounded-full text-xs ${
                                                        modul.is_published 
                                                            ? 'bg-green-100 text-green-800' 
                                                            : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {modul.is_published ? 'Published' : 'Draft'}
                                                    </span>

                                                    <div className="flex space-x-2">
                                                        <Link
                                                            href={route('admin.mini-moduls.show', modul.id)}
                                                            className="text-blue-600 hover:text-blue-900"
                                                        >
                                                            <EyeIcon className="w-4 h-4" />
                                                        </Link>
                                                        <Link
                                                            href={route('admin.mini-moduls.edit', modul.id)}
                                                            className="text-yellow-600 hover:text-yellow-900"
                                                        >
                                                            <PencilIcon className="w-4 h-4" />
                                                        </Link>
                                                        <Link
                                                            href={route('admin.mini-moduls.chapters.index', modul.id)}
                                                            className="text-purple-600 hover:text-purple-900"
                                                            title="Kelola Chapter"
                                                        >
                                                            📚
                                                        </Link>
                                                        <Link
                                                            href={route('admin.mini-moduls.chapters.create', modul.id)}
                                                            className="text-green-600 hover:text-green-900"
                                                            title="Tambah Chapter"
                                                        >
                                                            ➕
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(modul)}
                                                            className="text-red-600 hover:text-red-900"
                                                        >
                                                            <TrashIcon className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Pagination */}
                            {moduls.links && (
                                <div className="mt-6">
                                    {/* Add pagination component here */}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
