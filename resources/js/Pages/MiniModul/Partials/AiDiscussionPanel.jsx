import React, { useEffect, useRef } from 'react';
import { UserIcon, ComputerDesktopIcon } from '@heroicons/react/24/solid';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function AiDiscussionPanel({ 
    discussions, newMessage, setNewMessage, sendMessage, startRolePlay, 
    isLoading, selectedRole, setSelectedRole 
}) {
    const discussionEndRef = useRef(null);

    useEffect(() => {
        discussionEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [discussions]);

    const quickActions = [
        { label: "Jelaskan lebih sederhana", scenario: "Jelaskan konsep ini seolah saya anak SMA." },
        { label: "Contoh di dunia nyata", scenario: "Berikan contoh penerapan konsep ini dalam kehidupan sehari-hari atau di industri." },
        { label: "Kesalahan umum", scenario: "Apa saja kesalahan atau miskonsepsi umum terkait materi ini?" },
    ];

    return (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-8 mt-8">
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
                    <ComputerDesktopIcon className="w-6 h-6 mr-2 text-green-500" />
                    Diskusi dengan SinauBot
                </h3>

                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                    <div className='flex-1'>
                        <label htmlFor="ai-role" className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Pilih Persona AI</label>
                        <select
                            id="ai-role"
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            className="w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm focus:ring-green-500 focus:border-green-500"
                        >
                            <option value="teacher">Guru</option>
                            <option value="student">Teman Belajar</option>
                            <option value="expert">Pakar Industri</option>
                            <option value="beginner">Pemula</option>
                        </select>
                    </div>
                    <div className='flex-1'>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Aksi Cepat</label>
                        <div className="flex flex-wrap gap-2">
                            {quickActions.map(action => (
                                <button key={action.label} onClick={() => startRolePlay(action.scenario)} disabled={isLoading} className="px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-full text-xs hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50">
                                    {action.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mb-4 max-h-[50vh] overflow-y-auto space-y-6 p-4 bg-white dark:bg-gray-900/50 rounded-md border border-gray-200 dark:border-gray-700">
                    {discussions.length === 0 && (
                        <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-8">
                            Belum ada diskusi. Mulai dengan bertanya sesuatu!
                        </p>
                    )}
                    {discussions.map((discussion) => (
                        <div key={discussion.id}>
                            <div className="flex items-start gap-3">
                                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                    <UserIcon className="w-5 h-5 text-blue-600 dark:text-blue-300" />
                                </span>
                                <div className="bg-blue-50 dark:bg-gray-800 rounded-lg p-3 flex-1">
                                    <p className="text-sm text-gray-800 dark:text-gray-200">{discussion.user_message}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 mt-3">
                                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                                    <ComputerDesktopIcon className="w-5 h-5 text-green-600 dark:text-green-300" />
                                </span>
                                <div className="bg-white dark:bg-gray-700/50 rounded-lg p-3 flex-1 prose prose-sm dark:prose-invert max-w-none">
                                    <Markdown remarkPlugins={[remarkGfm]}>{discussion.ai_response}</Markdown>
                                </div>
                            </div>
                        </div>
                    ))}
                    <div ref={discussionEndRef} />
                </div>

                <form onSubmit={sendMessage} className="flex gap-2 items-center">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Tanyakan apapun tentang materi ini..."
                        className="flex-1 px-4 py-2 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-full focus:ring-green-500 focus:border-green-500 text-sm"
                        disabled={isLoading}
                    />
                    <button type="submit" disabled={isLoading || !newMessage.trim()} className="px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold">
                        {isLoading ? '...' : 'Kirim'}
                    </button>
                </form>
            </div>
        </div>
    );
}