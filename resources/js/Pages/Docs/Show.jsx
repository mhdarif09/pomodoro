import { Head, Link } from '@inertiajs/react';
import { useState, useRef } from 'react';
import Editor from '@/Components/Docs/Editor';
import EditorLayout from '@/Layouts/EditorLayout';
import mammoth from 'mammoth';
import {
    LockClosedIcon, MagnifyingGlassIcon, ChatBubbleLeftRightIcon, ListBulletIcon,
    ChevronLeftIcon, DocumentArrowUpIcon, ChevronDownIcon, ChevronUpIcon, XMarkIcon,
    ArrowDownTrayIcon, ShareIcon, ClipboardDocumentIcon, CheckCircleIcon, GlobeAltIcon,
    UserPlusIcon, EnvelopeIcon
} from '@heroicons/react/24/outline';
import TextareaAutosize from 'react-textarea-autosize';

const FloatingToolbarButton = ({ title, onClick, children }) => (
    <button title={title} onClick={onClick} className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
        {children}
    </button>
);

const ToolbarSeparator = () => (<div className="h-5 w-px bg-slate-200 dark:bg-slate-600"></div>);

export default function Show({ document, auth }) {
    const [title, setTitle] = useState(document.title || '');
    const titleTimeoutRef = useRef(null);
    const editorRef = useRef(null);
    const fileInputRef = useRef(null);
    const [isSearching, setIsSearching] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showShareModal, setShowShareModal] = useState(false);

    const handleTitleChange = (e) => {
        const newTitle = e.target.value;
        setTitle(newTitle);
        if (titleTimeoutRef.current) clearTimeout(titleTimeoutRef.current);
        titleTimeoutRef.current = setTimeout(() => {
            const csrfToken = window.document.querySelector('meta[name="csrf-token"]').getAttribute('content');
            const formData = new FormData();
            formData.append('_method', 'put');
            formData.append('title', newTitle);
            fetch(`/docs/${document.id}`, {
                method: 'POST',
                headers: { 'X-CSRF-TOKEN': csrfToken, 'Accept': 'application/json' },
                body: formData,
            });
        }, 1500);
    };

    const triggerFileImport = () => fileInputRef.current.click();

    const saveImportedContent = () => {
        if (!editorRef.current) return;
        let contentToSave;
        try { contentToSave = JSON.stringify(editorRef.current.document); }
        catch (error) { console.error("Gagal menyimpan konten yang diimpor:", error); return; }
        const csrfToken = window.document.querySelector('meta[name="csrf-token"]').getAttribute('content');
        const formData = new FormData();
        formData.append('_method', 'put');
        formData.append('content', contentToSave);
        fetch(`/docs/${document.id}`, { method: 'POST', headers: { 'X-CSRF-TOKEN': csrfToken, 'Accept': 'application/json' }, body: formData, })
            .then(response => response.ok && console.log("✅ Konten impor berhasil disimpan!"));
    };

    const handleFileImport = (event) => {
        const file = event.target.files[0];
        if (!file || !editorRef.current) return;
        const reader = new FileReader();
        const docxMimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        const isDocx = file.type === docxMimeType || file.name.endsWith('.docx');
        const isPlainText = file.type.startsWith('text/') || file.name.endsWith('.md');
        if (isDocx) {
            reader.onload = (e) => mammoth.convertToHtml({ arrayBuffer: e.target.result })
                .then(result => {
                    editorRef.current.replaceBlocks(editorRef.current.topLevelBlocks, []);
                    editorRef.current.insertHTML(result.value);
                    setTimeout(saveImportedContent, 100);
                }).catch(err => alert("Gagal memproses file. Pastikan file adalah format .docx yang valid dan tidak rusak."));
            reader.readAsArrayBuffer(file);
        } else if (isPlainText) {
            reader.onload = (e) => {
                const newBlocks = e.target.result.split('\n').map(line => ({ type: 'paragraph', content: [{ type: 'text', text: line }] }));
                editorRef.current.replaceBlocks(editorRef.current.topLevelBlocks, newBlocks);
                setTimeout(saveImportedContent, 100);
            };
            reader.readAsText(file);
        } else {
            alert(`Format file tidak didukung.`);
        }
        event.target.value = null; 
    };
    
    const handleSearch = (direction = 'forward') => {
        if (searchTerm) window.find(searchTerm, false, direction === 'backward', true, false, true, false);
    };

    const placeholderAction = (feature) => alert(`${feature} belum diimplementasikan.`);

    return (
        <>
            <Head title={title || 'Untitled Document'} />
            <EditorLayout>
                <CollaborationModal 
                    show={showShareModal} 
                    onClose={() => setShowShareModal(false)} 
                    document={document}
                    currentUser={auth.user}
                />
                <input type="file" ref={fileInputRef} onChange={handleFileImport} style={{ display: 'none' }} accept=".txt,.md,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"/>
                <main className="relative flex flex-col h-screen font-sans bg-white dark:bg-slate-900">
                    <div className="absolute top-0 left-0 right-0 z-20 h-20 pointer-events-none">
                        <div className="max-w-4xl mx-auto flex justify-center items-start pt-3">
                            {!isSearching ? (
                                <div className="pointer-events-auto flex items-center gap-1 p-1 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg">
                                    <Link href={route('docs.index')}>
                                        <FloatingToolbarButton title="Kembali ke Beranda"><ChevronLeftIcon className="w-5 h-5" /></FloatingToolbarButton>
                                    </Link>
                                    <FloatingToolbarButton title="Daftar Isi" onClick={() => placeholderAction('Daftar Isi')}><ListBulletIcon className="w-5 h-5" /></FloatingToolbarButton>
                                    <ToolbarSeparator />
                                    <FloatingToolbarButton title="Impor File" onClick={triggerFileImport}><DocumentArrowUpIcon className="w-5 h-5" /></FloatingToolbarButton>
                                    <a href={route('docs.export', document.id)}>
                                        <FloatingToolbarButton title="Ekspor (.docx)"><ArrowDownTrayIcon className="w-5 h-5" /></FloatingToolbarButton>
                                    </a>
                                    <ToolbarSeparator />
                                    <FloatingToolbarButton title="Bagikan Dokumen" onClick={() => setShowShareModal(true)}><ShareIcon className="w-5 h-5" /></FloatingToolbarButton>
                                    <ToolbarSeparator />
                                    <FloatingToolbarButton title="Mode (Terkunci)" onClick={() => placeholderAction('Mode')}><LockClosedIcon className="w-5 h-5" /></FloatingToolbarButton>
                                    <ToolbarSeparator />
                                    <FloatingToolbarButton title="Cari" onClick={() => setIsSearching(true)}><MagnifyingGlassIcon className="w-5 h-5" /></FloatingToolbarButton>
                                </div>
                            ) : (
                                <div className="pointer-events-auto flex items-center gap-1 p-1 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg">
                                    <input type="text" placeholder="Cari dalam dokumen..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} className="h-8 px-2 text-sm bg-transparent outline-none text-slate-700 dark:text-slate-300 placeholder:text-slate-400 dark:placeholder:text-slate-500 w-48" autoFocus/>
                                    <FloatingToolbarButton title="Sebelumnya" onClick={() => handleSearch('backward')}><ChevronUpIcon className="w-5 h-5" /></FloatingToolbarButton>
                                    <FloatingToolbarButton title="Berikutnya" onClick={() => handleSearch('forward')}><ChevronDownIcon className="w-5 h-5" /></FloatingToolbarButton>
                                    <FloatingToolbarButton title="Tutup Pencarian" onClick={() => setIsSearching(false)}><XMarkIcon className="w-5 h-5" /></FloatingToolbarButton>
                                </div>
                            )}
                        </div>
                        <div className="absolute top-3 right-4 sm:right-6 pointer-events-auto">
                            <button onClick={() => placeholderAction('Komentar')} className="flex items-center gap-2 px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-md hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
                                <span className="text-slate-700 dark:text-slate-300">Comments</span>
                                <ChatBubbleLeftRightIcon className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                            </button>
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto pt-24 pb-16">
                        <div className="w-full max-w-4xl mx-auto px-6 sm:px-12 md:px-16">
                            <div className="mb-10">
                                <div className="text-5xl sm:text-6xl mb-4">📄</div>
                                <TextareaAutosize cacheMeasurements value={title} onChange={handleTitleChange} placeholder="Judul Halaman" className="w-full bg-transparent text-slate-900 dark:text-slate-100 resize-none outline-none border-none p-0 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight placeholder:text-slate-300 dark:placeholder:text-slate-700" />
                            </div>
                            <Editor document={document} editorRef={editorRef} />
                        </div>
                    </div>
                </main>
            </EditorLayout>
        </>
    );
}

