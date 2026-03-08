import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeftIcon, CheckIcon, CloudIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

export default function GuildDocumentShow({ auth, guild, document: initialDoc }) {
    const [doc, setDoc] = useState(initialDoc);
    const [content, setContent] = useState(initialDoc.content || '');
    const [title, setTitle] = useState(initialDoc.title);
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);

    // Auto-save debouncer
    useEffect(() => {
        const timeout = setTimeout(() => {
            if (content !== (initialDoc.content || '') || title !== initialDoc.title) {
                saveDocument();
            }
        }, 2000);

        return () => clearTimeout(timeout);
    }, [content, title]);

    const saveDocument = async () => {
        setIsSaving(true);
        try {
            await axios.put(route('guilds.documents.update', [guild.id, doc.id]), {
                title,
                content
            });
            setLastSaved(new Date());
            setIsSaving(false);
        } catch (error) {
            console.error('Failed to save', error);
            setIsSaving(false);
        }
    };

    return (
        <AuthenticatedLayout header={null}>
            <Head title={`${title} - ${guild.name}`} />

            <div className="max-w-4xl mx-auto p-4 sm:p-6 font-sans h-screen flex flex-col">
                {/* Toolbar */}
                <div className="flex items-center justify-between mb-6 sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm z-10 py-2">
                    <div className="flex items-center gap-4">
                        <Link href={route('guilds.documents.index', guild.id)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500">
                            <ArrowLeftIcon className="w-5 h-5" />
                        </Link>
                        <input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="bg-transparent border-none text-xl font-bold text-slate-900 dark:text-white focus:ring-0 p-0 w-full md:w-[400px]"
                            placeholder="Untitled Document"
                        />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                        {isSaving ? (
                            <span className="flex items-center gap-1"><CloudIcon className="w-4 h-4 animate-pulse" /> Saving...</span>
                        ) : lastSaved ? (
                            <span className="flex items-center gap-1"><CheckIcon className="w-4 h-4 text-emerald-500" /> Saved</span>
                        ) : null}
                    </div>
                </div>

                {/* Editor Area */}
                <div className="flex-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-8 md:p-12 overflow-y-auto">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full h-full min-h-[500px] border-none resize-none focus:ring-0 text-slate-700 dark:text-slate-300 text-lg leading-relaxed bg-transparent"
                        placeholder="Start typing your guild document here..."
                    />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
