import { Head, Link } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import Editor from '@/Components/Docs/Editor';
import EditorLayout from '@/Layouts/EditorLayout';
import mammoth from 'mammoth';
import {
    LockClosedIcon, MagnifyingGlassIcon, ChatBubbleLeftRightIcon, ListBulletIcon,
    ChevronLeftIcon, DocumentArrowUpIcon, ChevronDownIcon, ChevronUpIcon, XMarkIcon,
    ArrowDownTrayIcon, ShareIcon, ClipboardDocumentIcon, CheckCircleIcon, GlobeAltIcon,
    UserPlusIcon, EnvelopeIcon, CheckIcon, PlusIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid, ListBulletIcon as ListBulletSolid } from '@heroicons/react/24/solid';
import TextareaAutosize from 'react-textarea-autosize';
import { motion, AnimatePresence } from 'framer-motion';

// --- COMPONENTS ---

const FloatingToolbarButton = ({ title, onClick, children, active }) => (
    <button 
        title={title} 
        onClick={onClick} 
        className={`h-10 w-10 flex items-center justify-center rounded-full transition-all duration-300 ease-out
            ${active 
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-lg scale-110' 
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'
            }`}
    >
        {children}
    </button>
);

const ToolbarSeparator = () => (<div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>);

// --- TASK SIDEBAR COMPONENT (Apple Reminders Style) ---
function TaskSidebar({ isOpen, onClose }) {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newTaskTitle, setNewTaskTitle] = useState('');

    useEffect(() => {
        if (isOpen) fetchTasks();
    }, [isOpen]);

    const fetchTasks = async () => {
        try {
            // Menggunakan API Kanban yang sudah ada
            const res = await axios.get(route('api.kanban.index'));
            // Gabungkan semua status untuk tampilan list sederhana
            const allTasks = [
                ...res.data.tasks.todo,
                ...res.data.tasks.in_progress,
                ...res.data.tasks.done
            ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            
            setTasks(allTasks);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleTask = async (task) => {
        // Optimistic UI Update
        const updatedTasks = tasks.map(t => 
            t.id === task.id ? { ...t, is_completed: !t.is_completed, status: !t.is_completed ? 'done' : 'todo' } : t
        );
        setTasks(updatedTasks);

        try {
            await axios.patch(route('api.tasks.toggle-complete', task.id));
        } catch (err) {
            console.error("Failed to toggle task", err);
            fetchTasks(); // Revert on error
        }
    };

    const handleAddTask = async (e) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;

        try {
            const res = await axios.post(route('api.tasks.store'), {
                title: newTaskTitle,
                status: 'todo',
                priority: 'Sedang'
            });
            setTasks([res.data.task, ...tasks]);
            setNewTaskTitle('');
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <motion.aside
            initial={{ x: 50, opacity: 0, width: 0 }}
            animate={{ x: 0, opacity: 1, width: 320 }}
            exit={{ x: 50, opacity: 0, width: 0 }}
            className="flex-shrink-0 ml-6 hidden xl:flex flex-col h-[calc(100vh-8rem)] sticky top-24"
        >
            <div className="bg-white/80 dark:bg-[#1C1C1E]/80 backdrop-blur-xl rounded-[2.5rem] border border-white/20 dark:border-white/10 shadow-xl h-full flex flex-col overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <h3 className="font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
                        <ListBulletSolid className="w-5 h-5 text-emerald-500" />
                        Tugas Saya
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><XMarkIcon className="w-5 h-5"/></button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
                    {loading ? (
                        <div className="text-center py-10 text-slate-400 text-sm">Memuat tugas...</div>
                    ) : tasks.length === 0 ? (
                        <div className="text-center py-10 text-slate-400 text-sm">Tidak ada tugas aktif.</div>
                    ) : (
                        tasks.map(task => (
                            <div key={task.id} className="group flex items-start gap-3 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer" onClick={() => handleToggleTask(task)}>
                                <div className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${task.is_completed ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 dark:border-slate-600 group-hover:border-emerald-500'}`}>
                                    {task.is_completed && <CheckIcon className="w-3.5 h-3.5 text-white stroke-[3]" />}
                                </div>
                                <span className={`text-sm font-medium leading-snug transition-all ${task.is_completed ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-200'}`}>
                                    {task.title}
                                </span>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-4 bg-slate-50/50 dark:bg-white/5 backdrop-blur-sm">
                    <form onSubmit={handleAddTask} className="relative">
                        <input 
                            type="text" 
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            placeholder="Tambah tugas baru..." 
                            className="w-full pl-4 pr-10 py-3 bg-white dark:bg-black/20 border-none rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500 shadow-sm"
                        />
                        <button type="submit" disabled={!newTaskTitle} className="absolute right-2 top-2 p-1 bg-emerald-500 text-white rounded-xl shadow-md hover:bg-emerald-600 disabled:opacity-50 transition-all">
                            <PlusIcon className="w-4 h-4" />
                        </button>
                    </form>
                </div>
            </div>
        </motion.aside>
    );
}

// --- MAIN PAGE ---

export default function Show({ document, auth }) {
    const [title, setTitle] = useState(document.title || '');
    const titleTimeoutRef = useRef(null);
    const editorRef = useRef(null);
    const fileInputRef = useRef(null);
    const [isSearching, setIsSearching] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showShareModal, setShowShareModal] = useState(false);
    const [showTasks, setShowTasks] = useState(false); // State untuk toggle sidebar task

    const handleTitleChange = (e) => {
        const newTitle = e.target.value;
        setTitle(newTitle);
        if (titleTimeoutRef.current) clearTimeout(titleTimeoutRef.current);
        titleTimeoutRef.current = setTimeout(() => {
            axios.patch(route('api.documents.update', document.id), {
                title: newTitle
            }).catch(err => console.error("Failed to update title", err));
        }, 1500);
    };

    const triggerFileImport = () => fileInputRef.current.click();

    const saveImportedContent = () => {
        if (!editorRef.current) return;
        let contentToSave;
        try { contentToSave = JSON.stringify(editorRef.current.document); }
        catch (error) { console.error("Gagal menyimpan konten:", error); return; }

        axios.patch(route('api.documents.update', document.id), {
            content: contentToSave
        }).then(() => console.log("Saved"))
          .catch(err => console.error("Error saving", err));
    };

    const handleFileImport = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        if (file.name.endsWith('.docx')) {
            reader.onload = (e) => mammoth.convertToHtml({ arrayBuffer: e.target.result })
                .then(result => {
                    editorRef.current.insertHTML(result.value);
                    setTimeout(saveImportedContent, 100);
                });
            reader.readAsArrayBuffer(file);
        }
        event.target.value = null;
    };

    const handleSearch = (direction = 'forward') => {
        if (searchTerm) window.find(searchTerm, false, direction === 'backward', true, false, true, false);
    };

    return (
        <>
            <Head title={title || 'Untitled'} />
            <EditorLayout>
                <CollaborationModal
                    show={showShareModal}
                    onClose={() => setShowShareModal(false)}
                    document={document}
                    currentUser={auth.user}
                />
                <input type="file" ref={fileInputRef} onChange={handleFileImport} style={{ display: 'none' }} accept=".docx" />
                
                <main className="relative min-h-screen font-sans bg-[#F5F5F7] dark:bg-[#000000] selection:bg-emerald-500/30">
                    
                    {/* FLOATING TOOLBAR */}
                    <div className="fixed top-6 left-0 right-0 z-50 flex justify-center pointer-events-none px-4">
                        <motion.div 
                            initial={{ y: -50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="pointer-events-auto flex items-center gap-1.5 p-2 bg-white/80 dark:bg-[#1C1C1E]/80 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-full shadow-2xl shadow-black/10 overflow-x-auto scrollbar-hide"
                        >
                            {!isSearching ? (
                                <>
                                    <Link href={route('docs.index')}>
                                        <FloatingToolbarButton title="Kembali"><ChevronLeftIcon className="w-5 h-5 stroke-2" /></FloatingToolbarButton>
                                    </Link>
                                    <ToolbarSeparator />
                                    <FloatingToolbarButton title="Impor File" onClick={triggerFileImport}><DocumentArrowUpIcon className="w-5 h-5" /></FloatingToolbarButton>
                                    <a href={route('docs.export', document.id)}>
                                        <FloatingToolbarButton title="Ekspor"><ArrowDownTrayIcon className="w-5 h-5" /></FloatingToolbarButton>
                                    </a>
                                    <ToolbarSeparator />
                                    <FloatingToolbarButton title="Tasks" onClick={() => setShowTasks(!showTasks)} active={showTasks}><CheckCircleIcon className="w-5 h-5" /></FloatingToolbarButton>
                                    <FloatingToolbarButton title="Bagikan" onClick={() => setShowShareModal(true)}><ShareIcon className="w-5 h-5" /></FloatingToolbarButton>
                                    <FloatingToolbarButton title="Cari" onClick={() => setIsSearching(true)}><MagnifyingGlassIcon className="w-5 h-5" /></FloatingToolbarButton>
                                </>
                            ) : (
                                <>
                                    <div className="flex items-center px-4 bg-slate-100 dark:bg-slate-800 rounded-full ml-1">
                                        <input type="text" placeholder="Cari..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} className="h-9 w-32 sm:w-48 bg-transparent border-none focus:ring-0 text-sm p-0" autoFocus />
                                    </div>
                                    <FloatingToolbarButton onClick={() => handleSearch('backward')}><ChevronUpIcon className="w-5 h-5" /></FloatingToolbarButton>
                                    <FloatingToolbarButton onClick={() => handleSearch('forward')}><ChevronDownIcon className="w-5 h-5" /></FloatingToolbarButton>
                                    <FloatingToolbarButton onClick={() => setIsSearching(false)}><XMarkIcon className="w-5 h-5" /></FloatingToolbarButton>
                                </>
                            )}
                        </motion.div>
                    </div>

                    {/* LAYOUT CONTAINER */}
                    <div className="flex justify-center min-h-screen pt-28 pb-20 px-4 sm:px-6">
                        
                        {/* EDITOR CANVAS (Full Size / Expanded) */}
                        <motion.div 
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0, width: showTasks ? 'auto' : '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className={`bg-white dark:bg-[#1C1C1E] min-h-[85vh] shadow-2xl shadow-slate-200/50 dark:shadow-none rounded-[3rem] px-8 sm:px-16 py-16 sm:py-20 border border-white/50 dark:border-slate-800 w-full ${showTasks ? 'max-w-4xl' : 'max-w-6xl'} transition-all duration-500`}
                        >
                            <div className="mb-8 group">
                                <div className="text-6xl mb-6 opacity-50 group-hover:opacity-100 transition-opacity cursor-pointer w-fit">📄</div>
                                <TextareaAutosize 
                                    cacheMeasurements 
                                    value={title} 
                                    onChange={handleTitleChange} 
                                    placeholder="Judul Dokumen" 
                                    className="w-full bg-transparent text-slate-900 dark:text-white resize-none outline-none border-none p-0 text-4xl sm:text-5xl font-[900] tracking-tighter placeholder:text-slate-300 dark:placeholder:text-slate-700 leading-tight focus:ring-0" 
                                />
                            </div>
                            <div className="prose prose-lg prose-slate dark:prose-invert max-w-none">
                                <Editor document={document} editorRef={editorRef} />
                            </div>
                        </motion.div>

                        {/* TASK SIDEBAR (Toggleable) */}
                        <AnimatePresence>
                            {showTasks && (
                                <TaskSidebar isOpen={showTasks} onClose={() => setShowTasks(false)} />
                            )}
                        </AnimatePresence>

                    </div>
                </main>
            </EditorLayout>
        </>
    );
}

// --- MODAL KOLABORASI ---
function CollaborationModal({ show, onClose, document: initialDocument, currentUser }) {
    const [docData, setDocData] = useState(initialDocument);
    const [isPublic, setIsPublic] = useState(docData.is_public);
    const [shareUrl, setShareUrl] = useState(docData.share_url || '');
    const [inviteEmail, setInviteEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

    if (!show) return null;
    const isOwner = currentUser.id === docData.user_id;

    const handleToggleSharing = () => {
        setIsLoading(true);
        axios.post(route('api.documents.toggle-sharing', docData.id))
            .then(res => {
                setIsPublic(res.data.is_public);
                setShareUrl(res.data.share_url || '');
            })
            .catch(() => setStatusMsg({ type: 'error', text: 'Gagal update sharing.' }))
            .finally(() => setIsLoading(false));
    };

    const handleInvite = (e) => {
        e.preventDefault();
        setIsLoading(true);
        axios.post(route('api.documents.invite', docData.id), { email: inviteEmail })
            .then(res => {
                setStatusMsg({ type: 'success', text: 'Undangan terkirim.' });
                setInviteEmail('');
                setDocData(prev => ({ ...prev, collaborators: [...prev.collaborators, res.data.collaborator] }));
            })
            .catch(err => setStatusMsg({ type: 'error', text: err.response?.data?.message || 'Gagal mengundang.' }))
            .finally(() => setIsLoading(false));
    };

    return (
        <AnimatePresence>
            {show && (
                <>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]" onClick={onClose} />
                    <div className="fixed inset-0 flex items-center justify-center z-[70] p-4 pointer-events-none">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-lg bg-white dark:bg-[#1C1C1E] rounded-[2.5rem] shadow-2xl p-8 pointer-events-auto border border-white/10" onClick={e => e.stopPropagation()}>
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-[900] dark:text-white">Bagikan</h3>
                                <button onClick={onClose} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full"><XMarkIcon className="w-5 h-5"/></button>
                            </div>
                            
                            {isOwner && (
                                <form onSubmit={handleInvite} className="mb-6">
                                    <div className="flex gap-2">
                                        <input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="Email teman..." className="flex-1 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-4 focus:ring-2 focus:ring-emerald-500" required />
                                        <button type="submit" disabled={isLoading} className="bg-emerald-500 text-white px-5 rounded-2xl font-bold text-sm hover:bg-emerald-600 disabled:opacity-50">Undang</button>
                                    </div>
                                    {statusMsg.text && <p className={`text-xs mt-2 font-bold ${statusMsg.type === 'error' ? 'text-red-500' : 'text-emerald-500'}`}>{statusMsg.text}</p>}
                                </form>
                            )}

                            <div className="space-y-3 mb-6">
                                <p className="text-xs font-bold text-slate-400 uppercase">Akses</p>
                                <div className="flex items-center gap-3 p-2">
                                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-600">{docData.user.name[0]}</div>
                                    <div className="text-sm"><p className="font-bold dark:text-white">{docData.user.name}</p><p className="text-xs text-slate-500">Pemilik</p></div>
                                </div>
                                {docData.collaborators.map(u => (
                                    <div key={u.id} className="flex items-center gap-3 p-2">
                                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">{u.name[0]}</div>
                                        <div className="text-sm"><p className="font-bold dark:text-white">{u.name}</p><p className="text-xs text-slate-500">Editor</p></div>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                <div><h4 className="font-bold dark:text-white">Link Publik</h4><p className="text-xs text-slate-500">Siapapun dengan link</p></div>
                                <button onClick={handleToggleSharing} className={`w-12 h-7 rounded-full p-1 transition-colors ${isPublic ? 'bg-emerald-500' : 'bg-slate-200'}`}><div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${isPublic ? 'translate-x-5' : ''}`} /></button>
                            </div>
                            
                            {isPublic && (
                                <div className="mt-4 flex gap-2">
                                    <div className="flex-1 bg-slate-100 dark:bg-slate-800 p-3 rounded-xl text-xs truncate font-mono dark:text-slate-300">{shareUrl}</div>
                                    <button onClick={() => navigator.clipboard.writeText(shareUrl)} className="bg-white border border-slate-200 p-3 rounded-xl hover:bg-slate-50"><ClipboardDocumentIcon className="w-4 h-4"/></button>
                                </div>
                            )}
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}