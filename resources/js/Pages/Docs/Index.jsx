import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { PlusIcon, DocumentTextIcon, ViewColumnsIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';
import DocumentCard from '@/Components/DocumentCard';
import KanbanBoard from '@/Components/KanbanBoard';

export default function Index({ documents, currentUser, kanbanTasks, activeTab = 'documents' }) {
    const [currentTab, setCurrentTab] = useState(activeTab);

    const tabs = [
        { id: 'documents', name: 'Documents', icon: DocumentTextIcon },
        { id: 'kanban', name: 'Kanban Board', icon: ViewColumnsIcon },
    ];

    const handleCreateDocument = () => {
        router.post(route('docs.store'));
    };

    const handleCreateTask = () => {
        // TODO: Implement create task modal
        alert('Create task feature coming soon!');
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h2 className="font-bold text-2xl text-gray-900 dark:text-white">
                        {currentTab === 'documents' ? '📄 Documents' : '📋 Kanban Board'}
                    </h2>
                    <button
                        onClick={currentTab === 'documents' ? handleCreateDocument : handleCreateTask}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 transition-all duration-200 transform hover:scale-105"
                    >
                        <PlusIcon className="w-5 h-5" />
                        {currentTab === 'documents' ? 'New Document' : 'New Task'}
                    </button>
                </div>
            }
        >
            <Head title={currentTab === 'documents' ? 'Documents' : 'Kanban Board'} />

            <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                {/* Tabs */}
                <div className="mb-8">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = currentTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setCurrentTab(tab.id)}
                                        className={`
                                            group inline-flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200
                                            ${isActive
                                                ? 'border-emerald-500 text-emerald-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            }
                                        `}
                                    >
                                        <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-500' : 'text-gray-400 group-hover:text-gray-500'}`} />
                                        {tab.name}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>
                </div>

                {/* Tab Content */}
                {currentTab === 'documents' && (
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

                {currentTab === 'kanban' && (
                    <div>
                        {kanbanTasks ? (
                            <KanbanBoard initialTasks={kanbanTasks} />
                        ) : (
                            <div className="text-center bg-white rounded-2xl shadow-sm p-16">
                                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100">
                                    <ViewColumnsIcon className="w-8 h-8 text-emerald-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    No Tasks Yet
                                </h3>
                                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                                    Organize your work with a Kanban board. Create your first task to get started.
                                </p>
                                <button
                                    onClick={handleCreateTask}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/30 transition-all duration-200 transform hover:scale-105"
                                >
                                    <PlusIcon className="w-5 h-5" />
                                    Create Your First Task
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}