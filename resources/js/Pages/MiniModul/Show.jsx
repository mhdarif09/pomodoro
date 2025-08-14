import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { ClockIcon, BookOpenIcon, PlayIcon } from '@heroicons/react/24/solid';
import ChapterListItem from './Partials/ChapterListItem';
import RelatedModulItem from './Partials/RelatedModulItem';

export default function Show({ auth, modul, userProgress, relatedModuls }) {
    
    // Helper function untuk styling tingkat kesulitan
    const getDifficultyInfo = (difficulty) => {
        const styles = {
            beginner:     'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
            intermediate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
            advanced:     'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
        };
        const labels = { beginner: 'Pemula', intermediate: 'Menengah', advanced: 'Lanjutan' };
        return { style: styles[difficulty], label: labels[difficulty] };
    };

    const difficulty = getDifficultyInfo(modul.difficulty);
    const hasProgress = auth.user && modul.progress_percentage !== undefined && modul.progress_percentage !== null;

    // Menentukan chapter selanjutnya untuk dipelajari
    const nextChapterToLearn = () => {
        if (!userProgress) return modul.published_chapters[0];
        // Cari chapter pertama yang belum selesai
        const firstUncompleted = modul.published_chapters.find(chapter => !userProgress[chapter.id]?.is_completed);
        // Jika semua sudah selesai, arahkan ke chapter pertama. Jika tidak, arahkan ke yang belum selesai.
        return firstUncompleted || modul.published_chapters[0];
    };
    
    const nextChapter = nextChapterToLearn();

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={modul.title} />

            <div className="bg-gray-50 dark:bg-gray-900">
                {/* Bagian Hero Section */}
                <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                            {modul.thumbnail && (
                                <div className="md:col-span-1">
                                    <img
                                        src={`/storage/${modul.thumbnail}`}
                                        alt={modul.title}
                                        className="w-full aspect-square object-cover rounded-xl shadow-lg"
                                    />
                                </div>
                            )}
                            <div className={`md:col-span-2 ${!modul.thumbnail ? 'md:col-span-3 text-center' : ''}`}>
                                <p className="text-base font-semibold text-green-600 dark:text-green-400 mb-2">{modul.category.name}</p>
                                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-4">
                                    {modul.title}
                                </h1>
                                <p className="text-lg text-gray-500 dark:text-gray-400 mb-6">
                                    {modul.description}
                                </p>
                                <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${difficulty.style}`}>
                                        {difficulty.label}
                                    </span>
                                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                                        <BookOpenIcon className="w-5 h-5 mr-2" />
                                        <span>{modul.published_chapters.length} Chapter</span>
                                    </div>
                                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                                        <ClockIcon className="w-5 h-5 mr-2" />
                                        <span>{modul.total_duration} menit total</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bagian Konten Utama */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
                        {/* Kolom Kiri: Daftar Chapter */}
                        <div className="lg:col-span-2">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Materi Pembelajaran</h2>
                            
                            {/* Tombol Aksi Utama (Mulai/Lanjutkan) */}
                            {nextChapter && (
                                <Link
                                    href={route('mini-moduls.chapter', { miniModul: modul.slug, chapter: nextChapter.slug })}
                                    className="mb-8 w-full flex items-center justify-center gap-3 bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-6 rounded-lg text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                                >
                                    <PlayIcon className="w-6 h-6" />
                                    <span>{hasProgress && modul.progress_percentage > 0 ? 'Lanjutkan Belajar' : 'Mulai Belajar'}</span>
                                </Link>
                            )}

                            <div className="space-y-4">
                                {modul.published_chapters.map((chapter, index) => (
                                    <ChapterListItem
                                        key={chapter.id}
                                        modulSlug={modul.slug}
                                        chapter={chapter}
                                        index={index}
                                        isCompleted={userProgress && userProgress[chapter.id]?.is_completed}
                                        isNextUp={chapter.id === nextChapter?.id}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Kolom Kanan: Sidebar */}
                        <aside className="lg:col-span-1">
                            <div className="sticky top-8 space-y-8">
                                {/* Progress Card */}
                                {hasProgress && (
                                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Progress Anda</h3>
                                        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-2">
                                            <span>Penyelesaian</span>
                                            <span className="font-bold">{modul.progress_percentage}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                            <div 
                                                className="bg-green-500 h-2.5 rounded-full transition-all duration-500" 
                                                style={{ width: `${modul.progress_percentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                )}

                                {/* Related Moduls Card */}
                                {relatedModuls.length > 0 && (
                                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Modul Terkait</h3>
                                        <div className="space-y-3">
                                            {relatedModuls.map((related) => (
                                                <RelatedModulItem key={related.id} modul={related} />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </aside>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}