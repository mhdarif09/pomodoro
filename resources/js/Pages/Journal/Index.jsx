
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BookOpenIcon, PencilSquareIcon, SparklesIcon, CalendarIcon,
    ChevronRightIcon, ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import NotionEditor from '@/Components/TodoList/NotionEditor';
import dayjs from 'dayjs';
import 'dayjs/locale/id';

dayjs.locale('id');

export default function JournalIndex({ auth, reflections, todayReflection }) {
    const [isWriting, setIsWriting] = useState(false);
    const { data, setData, post, processing, reset, errors } = useForm({
        user_answer: '',
        ai_question: 'Apa pencapaian terbesarmu hari ini dan apa yang bisa diperbaiki besok?',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('journal.store'), {
            onSuccess: () => {
                setIsWriting(false);
                reset();
            }
        });
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-extrabold text-2xl text-slate-900 dark:text-white">Jurnal & Refleksi</h2>}
        >
            <Head title="Jurnal Harian" />

            <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">

                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-8 sm:p-12 text-white shadow-2xl"
                >
                    <div className="absolute top-0 right-0 p-12 opacity-10">
                        <BookOpenIcon className="w-64 h-64 rotate-12" />
                    </div>

                    <div className="relative z-10 max-w-2xl">
                        <h3 className="text-3xl sm:text-5xl font-[900] mb-4 tracking-tight leading-tight">
                            {todayReflection ? "Refleksi Hari Ini Selesai! ✨" : "Bagaimana harimu berjalan?"}
                        </h3>
                        <p className="text-lg sm:text-xl text-indigo-100 font-medium mb-8 leading-relaxed">
                            {todayReflection
                                ? "Hebat! Kamu sudah meluangkan waktu untuk mengevaluasi diri hari ini. Konsistensi adalah kunci pertumbuhan."
                                : "Luangkan waktu sejenak untuk mencatat kemenangan kecil, pelajaran berharga, dan rasa syukur hari ini."
                            }
                        </p>

                        {!todayReflection ? (
                            <button
                                onClick={() => setIsWriting(true)}
                                className="group bg-white text-indigo-600 px-8 py-4 rounded-2xl font-black text-lg shadow-xl shadow-indigo-900/20 hover:bg-indigo-50 transition-all flex items-center gap-3 active:scale-95"
                            >
                                <PencilSquareIcon className="w-6 h-6" />
                                <span>Mulai Menulis Jurnal</span>
                                <ChevronRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        ) : (
                            <button
                                className="bg-white/20 backdrop-blur-md border border-white/30 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 cursor-default"
                            >
                                <CheckCircleIcon className="w-6 h-6" />
                                <span>Sudah Mengisi Hari Ini</span>
                            </button>
                        )}
                    </div>
                </motion.div>

                {/* Writing Modal/Area */}
                <AnimatePresence>
                    {isWriting && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                onClick={() => setIsWriting(false)}
                                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4"
                            >
                                <div className="w-full max-w-4xl bg-white dark:bg-[#1C1C1E] rounded-[2rem] shadow-2xl overflow-hidden pointer-events-auto flex flex-col max-h-[90vh]">
                                    <div className="p-6 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-indigo-100 dark:bg-indigo-500/20 rounded-xl text-indigo-600 dark:text-indigo-400">
                                                <SparklesIcon className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900 dark:text-white text-lg">Jurnal Baru</h4>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{dayjs().format('dddd, DD MMMM YYYY')}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => setIsWriting(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors">
                                            <XMarkIcon className="w-6 h-6 text-slate-400" />
                                        </button>
                                    </div>

                                    <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-slate-50 dark:bg-[#1C1C1E]">
                                        <div className="mb-6 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-2xl p-5">
                                            <h5 className="text-sm font-bold text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2">
                                                <ChatBubbleLeftRightIcon className="w-4 h-4" />
                                                Prompt Hari Ini:
                                            </h5>
                                            <p className="text-blue-900 dark:text-blue-100 italic">"{data.ai_question}"</p>
                                        </div>

                                        <div className="bg-white dark:bg-black/20 rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden min-h-[300px] shadow-sm focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
                                            <NotionEditor
                                                content={data.user_answer}
                                                onChange={(html) => setData('user_answer', html)}
                                                enableAi={auth.user.is_premium}
                                                placeholder="Mulai menulis ceritamu hari ini..."
                                            />
                                        </div>
                                    </div>

                                    <div className="p-6 border-t border-slate-100 dark:border-white/5 bg-white dark:bg-[#1C1C1E] flex justify-end gap-3">
                                        <button
                                            onClick={() => setIsWriting(false)}
                                            className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                                        >
                                            Batal
                                        </button>
                                        <button
                                            onClick={handleSubmit}
                                            disabled={processing || !data.user_answer}
                                            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                                        >
                                            {processing ? 'Menyimpan...' : 'Simpan Jurnal'}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                {/* History List */}
                <div className="space-y-6">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <CalendarIcon className="w-6 h-6 text-slate-400" />
                        Riwayat Jurnal
                    </h3>

                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {reflections.data.length > 0 ? (
                            reflections.data.map((entry) => (
                                <motion.div
                                    key={entry.id}
                                    whileHover={{ y: -5 }}
                                    className="group bg-white dark:bg-slate-800/50 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-700/50 hover:shadow-xl hover:border-indigo-500/30 transition-all cursor-pointer relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                                        <BookOpenIcon className="w-32 h-32 rotate-12" />
                                    </div>

                                    <div className="relative z-10 flex flex-col h-full">
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 bg-slate-100 dark:bg-slate-700/50 px-3 py-1 rounded-full">
                                                {dayjs(entry.reflection_date).format('DD MMM YYYY')}
                                            </span>
                                        </div>

                                        <div className="prose dark:prose-invert prose-sm line-clamp-4 mb-6 text-slate-600 dark:text-slate-300">
                                            <div dangerouslySetInnerHTML={{ __html: entry.user_answer }} />
                                        </div>

                                        <div className="mt-auto pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                                            <span className="text-xs font-medium text-slate-400 group-hover:text-indigo-500 transition-colors">Baca selengkapnya</span>
                                            <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-700 group-hover:bg-indigo-500 group-hover:text-white flex items-center justify-center transition-all">
                                                <ChevronRightIcon className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="col-span-full py-12 text-center text-slate-400 bg-slate-50 dark:bg-slate-800/30 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-700">
                                <BookOpenIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p className="font-medium">Belum ada catatan jurnal.</p>
                                <button onClick={() => setIsWriting(true)} className="text-indigo-500 font-bold hover:underline mt-2">Mulai cerita pertamamu</button>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}

function CheckCircleIcon({ className }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
            <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
        </svg>
    )
}

function XMarkIcon({ className }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
    )
}