function CollaborationModal({ show, onClose, document: initialDocument, currentUser }) {
    const [document, setDocument] = useState(initialDocument);
    const [isPublic, setIsPublic] = useState(document.is_public);
    const [shareUrl, setShareUrl] = useState(document.share_url || '');
    const [justCopied, setJustCopied] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteError, setInviteError] = useState('');
    const [inviteSuccess, setInviteSuccess] = useState('');

    if (!show) return null;

    const isOwner = currentUser.id === document.user_id;

    const handleToggleSharing = () => {
        setIsLoading(true);
        const csrfToken = window.document.querySelector('meta[name="csrf-token"]').getAttribute('content');
        
        fetch(route('docs.toggle-sharing', document.id), {
            method: 'POST',
            headers: { 'X-CSRF-TOKEN': csrfToken, 'Accept': 'application/json', 'Content-Type': 'application/json' },
        })
        .then(res => res.json())
        .then(data => {
            setIsPublic(data.is_public);
            setShareUrl(data.share_url || '');
        })
        .finally(() => setIsLoading(false));
    };

    const handleInvite = (e) => {
        e.preventDefault();
        setInviteError('');
        setInviteSuccess('');
        setIsLoading(true);

        const csrfToken = window.document.querySelector('meta[name="csrf-token"]').getAttribute('content');

        fetch(route('docs.invite', document.id), {
            method: 'POST',
            headers: { 'X-CSRF-TOKEN': csrfToken, 'Accept': 'application/json', 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: inviteEmail }),
        })
        .then(res => res.json().then(data => ({ status: res.status, body: data })))
        .then(({ status, body }) => {
            if (status >= 400) {
                setInviteError(body.message || 'Gagal mengundang pengguna.');
            } else {
                setInviteSuccess(body.message);
                setInviteEmail('');
                setDocument(prevDoc => ({
                    ...prevDoc,
                    collaborators: [...prevDoc.collaborators, body.collaborator]
                }));
            }
        })
        .finally(() => setIsLoading(false));
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(shareUrl).then(() => {
            setJustCopied(true);
            setTimeout(() => setJustCopied(false), 2000);
        });
    };

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-xl shadow-lg" onClick={e => e.stopPropagation()}>
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">Bagikan "{document.title || 'Dokumen'}"</h3>
                    
                    {isOwner && (
                        <form onSubmit={handleInvite} className="mt-4 flex space-x-2">
                            <div className="relative flex-1">
                                <EnvelopeIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input 
                                    type="email" 
                                    value={inviteEmail}
                                    onChange={e => setInviteEmail(e.target.value)}
                                    placeholder="Undang pengguna melalui email..." 
                                    className="w-full pl-10 pr-4 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" 
                                    required 
                                />
                            </div>
                            <button type="submit" disabled={isLoading} className="px-4 py-2 text-sm font-semibold text-white bg-emerald-500 hover:bg-emerald-600 rounded-md flex items-center justify-center transition-colors disabled:opacity-50">
                                <UserPlusIcon className="w-4 h-4 mr-2" />
                                Undang
                            </button>
                        </form>
                    )}
                    {inviteError && <p className="text-xs text-red-500 mt-1">{inviteError}</p>}
                    {inviteSuccess && <p className="text-xs text-green-500 mt-1">{inviteSuccess}</p>}
                </div>
                
                <div className="px-6 space-y-3 max-h-48 overflow-y-auto">
                     <p className="text-sm font-medium text-slate-800 dark:text-slate-200">Orang dengan akses</p>
                     <div className="flex items-center justify-between">
                         <div className="flex items-center space-x-3">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 text-sm font-semibold">{document.user.name.charAt(0)}</span>
                            <div>
                                <p className="text-sm font-medium text-slate-900 dark:text-white">{document.user.name}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{document.user.email}</p>
                            </div>
                         </div>
                         <p className="text-sm text-slate-500 dark:text-slate-400">Pemilik</p>
                     </div>
                     {document.collaborators.map(user => (
                         <div key={user.id} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 text-sm font-semibold">{user.name.charAt(0)}</span>
                                <div>
                                    <p className="text-sm font-medium text-slate-900 dark:text-white">{user.name}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                                </div>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">{user.pivot.role}</p>
                         </div>
                     ))}
                </div>

                <div className="p-6 border-t border-slate-200 dark:border-slate-700 mt-4">
                     <div className="flex items-center justify-between">
                        <div>
                             <h4 className="font-medium text-slate-800 dark:text-slate-200">Akses Umum</h4>
                             <p className="text-sm text-slate-500 dark:text-slate-400">{isPublic ? "Siapa saja dengan link dapat melihat" : "Dibatasi"}</p>
                        </div>
                        <button onClick={handleToggleSharing} disabled={isLoading} className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${isPublic ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-600'}`}>
                            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isPublic ? 'translate-x-5' : 'translate-x-0'}`}></span>
                        </button>
                     </div>

                    {isPublic && (
                        <div className="mt-4 flex space-x-2">
                             <input type="text" readOnly value={shareUrl} className="w-full flex-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-sm text-slate-700 dark:text-slate-300"/>
                             <button onClick={copyToClipboard} className="px-4 py-2 text-sm font-semibold text-emerald-600 bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20 rounded-md flex items-center justify-center transition-colors w-28">
                                 {justCopied ? (<><CheckCircleIcon className="w-4 h-4 mr-2" />Copied</>) : "Copy Link"}
                             </button>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}