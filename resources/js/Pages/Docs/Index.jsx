import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { PlusIcon, DocumentTextIcon, ViewColumnsIcon } from '@heroicons/react/24/solid';
import { useState, useEffect } from 'react';
import DocumentCard from '@/Components/DocumentCard';
import KanbanBoard from '@/Components/KanbanBoard';
import axios from 'axios';

export default function Index({ currentUser }) {
    const [documents, setDocuments] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        setLoading(true);

        const fetchData = async () => {
            try {
                const response = await axios.get(route('api.documents.index'));
                if (isMounted) setDocuments(response.data.documents);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchData();

        return () => {
            isMounted = false;
        };
    }, []);

    const handleCreateDocument = async () => {
        try {
            const response = await axios.post(route('api.documents.store'));
            const newDoc = response.data.document;
            router.visit(route('docs.show', newDoc.id));
        } catch (error) {
            console.error("Failed to create document:", error);
            alert("Failed to create document.");
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h2 className="font-bold text-2xl text-gray-900 dark:text-white">
                        📄 Documents
                    </h2>
                    <button
                        onClick={handleCreateDocument}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 transition-all duration-200 transform hover:scale-105"
                    >
                        <PlusIcon className="w-5 h-5" />
                        New Document
                    </button>
                </div>
            }
        >
            <Head title="Documents" />

            <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
                    </div>
                ) : (
                    <div>
                        {documents?.data && documents.data.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {documents.data.map(doc => (
                                    <DocumentCard
                                        key={doc.id}
                                        document={doc}
                                        currentUser={currentUser}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center bg-white rounded-2xl shadow-sm p-16">
                                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100">
                                    <DocumentTextIcon className="w-8 h-8 text-emerald-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    No Documents Yet
                                </h3>
                                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                                    Start writing your brilliant ideas by creating your first document.
                                </p>
                                <button
                                    onClick={handleCreateDocument}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/30 transition-all duration-200 transform hover:scale-105"
                                >
                                    <PlusIcon className="w-5 h-5" />
                                    Create Your First Document
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}