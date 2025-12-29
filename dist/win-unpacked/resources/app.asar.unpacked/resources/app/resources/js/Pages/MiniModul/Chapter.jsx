import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { ChatBubbleLeftRightIcon, CheckCircleIcon, LockClosedIcon, ListBulletIcon, XMarkIcon } from '@heroicons/react/24/solid';
import ChapterHeader from './Partials/ChapterHeader';
import ChapterSidebar from './Partials/ChapterSidebar';
import AiDiscussionPanel from './Partials/AiDiscussionPanel';
import { motion, AnimatePresence } from 'framer-motion';

export default function Chapter({ auth, modul, chapter, userProgress, navigation, allChapters, isLocked }) {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [isCompleted, setIsCompleted] = useState(userProgress?.is_completed || false);
    const [showAiDiscussion, setShowAiDiscussion] = useState(false);
    const [discussions, setDiscussions] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedRole, setSelectedRole] = useState('teacher');

    useEffect(() => {
        if (showAiDiscussion && discussions.length === 0) loadDiscussions();
    }, [showAiDiscussion]);

    const loadDiscussions = async () => {
        try {
            const response = await fetch(route('mini-moduls.ai.discussions', { miniModul: modul.id, chapter: chapter.id }));
            const data = await response.json();
            setDiscussions(data.discussions || []);
        } catch (error) { console.error(error); }
    };

    const handleCompleteChapter = async () => {
        try {
            const response = await fetch(route('mini-moduls.complete-chapter', { miniModul: modul.id, chapter: chapter.id }), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content }
            });
            if (response.ok) setIsCompleted(true);
        } catch (error) { console.error(error); }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || isLoading) return;
        setIsLoading(true);
        try {
            const response = await fetch(route('mini-moduls.ai.discuss', { miniModul: modul.id, chapter: chapter.id }), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content },
                body: JSON.stringify({ message: newMessage })
            });
            const data = await response.json();
            if (data.success) {
                setDiscussions(prev => [...prev, data.discussion]);
                setNewMessage('');
            }
        } catch (error) { console.error(error); } finally { setIsLoading(false); }
    };

    const startRolePlay = async (scenario) => {
        if (!scenario.trim() || isLoading) return;
        setIsLoading(true);
        const tempId = Date.now();
        setDiscussions(prev => [...prev, { id: tempId, user_message: `[Simulasi: ${selectedRole}] ${scenario}`, ai_response: '...' }]);

        try {
            const response = await fetch(route('mini-moduls.ai.role-play', { miniModul: modul.id, chapter: chapter.id }), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content },
                body: JSON.stringify({ role: selectedRole, scenario })
            });
            const data = await response.json();
            setDiscussions(prev => prev.map(d => d.id === tempId ? { ...d, ai_response: data.role_response } : d));
        } catch (error) { console.error(error); } finally { setIsLoading(false); }
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`${chapter.title} - ${modul.title}`} />

            {/* Container Scrollable - Fix for desktop clipping */}
            <div className="h-full overflow-y-auto scrollbar-hide">
                {/* Content Wrapper */}
                <div className="w-full min-h-screen bg-[#F2F2F7] dark:bg-[#000000] relative">

                    {/* 1. Sticky Header Navigation */}
                    <div className="sticky top-6 z-40 px-4 max-w-4xl mx-auto mb-8 pointer-events-none">
                        <div className="pointer-events-auto">
                            <ChapterHeader
                                modul={modul}
                                navigation={navigation}
                                onToggleAi={() => setShowAiDiscussion(!showAiDiscussion)}
                                isAiOpen={showAiDiscussion}
                            />
                        </div>
                    </div>

                    {/* 2. Main Scrollable Content Area */}
                    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 pb-32 flex justify-center w-full">

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="w-full max-w-4xl"
                        >
                            {isLocked ? (
                                <div className="bg-white dark:bg-[#1C1C1E] rounded-[3rem] p-16 text-center shadow-2xl mt-10">
                                    <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <LockClosedIcon className="w-10 h-10 text-amber-500" />
                                    </div>
                                    <h2 className="text-3xl font-black mb-4 dark:text-white">Konten Terkunci</h2>
                                    <p className="mb-8 text-slate-500">Hanya untuk member Premium.</p>
                                    <Link href={route('subscribe.index')} className="bg-slate-900 text-white px-8 py-4 rounded-full font-bold">Upgrade Sekarang</Link>
                                </div>
                            ) : (
                                <article className="bg-white dark:bg-[#1C1C1E] rounded-[2.5rem] shadow-xl shadow-slate-200/50 dark:shadow-none p-8 sm:p-12 lg:p-16 border border-slate-100 dark:border-slate-800 w-full mx-auto">
                                    <header className="mb-10 pb-8 border-b border-slate-100 dark:border-slate-800">
                                        <span className="text-teal-600 dark:text-teal-400 font-bold uppercase tracking-widest text-xs mb-3 block">
                                            {modul.category?.name}
                                        </span>
                                        <h1 className="text-3xl sm:text-5xl font-[900] tracking-tighter text-slate-900 dark:text-white leading-[1.1] mb-4 text-pretty">
                                            {chapter.title}
                                        </h1>
                                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-bold text-slate-500">
                                            ⏱ {chapter.estimated_duration} Menit Baca
                                        </div>
                                    </header>

                                    {/* CONTENT AREA: Tidak ada max-height, konten akan memanjang ke bawah */}
                                    <div className="prose prose-lg prose-slate dark:prose-invert max-w-none 
                                    prose-headings:font-black prose-headings:tracking-tight 
                                    prose-p:leading-relaxed prose-p:text-slate-600 dark:prose-p:text-slate-300
                                    prose-a:text-teal-500 prose-a:no-underline hover:prose-a:underline
                                    prose-img:rounded-[2rem] prose-img:shadow-lg prose-img:my-8 prose-img:w-full
                                    prose-pre:bg-slate-900 prose-pre:rounded-[1.5rem] prose-pre:shadow-xl prose-pre:overflow-x-auto
                                    prose-blockquote:border-l-4 prose-blockquote:border-teal-500 prose-blockquote:bg-teal-50 dark:prose-blockquote:bg-teal-900/10 prose-blockquote:p-6 prose-blockquote:rounded-r-2xl prose-blockquote:not-italic
                                ">
                                        <div dangerouslySetInnerHTML={{ __html: chapter.content }} />
                                    </div>

                                    {/* Footer Buttons */}
                                    <div className="mt-16 pt-10 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-4">
                                        <button
                                            onClick={() => setShowAiDiscussion(!showAiDiscussion)}
                                            className={`flex-1 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all border-2
                                            ${showAiDiscussion
                                                    ? 'bg-slate-100 dark:bg-slate-800 border-transparent text-slate-900 dark:text-white'
                                                    : 'bg-white dark:bg-transparent border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-teal-500 hover:text-teal-500'
                                                }`}
                                        >
                                            <ChatBubbleLeftRightIcon className="w-5 h-5" />
                                            <span>Tanya AI</span>
                                        </button>

                                        {!isCompleted ? (
                                            <button
                                                onClick={handleCompleteChapter}
                                                className="flex-1 py-4 bg-slate-900 dark:bg-white text-white dark:text-black rounded-2xl font-bold shadow-xl hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
                                            >
                                                <CheckCircleIcon className="w-5 h-5" /> Selesaikan Bab Ini
                                            </button>
                                        ) : (
                                            <div className="flex-1 py-4 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-2xl font-bold flex items-center justify-center gap-2 cursor-default">
                                                <CheckCircleIcon className="w-5 h-5" /> Sudah Selesai
                                            </div>
                                        )}
                                    </div>

                                    {/* AI Panel - Akan mendorong konten ke bawah saat dibuka */}
                                    <AnimatePresence>
                                        {showAiDiscussion && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <AiDiscussionPanel
                                                    discussions={discussions}
                                                    newMessage={newMessage} setNewMessage={setNewMessage}
                                                    sendMessage={sendMessage} startRolePlay={startRolePlay}
                                                    isLoading={isLoading} selectedRole={selectedRole} setSelectedRole={setSelectedRole}
                                                />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </article>
                            )}
                        </motion.div>
                    </div>

                    {/* 3. Floating Action Button for Sidebar */}
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="fixed bottom-8 right-8 z-50 bg-slate-900 dark:bg-white text-white dark:text-black p-4 rounded-full shadow-2xl shadow-slate-900/40 hover:scale-110 transition-transform flex items-center gap-2 group"
                    >
                        <ListBulletIcon className="w-6 h-6" />
                        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap font-bold text-sm">
                            Daftar Isi
                        </span>
                    </button>

                    {/* 4. Sidebar Drawer (Off-Canvas / Overlay) */}
                    <AnimatePresence>
                        {isSidebarOpen && (
                            <>
                                {/* Backdrop */}
                                <motion.div
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    onClick={() => setSidebarOpen(false)}
                                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
                                />

                                {/* Sidebar Panel - Fixed Height but Scrollable Inside */}
                                <motion.div
                                    initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                                    transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                                    className="fixed inset-y-0 right-0 z-[70] w-80 sm:w-96 bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-xl shadow-2xl border-l border-white/20 flex flex-col h-full"
                                >
                                    <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
                                        <h3 className="text-2xl font-black dark:text-white">Kurikulum</h3>
                                        <button onClick={() => setSidebarOpen(false)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                            <XMarkIcon className="w-6 h-6 text-slate-500" />
                                        </button>
                                    </div>

                                    {/* Area Scroll untuk Sidebar */}
                                    <div className="flex-1 overflow-y-auto p-6">
                                        <ChapterSidebar
                                            modul={modul}
                                            allChapters={allChapters}
                                            currentChapterId={chapter.id}
                                            userProgress={userProgress}
                                        />
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
