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
            <div className="group relative bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-lg hover:border-emerald-300 transition-all duration-300">
                {/* Document Icon */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600">
                        <DocumentTextIcon className="w-6 h-6" />
                    </div>

                    {/* Delete Button (Only for owner) */}
                    {isOwner && (
                        <button
                            onClick={() => setShowDeleteModal(true)}
                            className="opacity-0 group-hover:opacity-100 p-2 rounded-lg text-red-500 hover:bg-red-50 transition-all duration-200"
                            title="Delete document"
                        >
                            <TrashIcon className="w-5 h-5" />
                        </button>
                    )}
                </div>

                {/* Title */}
                <Link href={route('docs.show', document.id)}>
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-emerald-600 transition-colors">
                        {document.title || 'Untitled Document'}
                    </h3>
                </Link>

                {/* Metadata */}
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                    <span>{new Date(document.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    {document.collaborators?.length > 0 && (
                        <div className="flex items-center gap-1">
                            <UserGroupIcon className="w-4 h-4" />
                            <span>{document.collaborators.length}</span>
                        </div>
                    )}
                    {document.is_public && (
                        <div className="flex items-center gap-1 text-emerald-600">
                            <GlobeAltIcon className="w-4 h-4" />
                            <span>Public</span>
                        </div>
                    )}
                </div>

                {/* Owner */}
                <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                    <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-semibold">
                        {document.user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm text-gray-600">{document.user?.name}</span>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Document?</h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete "{document.title || 'Untitled Document'}"? This action cannot be undone.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition"
                                disabled={isDeleting}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition disabled:opacity-50"
                                disabled={isDeleting}
                            >
                                {isDeleting ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
