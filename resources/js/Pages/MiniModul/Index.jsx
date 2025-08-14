import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { MagnifyingGlassIcon, BookOpenIcon } from '@heroicons/react/24/outline';
import ModulCard from './Partials/ModulCard'; // Import komponen card

export default function Index({ auth, moduls, categories, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [categoryFilter, setCategoryFilter] = useState(filters.category_id || '');
    const [difficultyFilter, setDifficultyFilter] = useState(filters.difficulty || '');
    const [isFiltering, setIsFiltering] = useState(false);

    // Efek ini akan berjalan setiap kali filter berubah
    useEffect(() => {
        // Jangan jalankan saat pertama kali render
        if (isFiltering) {
            const delayDebounceFn = setTimeout(() => {
                applyFilters();
            }, 300); // Debounce untuk mencegah request berlebihan saat mengetik

            return () => clearTimeout(delayDebounceFn);
        } else {
            setIsFiltering(true);
        }
    }, [search, categoryFilter, difficultyFilter]);

    const applyFilters = () => {
        router.get(route('mini-moduls.index'), {
            search,
            category_id: categoryFilter,
            difficulty: difficultyFilter
        }, {
            preserveState: true,
            replace: true
        });
    };

    const handleCategoryClick = (categoryId) => {
        // Jika mengklik kategori yang sama, batalkan filter. Jika beda, set filter baru.
        setCategoryFilter(prevFilter => prevFilter == categoryId ? '' : categoryId);
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Mini Modul Pembelajaran" />

            <div className="bg-gray-50 dark:bg-gray-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
                    {/* Header */}
                    <header className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-3">
                            Jelajahi Modul Pembelajaran
                        </h1>
                        <p className="max-w-2xl mx-auto text-lg text-gray-500 dark:text-gray-400">
                            Tingkatkan pengetahuan Anda dengan koleksi modul interaktif kami.
                        </p>
                    </header>

                    {/* Filter Kategori */}
                    <nav className="flex justify-center flex-wrap gap-2 md:gap-3 mb-10">
                        <button
                            onClick={() => handleCategoryClick('')}
                            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-200
                                ${!categoryFilter
                                    ? 'bg-green-500 text-white shadow'
                                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }
                            `}
                        >
                            Semua
                        </button>
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                onClick={() => handleCategoryClick(category.id)}
                                className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-200 flex items-center gap-2
                                    ${categoryFilter == category.id
                                        ? 'bg-green-500 text-white shadow'
                                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }
                                `}
                            >
                                {category.icon && <span>{category.icon}</span>}
                                <span>{category.name}</span>
                            </button>
                        ))}
                    </nav>

                    {/* Search & Filter Lanjutan */}
                    <div className="max-w-2xl mx-auto mb-12">
                        <div className="relative">
                            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Cari berdasarkan judul atau deskripsi..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-full focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            />
                        </div>
                    </div>

                    {/* Moduls Grid */}
                    {moduls.data.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {moduls.data.map((modul) => (
                                <ModulCard key={modul.id} modul={modul} auth={auth} />
                            ))}
                        </div>
                    ) : (
                        // Empty State
                        <div className="text-center py-16">
                            <BookOpenIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">Modul Tidak Ditemukan</h3>
                            <p className="text-gray-500 dark:text-gray-400">
                                Coba ubah kata kunci pencarian atau filter kategori Anda.
                            </p>
                        </div>
                    )}
                    
                    {/* Pagination (jika diperlukan) */}
                    <div className="mt-12">
                        {/* Tambahkan komponen pagination di sini jika Anda membuatnya */}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}