import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { MagnifyingGlassIcon, BookOpenIcon } from '@heroicons/react/24/outline';
import ModulCard from './Partials/ModulCard';
import { motion } from 'framer-motion';

export default function Index({ auth, moduls, categories, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [categoryFilter, setCategoryFilter] = useState(filters.category_id || '');
    const [isFiltering, setIsFiltering] = useState(false);

    useEffect(() => {
        if (isFiltering) {
            const delayDebounceFn = setTimeout(() => {
                applyFilters();
            }, 300);
            return () => clearTimeout(delayDebounceFn);
        } else {
            setIsFiltering(true);
        }
    }, [search, categoryFilter]);

    const applyFilters = () => {
        router.get(route('mini-moduls.index'), {
            search,
            category_id: categoryFilter
        }, {
            preserveState: true,
            replace: true
        });
    };

    const handleCategoryClick = (categoryId) => {
        setCategoryFilter(prevFilter => prevFilter == categoryId ? '' : categoryId);
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Learning Library" />

            {/* Scrollable Container */}
            <div className="h-full overflow-y-auto scrollbar-hide">
                <div className="pb-24 pt-6 px-4 sm:px-8 max-w-[1600px] mx-auto min-h-screen">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Learning Hub</p>
                            <h1 className="text-4xl md:text-5xl font-[900] text-slate-900 dark:text-white tracking-tighter leading-tight">
                                Jelajahi <span className="text-teal-500">Modul.</span>
                            </h1>
                        </motion.div>
                    </div>

                    {/* Sticky Search & Filter */}
                    <div className="sticky top-4 z-30 space-y-4 mb-10">
                        {/* Search Bar */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative group max-w-2xl"
                        >
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <MagnifyingGlassIcon className="h-5 w-5 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                            </div>
                            <input
                                type="text"
                                placeholder="Cari materi, topik, atau skill..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="block w-full pl-11 pr-4 py-3.5 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-none ring-1 ring-slate-200 dark:ring-slate-700 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-teal-500 shadow-lg shadow-slate-200/20 dark:shadow-black/20 transition-all"
                            />
                        </motion.div>

                        {/* Categories Pills */}
                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                            <button
                                onClick={() => handleCategoryClick('')}
                                className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 border
                                    ${!categoryFilter
                                        ? 'bg-slate-900 dark:bg-white text-white dark:text-black border-transparent shadow-md scale-105'
                                        : 'bg-white/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700'
                                    }`}
                            >
                                Semua
                            </button>
                            {categories.map((category) => (
                                <button
                                    key={category.id}
                                    onClick={() => handleCategoryClick(category.id)}
                                    className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 border flex items-center gap-2
                                        ${categoryFilter == category.id
                                            ? 'bg-slate-900 dark:bg-white text-white dark:text-black border-transparent shadow-md scale-105'
                                            : 'bg-white/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700'
                                        }`}
                                >
                                    <span>{category.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Moduls Grid */}
                    {moduls.data.length > 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                        >
                            {moduls.data.map((modul, i) => (
                                <motion.div
                                    key={modul.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05, type: 'spring', stiffness: 300, damping: 30 }}
                                >
                                    <ModulCard modul={modul} auth={auth} />
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-24 bg-white/50 dark:bg-slate-800/50 rounded-[2.5rem] border border-dashed border-slate-300 dark:border-slate-700">
                            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-6">
                                <BookOpenIcon className="w-10 h-10 text-slate-400" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Tidak Ditemukan</h3>
                            <p className="text-slate-500 dark:text-slate-400">Coba kata kunci lain atau ganti kategori.</p>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
