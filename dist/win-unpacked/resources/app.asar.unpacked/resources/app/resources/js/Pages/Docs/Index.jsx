import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { PlusIcon, DocumentTextIcon } from '@heroicons/react/24/solid';
import { useState, useEffect } from 'react';
import DocumentCard from '@/Components/DocumentCard';
import axios from 'axios';
import { motion } from 'framer-motion';

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
            header={null} // Kita custom header di dalam konten agar lebih fleksibel
        >
            <Head title="Documents" />

            <div className="pb-24 pt-6 px-4 sm:px-8 max-w-[1600px] mx-auto min-h-screen">
                {/* Header iOS Style */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }} 
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Knowledge Base</p>
                        <h1 className="text-4xl md:text-6xl font-[900] text-slate-900 dark:text-white tracking-tighter leading-tight">
                            Dokumen <span className="text-emerald-500">Anda.</span>
                        </h1>
                    </motion.div>

                    <motion.button
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleCreateDocument}
                        className="apple-button bg-emerald-500 hover:bg-emerald-600 text-white flex items-center gap-3 px-6 py-4 rounded-full shadow-2xl shadow-emerald-500/30 font-bold text-lg transition-all"
                    >
                        <div className="bg-white/20 p-1 rounded-full">
                            <PlusIcon className="w-5 h-5 stroke-2" />
                        </div>
                        Buat Baru
                    </motion.button>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="relative w-16 h-16">
                            <div className="absolute top-0 left-0 w-full h-full border-4 border-slate-200 dark:border-slate-800 rounded-full"></div>
                            <div className="absolute top-0 left-0 w-full h-full border-4 border-emerald-500 rounded-full border-t-transparent animate-spin"></div>
                        </div>
                    </div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        {documents?.data && documents.data.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {documents.data.map((doc, index) => (
                                    <motion.div
                                        key={doc.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <DocumentCard
                                            document={doc}
                                            currentUser={currentUser}
                                        />
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl rounded-[3rem] border border-slate-200/50 dark:border-white/5 py-32 shadow-xl relative overflow-hidden group max-w-2xl mx-auto mt-10">
                                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                                
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ type: "spring", bounce: 0.5 }}
                                    className="flex items-center justify-center w-28 h-28 mx-auto mb-8 rounded-[2.5rem] bg-white dark:bg-slate-700 shadow-2xl shadow-emerald-500/20"
                                >
                                    <DocumentTextIcon className="w-14 h-14 text-emerald-500" />
                                </motion.div>
                                
                                <h3 className="text-3xl font-[900] text-slate-900 dark:text-white mb-4 tracking-tight">Ruang Kosong</h3>
                                <p className="text-lg font-medium text-slate-500 dark:text-slate-400 mb-10 max-w-md mx-auto leading-relaxed">
                                    Mulai tuangkan ide berlianmu ke dalam dokumen pertamamu sekarang.
                                </p>
                                
                                <button
                                    onClick={handleCreateDocument}
                                    className="inline-flex items-center gap-3 px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-full shadow-lg hover:scale-105 transition-transform"
                                >
                                    <PlusIcon className="w-5 h-5 stroke-2" />
                                    Mulai Menulis
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}