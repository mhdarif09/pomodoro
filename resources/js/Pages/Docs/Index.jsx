import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { PlusIcon } from '@heroicons/react/24/solid';
import { DocumentIcon } from '@heroicons/react/24/outline';

const DocumentCard = ({ document, currentUser }) => {
    const isOwner = document.user.id === currentUser.id;

    const getPreview = (content) => {
        if (!content || !Array.isArray(content) || content.length === 0) return 'Tidak ada konten...';
        
        let previewText = '';
        const extractText = (blocks) => {
            if (!blocks) return;
            for (const block of blocks) {
                if (previewText.length > 150) break;
                if (block.content && Array.isArray(block.content)) {
                    for (const item of block.content) {
                        if (item.type === 'text' && item.text) {
                            previewText += item.text.trim() + ' ';
                        }
                    }
                }
                if (block.children) {
                    extractText(block.children);
                }
            }
        };

        extractText(content);
        if (!previewText.trim()) return 'Mulai menulis...';
        return previewText.substring(0, 150) + (previewText.length > 150 ? '...' : '');
    };

    return (
        <Link 
            href={route('docs.show', document.id)}
            className="group block bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-5 transition-all duration-200 hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-600 hover:-translate-y-1"
        >
            <div className="flex flex-col h-full">
                <div className="flex items-start justify-between">
                    <DocumentIcon className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                </div>
                <div className="mt-4 flex-grow">
                    <h3 className="text-base font-semibold text-slate-800 dark:text-white truncate">
                        {document.title || 'Dokumen Tanpa Judul'}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 line-clamp-2 h-10">
                        {getPreview(document.content)}
                    </p>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300">
                            {document.user.name.charAt(0)}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                            {isOwner ? 'Dimiliki oleh Anda' : `Oleh ${document.user.name}`}
                        </span>
                    </div>
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                        {new Date(document.updated_at).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}
                    </span>
                </div>
            </div>
        </Link>
    );
};

export default function Index({ documents, currentUser }) {
    return (
        <AuthenticatedLayout 
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-slate-800 dark:text-slate-200 leading-tight">
                        Dokumen
                    </h2>
                    <Link 
                        href={route('docs.store')}
                        method="post"
                        as="button"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white font-semibold rounded-lg shadow-sm hover:bg-emerald-700 transition focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                    >
                        <PlusIcon className="w-5 h-5"/> Dokumen Baru
                    </Link>
                </div>
            }
        >
            <Head title="Dokumen" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {documents.data && documents.data.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {documents.data.map(doc => (
                                <DocumentCard 
                                    key={doc.id}
                                    document={doc}
                                    currentUser={currentUser}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center bg-white dark:bg-slate-800 rounded-lg shadow-sm p-12">
                            <DocumentIcon className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
                            <h3 className="mt-4 text-xl font-semibold text-slate-800 dark:text-white">
                                Belum Ada Dokumen
                            </h3>
                            <p className="mt-2 text-sm text-slate-500">
                                Mulai tulis ide brilian Anda dengan membuat dokumen pertama.
                            </p>
                            <Link 
                                href={route('docs.store')}
                                method="post"
                                as="button"
                                className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white font-semibold rounded-lg shadow-sm hover:bg-emerald-700 transition"
                            >
                                <PlusIcon className="w-5 h-5"/> Buat Dokumen Baru
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}