import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { ChatBubbleLeftRightIcon, CheckCircleIcon } from '@heroicons/react/24/solid';
import ChapterHeader from './Partials/ChapterHeader';
import ChapterSidebar from './Partials/ChapterSidebar';
import AiDiscussionPanel from './Partials/AiDiscussionPanel';
import { Transition } from '@headlessui/react';

export default function Chapter({ auth, modul, chapter, userProgress, navigation, allChapters }) {
    const [isCompleted, setIsCompleted] = useState(userProgress?.is_completed || false);
    const [showAiDiscussion, setShowAiDiscussion] = useState(false);
    const [discussions, setDiscussions] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedRole, setSelectedRole] = useState('teacher');
    const [isSidebarVisible, setSidebarVisible] = useState(false);

    useEffect(() => {
        if (showAiDiscussion && discussions.length === 0) loadDiscussions();
    }, [showAiDiscussion]);

    const loadDiscussions = async () => {
        try {
            const response = await fetch(route('mini-moduls.ai.discussions', { 
                miniModul: modul.id, 
                chapter: chapter.id
            }));
            const data = await response.json();
            setDiscussions(data.discussions || []);
        } catch (error) {
            console.error('Error loading discussions:', error);
        }
    };

    const handleCompleteChapter = async () => {
        try {
            const response = await fetch(route('mini-moduls.complete-chapter', {
                miniModul: modul.id,
                chapter: chapter.id
            }), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                }
            });
            if (response.ok) setIsCompleted(true);
        } catch (error) {
            console.error('Error completing chapter:', error);
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || isLoading) return;

        setIsLoading(true);
        try {
            const response = await fetch(route('mini-moduls.ai.discuss', { 
                miniModul: modul.id,
                chapter: chapter.id
            }), {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json', 
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content 
                },
                body: JSON.stringify({ message: newMessage })
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();

            if (data.success) {
                setDiscussions(prev => [...prev, data.discussion]);
                setNewMessage('');
            } else throw new Error(data.message || 'Unknown error');

        } catch (error) {
            console.error('Error sending message:', error);
            alert(`Gagal mengirim pesan: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const startRolePlay = async (scenario) => {
        if (!scenario.trim() || isLoading) return;

        setIsLoading(true);
        const tempUserMessage = {
            id: Date.now() + '_user',
            timestamp: new Date().toISOString(),
            user_message: `[Memulai Simulasi - ${selectedRole}] ${scenario}`,
            ai_response: 'Sedang berpikir...',
            context: { type: 'placeholder' }
        };
        setDiscussions(prev => [...prev, tempUserMessage]);

        try {
            const response = await fetch(route('mini-moduls.ai.role-play', { 
                miniModul: modul.id,
                chapter: chapter.id
            }), {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json', 
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content 
                },
                body: JSON.stringify({ role: selectedRole, scenario })
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();

            setDiscussions(prev => prev.map(d => 
                d.id === tempUserMessage.id
                ? {
                    ...d,
                    id: Date.now(),
                    ai_response: data.success ? data.role_response : "Gagal mendapatkan respons.",
                    context: data.success ? { type: 'roleplay', role: selectedRole } : { type: 'error' }
                  }
                : d
            ));

        } catch (error) {
            console.error('Error in role play:', error);
            setDiscussions(prev => prev.map(d =>
                d.id === tempUserMessage.id 
                ? { ...d, ai_response: `Terjadi kesalahan: ${error.message}` } 
                : d
            ));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`${chapter.title} - ${modul.title}`} />

            <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
                <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-4">

                    <ChapterHeader modul={modul} navigation={navigation} />

                    <div className="lg:grid lg:grid-cols-4 lg:gap-8">
                        {/* Konten Utama */}
                        <main className="lg:col-span-3">
                            <article className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6 lg:p-10 text-base sm:text-lg leading-relaxed">
                                <header className="mb-8">
                                    <p className="text-sm font-semibold text-green-600 dark:text-green-400 mb-1">{modul.category?.name}</p>
                                    <h1 className="text-3xl md:text-4xl font-extrabold leading-tight text-gray-900 dark:text-white tracking-tight">{chapter.title}</h1>
                                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{chapter.estimated_duration} menit perkiraan waktu baca</p>
                                </header>

                                {/* Konten dengan list, code, gambar responsif */}
                              <div
  className="prose prose-lg dark:prose-invert max-w-none
             prose-img:rounded-lg prose-img:mx-auto prose-img:max-h-[400px] prose-img:w-full prose-img:object-contain
             prose-a:text-green-600 dark:prose-a:text-green-400
             prose-strong:text-gray-800 dark:prose-strong:text-gray-200
             prose-ol:list-decimal prose-ul:list-disc prose-li:my-2
             prose-p:my-4
             prose-h2:mt-8 prose-h2:mb-4 prose-h3:mt-6 prose-h3:mb-3
             prose-pre:bg-gray-100 dark:prose-pre:bg-gray-800 prose-pre:p-4 prose-pre:rounded-md prose-pre:overflow-x-auto
             prose-blockquote:border-l-4 prose-blockquote:border-green-300 dark:prose-blockquote:border-green-600 prose-blockquote:pl-4 prose-blockquote:italic"
  dangerouslySetInnerHTML={{ __html: chapter.content }}
/>


                                <footer className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <button
                                        onClick={() => setShowAiDiscussion(!showAiDiscussion)}
                                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 border-2 border-green-200 dark:border-green-800 text-sm font-bold rounded-md text-green-600 dark:text-green-300 bg-green-50 dark:bg-green-900/40 hover:bg-green-100 dark:hover:bg-green-900/60 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-gray-800 transition-colors"
                                    >
                                        <ChatBubbleLeftRightIcon className="w-5 h-5" />
                                        <span>Diskusi AI</span>
                                    </button>

                                    {!isCompleted ? (
                                        <button
                                            onClick={handleCompleteChapter}
                                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 border border-transparent text-sm font-bold rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-gray-800 transition-colors"
                                        >
                                            <CheckCircleIcon className="w-5 h-5" />
                                            <span>Tandai Selesai</span>
                                        </button>
                                    ) : (
                                        <div className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/50 rounded-md">
                                            <CheckCircleIcon className="w-5 h-5"/>
                                            <span>Selesai</span>
                                        </div>
                                    )}
                                </footer>

                                <Transition
                                    show={showAiDiscussion}
                                    enter="transition-all duration-300 ease-out"
                                    enterFrom="opacity-0 -translate-y-4"
                                    enterTo="opacity-100 translate-y-0"
                                    leave="transition-all duration-150 ease-in"
                                    leaveFrom="opacity-100 translate-y-0"
                                    leaveTo="opacity-0 -translate-y-4"
                                >
                                    <AiDiscussionPanel 
                                        discussions={discussions}
                                        newMessage={newMessage}
                                        setNewMessage={setNewMessage}
                                        sendMessage={sendMessage}
                                        startRolePlay={startRolePlay}
                                        isLoading={isLoading}
                                        selectedRole={selectedRole}
                                        setSelectedRole={setSelectedRole}
                                    />
                                </Transition>
                            </article>
                        </main>

                        {/* Sidebar Desktop */}
                        <aside className="hidden lg:block lg:col-span-1">
                            <div className="sticky top-24">
                                <ChapterSidebar 
                                    modul={modul}
                                    allChapters={allChapters}
                                    currentChapterId={chapter.id}
                                    userProgress={userProgress}
                                />
                            </div>
                        </aside>
                    </div>
                </div>

                 {/* Tombol Sidebar Mobile */}
                 <div className="lg:hidden fixed bottom-4 right-4 z-20">
                     <button 
                        onClick={() => setSidebarVisible(!isSidebarVisible)}
                        className="p-3 bg-white dark:bg-gray-700 rounded-full shadow-lg text-gray-800 dark:text-gray-200 ring-1 ring-black ring-opacity-5"
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                         </svg>
                     </button>
                 </div>
                 
                 {/* Panel Sidebar Mobile */}
                 <Transition show={isSidebarVisible} as={React.Fragment}>
                     <div className="lg:hidden fixed inset-0 z-30" onClick={() => setSidebarVisible(false)}>
                         <Transition.Child
                             as={React.Fragment}
                             enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100"
                             leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"
                         >
                            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
                         </Transition.Child>
                         
                         <Transition.Child
                             as="div"
                             className="absolute inset-y-0 left-0 w-4/5 max-w-sm"
                             enter="transition ease-in-out duration-500 transform" enterFrom="-translate-x-full" enterTo="translate-x-0"
                             leave="transition ease-in-out duration-500 transform" leaveFrom="translate-x-0" leaveTo="-translate-x-full"
                         >
                            <div className="h-full p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900" onClick={(e) => e.stopPropagation()}>
                               <ChapterSidebar 
                                   modul={modul}
                                   allChapters={allChapters}
                                   currentChapterId={chapter.id}
                                   userProgress={userProgress}
                               />
                            </div>
                         </Transition.Child>
                     </div>
                 </Transition>
            </div>
        </AuthenticatedLayout>
    );
}
