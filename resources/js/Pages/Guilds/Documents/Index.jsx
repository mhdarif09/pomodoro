import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { DocumentTextIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

export default function GuildDocumentsIndex({ auth, guild, documents }) {

    const createDocument = () => {
        router.post(route('guilds.documents.store', guild.id));
    };

    const handleDelete = (doc) => {
        if (confirm('Delete this document?')) {
            router.delete(route('guilds.documents.destroy', [guild.id, doc.id]));
        }
    };

    return (
        <AuthenticatedLayout header={null}>
            <Head title={`${guild.name} - Documents`} />

            <div className="max-w-7xl mx-auto p-4 sm:p-6 font-sans text-slate-900 dark:text-white">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <DocumentTextIcon className="w-8 h-8 text-teal-500" />
                        Guild Archives
                    </h1>
                    <button onClick={createDocument} className="px-4 py-2 bg-teal-500 text-white rounded-lg text-sm font-bold hover:bg-teal-600 transition-colors flex items-center gap-2">
                        <PlusIcon className="w-5 h-5" /> New Document
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {documents.map(doc => (
                        <div key={doc.id} className="group bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm hover:shadow-md transition-all relative">
                            <Link href={route('guilds.documents.show', [guild.id, doc.id])} className="absolute inset-0 z-0" />

                            <div className="flex items-start justify-between mb-3 relative z-10 pointer-events-none">
                                <div className="w-10 h-10 rounded-lg bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 dark:text-teal-400">
                                    <DocumentTextIcon className="w-6 h-6" />
                                </div>
                                {doc.user_id === auth.user.id && (
                                    <button onClick={(e) => { e.stopPropagation(); handleDelete(doc); }} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto cursor-pointer">
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            <h3 className="font-bold text-slate-800 dark:text-white mb-1 line-clamp-1 group-hover:text-teal-500 transition-colors">{doc.title}</h3>
                            <p className="text-xs text-slate-500 mb-4">
                                Updated {format(new Date(doc.updated_at), 'MMM d, yyyy')}
                            </p>

                            <div className="flex items-center gap-2 border-t border-slate-100 dark:border-slate-700 pt-3">
                                <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-500">
                                    {doc.user?.name.charAt(0)}
                                </div>
                                <span className="text-xs text-slate-400 truncate max-w-[100px]">{doc.user?.name}</span>
                            </div>
                        </div>
                    ))}

                    {/* Create New Card Placeholder */}
                    <button onClick={createDocument} className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-5 flex flex-col items-center justify-center text-slate-400 hover:text-teal-500 hover:border-teal-300 transition-all min-h-[180px]">
                        <PlusIcon className="w-8 h-8 mb-2" />
                        <span className="text-sm font-bold">New Document</span>
                    </button>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
