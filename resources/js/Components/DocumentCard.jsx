import { Link, router } from '@inertiajs/react';
import { DocumentTextIcon, TrashIcon, UserGroupIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

export default function DocumentCard({ document, currentUser }) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const isOwner = document.user_id === currentUser.id;

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(route('docs.destroy', document.id), {
            onFinish: () => {
                setIsDeleting(false);
                setShowDeleteModal(false);
            }
        });
    };

    return (
        <>
            <div className="group relative apple-glass rounded-[2rem] p-7 shadow-sm hover:shadow-2xl hover:scale-[1.02] transition-all duration-500 overflow-hidden border-white/10">
                {/* Document Icon & Actions */}
                <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500 shadow-lg shadow-emerald-500/20 text-white">
                        <DocumentTextIcon className="w-8 h-8" />
                    </div>

                    {isOwner && (
                        <button
                            onClick={() => setShowDeleteModal(true)}
                            className="opacity-0 group-hover:opacity-100 p-2.5 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300"
                            title="Hapus dokumen"
                        >
                            <TrashIcon className="w-5 h-5" />
                        </button>
                    )}
                </div>

                {/* Title */}
                <Link href={route('docs.show', document.id)}>
                    <h3 className="font-extrabold text-xl text-slate-900 dark:text-white mb-3 line-clamp-2 hover:text-emerald-500 transition-colors tracking-tight leading-snug">
                        {document.title || 'Dokumen Tanpa Judul'}
                    </h3>
                </Link>

                {/* Metadata */}
                <div className="flex items-center gap-3 text-[11px] font-bold text-slate-500 mb-6">
                    <span className="apple-glass border-none px-2 py-1 rounded-full">{new Date(document.updated_at).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}</span>
                    {document.collaborators?.length > 0 && (
                        <div className="flex items-center gap-1.5 apple-glass border-none px-2 py-1 rounded-full">
                            <UserGroupIcon className="w-3.5 h-3.5" />
                            <span>{document.collaborators.length}</span>
                        </div>
                    )}
                    {document.is_public && (
                        <div className="flex items-center gap-1.5 text-emerald-600 apple-glass border-none px-2 py-1 rounded-full bg-emerald-500/10">
                            <GlobeAltIcon className="w-3.5 h-3.5" />
                            <span>Publik</span>
                        </div>
                    )}
                </div>

                {/* Owner */}
                <div className="flex items-center gap-3 pt-5 border-t border-slate-100 dark:border-slate-800/50">
                    <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-300 text-[10px] font-black shadow-inner">
                        {document.user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-[12px] font-bold text-slate-500 dark:text-slate-400 tracking-tight">{document.user?.name}</span>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl flex items-center justify-center z-[100] p-6">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="apple-glass rounded-[3rem] p-10 max-w-md w-full shadow-2xl border-white/10"
                    >
                        <h3 className="text-2xl font-[900] text-slate-900 dark:text-white mb-3 tracking-tight">Hapus Dokumen?</h3>
                        <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium leading-relaxed tracking-tight">
                            Apakah Anda yakin ingin menghapus "{document.title || 'Dokumen Tanpa Judul'}"? Tindakan ini tidak dapat dibatalkan.
                        </p>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleDelete}
                                className="apple-button h-12 bg-red-500 text-white shadow-xl shadow-red-500/20"
                                disabled={isDeleting}
                            >
                                {isDeleting ? 'Menghapus...' : 'Ya, Hapus Dokumen'}
                            </button>
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="text-sm font-bold text-slate-400 hover:text-slate-600 transition py-2"
                                disabled={isDeleting}
                            >
                                Batal
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </>
    );
}
