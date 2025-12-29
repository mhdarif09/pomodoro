import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { ClockIcon, BookOpenIcon, PlayIcon, ShareIcon, XMarkIcon, LockClosedIcon, CheckCircleIcon } from '@heroicons/react/24/solid';
import { LinkIcon, CheckIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import ChapterListItem from './Partials/ChapterListItem';
import RelatedModulItem from './Partials/RelatedModulItem';

const ShareModal = ({ isOpen, onClose, modul, currentUrl }) => {
    const [copied, setCopied] = useState(false);
    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(currentUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) { console.error(err); }
    };
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-md" onClick={onClose} />
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="w-full max-w-md bg-white dark:bg-[#1C1C1E] rounded-[2rem] shadow-2xl p-6 relative z-10 border border-white/10"
            >
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Bagikan Modul</h3>
                    <button onClick={onClose} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 transition-colors"><XMarkIcon className="w-5 h-5 text-slate-600 dark:text-slate-300" /></button>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl mb-6 flex gap-3 items-center">
                    <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center text-teal-600">
                        <BookOpenIcon className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm truncate text-slate-900 dark:text-white">{modul.title}</h4>
                        <p className="text-xs text-slate-500">{modul.category.name}</p>
                    </div>
                </div>

                <div className="space-y-3">
                    <button onClick={copyToClipboard} className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group">
                        <span className="text-sm font-semibold text-slate-600 dark:text-slate-300 truncate pr-4">{currentUrl}</span>
                        <div className={`p-2 rounded-lg ${copied ? 'bg-green-500 text-white' : 'bg-white dark:bg-slate-600 text-slate-500'}`}>
                            {copied ? <CheckIcon className="w-4 h-4" /> : <LinkIcon className="w-4 h-4" />}
                        </div>
                    </button>
                    <a
                        href={`https://wa.me/?text=Belajar ${modul.title} disini: ${currentUrl}`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full flex items-center justify-center gap-2 p-4 bg-[#25D366] text-white font-bold rounded-2xl hover:opacity-90 transition-opacity"
                    >
                        Share ke WhatsApp
                    </a>
                </div>
            </motion.div>
        </div>
    );
};

export default function Show({ auth, modul, userProgress, relatedModuls, isLocked }) {
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);

    const getDifficultyInfo = (difficulty) => {
        const styles = {
            beginner: 'bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-300',
            intermediate: 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300',
            advanced: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300',
        };
        return { style: styles[difficulty] || styles.beginner, label: (difficulty || 'Beginner').charAt(0).toUpperCase() + (difficulty || 'Beginner').slice(1) };
    };

    const difficulty = getDifficultyInfo(modul.difficulty);
    const hasProgress = auth.user && modul.progress_percentage > 0;

    const nextChapterToLearn = () => {
        if (!userProgress) return modul.published_chapters[0];
        const firstUncompleted = modul.published_chapters.find((ch) => !userProgress[ch.id]?.is_completed);
        return firstUncompleted || modul.published_chapters[0];
    };
    const nextChapter = nextChapterToLearn();

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={modul.title} />
            <AnimatePresence>
                {isShareModalOpen && (
                    <ShareModal
                        isOpen={isShareModalOpen}
                        onClose={() => setIsShareModalOpen(false)}
                        modul={modul}
                        currentUrl={typeof window !== 'undefined' ? window.location.href : ''}
                    />
                )}
            </AnimatePresence>

            {/* Container Scrollable - Fix for desktop clipping */}
            <div className="h-full overflow-y-auto scrollbar-hide">
                <div className="w-full min-h-screen pb-20 overflow-x-hidden">
                    <div className="max-w-[1600px] mx-auto px-4 sm:px-8 py-8 w-full">

                        {isLocked && (
                            <div className="fixed inset-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-xl flex items-center justify-center p-6">
                                <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] shadow-2xl text-center max-w-lg border border-slate-100 dark:border-slate-800">
                                    <div className="w-24 h-24 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <LockClosedIcon className="w-12 h-12 text-amber-500" />
                                    </div>
                                    <h2 className="text-3xl font-black mb-4 text-slate-900 dark:text-white">Akses Premium</h2>
                                    <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                                        Modul ini eksklusif untuk member Premium. Tingkatkan keanggotaan Anda untuk akses tanpa batas.
                                    </p>
                                    <div className="flex flex-col gap-3">
                                        <Link href={route('subscribe.index')} className="w-full bg-slate-900 dark:bg-white text-white dark:text-black py-4 rounded-2xl font-bold text-lg hover:scale-[1.02] transition-transform">
                                            Upgrade Sekarang
                                        </Link>
                                        <Link href={route('mini-moduls.index')} className="w-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 py-4 rounded-2xl font-bold hover:bg-slate-200 transition-colors">
                                            Kembali
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className={`grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 mb-20 ${isLocked ? 'blur-lg select-none pointer-events-none' : ''}`}>
                            {/* Thumbnail */}
                            <div className="lg:col-span-5 xl:col-span-4">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="aspect-[4/5] lg:aspect-square rounded-[3rem] overflow-hidden shadow-2xl shadow-slate-200/50 dark:shadow-black/50 relative group bg-slate-100 dark:bg-slate-800"
                                >
                                    {modul.thumbnail ? (
                                        <img src={`/storage/${modul.thumbnail}`} alt={modul.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center">
                                            <BookOpenIcon className="w-32 h-32 text-white/50" />
                                        </div>
                                    )}
                                </motion.div>
                            </div>

                            {/* Info Area */}
                            <div className="lg:col-span-7 xl:col-span-8 flex flex-col justify-center">
                                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                                    <div className="flex items-center gap-3 mb-6">
                                        <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${difficulty.style}`}>
                                            {difficulty.label}
                                        </span>
                                        <span className="text-slate-400 font-bold text-sm">•</span>
                                        <span className="text-slate-500 dark:text-slate-400 font-bold text-sm uppercase tracking-wide">{modul.category.name}</span>
                                    </div>

                                    <h1 className="text-4xl sm:text-5xl lg:text-7xl font-[900] text-slate-900 dark:text-white tracking-tighter leading-[1.05] mb-8 text-pretty">
                                        {modul.title}
                                    </h1>
                                    <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl mb-12">
                                        {modul.description}
                                    </p>

                                    <div className="flex flex-wrap items-center gap-4">
                                        {nextChapter && (
                                            <Link
                                                href={route('mini-moduls.chapter', { miniModul: modul.slug, chapter: nextChapter.slug })}
                                                className="bg-teal-500 hover:bg-teal-600 text-white px-8 py-4 rounded-full font-bold text-lg shadow-xl shadow-teal-500/30 flex items-center gap-3 transition-all hover:scale-105 active:scale-95"
                                            >
                                                <PlayIcon className="w-6 h-6 fill-current" />
                                                <span>{hasProgress ? 'Lanjutkan Belajar' : 'Mulai Belajar'}</span>
                                            </Link>
                                        )}
                                        <button
                                            onClick={() => setIsShareModalOpen(true)}
                                            className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-6 py-4 rounded-full font-bold shadow-lg flex items-center gap-2 hover:bg-slate-50 transition-all border border-slate-100 dark:border-slate-700"
                                        >
                                            <ShareIcon className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-8 mt-10 pt-8 border-t border-slate-200 dark:border-slate-800">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl">
                                                <BookOpenIcon className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-400 font-bold uppercase">Materi</p>
                                                <p className="font-bold text-slate-900 dark:text-white text-lg">{modul.published_chapters.length} Bab</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="p-2.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-2xl">
                                                <ClockIcon className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-400 font-bold uppercase">Durasi</p>
                                                <p className="font-bold text-slate-900 dark:text-white text-lg">{modul.total_duration} Menit</p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </div>

                        {/* Grid Layout untuk Konten Bawah */}
                        <div className={`grid grid-cols-1 lg:grid-cols-3 gap-10 ${isLocked ? 'blur-lg select-none pointer-events-none' : ''}`}>

                            {/* Kolom Kiri: Kurikulum (Bisa Scroll Kebawah Tak Terbatas) */}
                            <div className="lg:col-span-2 space-y-4">
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-6 pl-2">Kurikulum</h3>
                                <div className="flex flex-col space-y-3 pb-8">
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

                            {/* Kolom Kanan: Widgets */}
                            <div className="space-y-8">
                                {hasProgress && (
                                    <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-700">
                                        <h4 className="font-bold text-xl mb-6 text-slate-900 dark:text-white">Progress Belajar</h4>
                                        <div className="flex justify-between text-sm mb-3 font-bold">
                                            <span className="text-slate-500">Pencapaian</span>
                                            <span className="text-teal-500">{modul.progress_percentage}%</span>
                                        </div>
                                        <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${modul.progress_percentage}%` }}
                                                transition={{ duration: 1, ease: "easeOut" }}
                                                className="h-full bg-teal-500 rounded-full"
                                            />
                                        </div>
                                    </div>
                                )}

                                {relatedModuls.length > 0 && (
                                    <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-700">
                                        <h4 className="font-bold text-xl mb-6 text-slate-900 dark:text-white">Rekomendasi Lain</h4>
                                        <div className="space-y-4">
                                            {relatedModuls.map((rel) => (
                                                <RelatedModulItem key={rel.id} modul={rel} />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
