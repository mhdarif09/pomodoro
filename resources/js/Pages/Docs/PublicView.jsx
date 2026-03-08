import { Head, Link } from '@inertiajs/react';
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";

const styles = `
.bn-container[data-color-scheme="light"] .bn-editor {
  background-color: transparent !important;
}
.bn-container .bn-editor {
    padding-left: 0 !important;
    padding-right: 0 !important;
}
`;

export default function PublicView({ document }) {
    const editor = useCreateBlockNote({
        initialContent: document.content && Array.isArray(document.content) ? document.content : undefined,
        editable: false,
    });
    
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('id-ID', options);
    };

    return (
        <>
            <Head title={document.title || 'Dokumen Dibagikan'} />
            <style>{styles}</style>
            
            <div className="min-h-screen bg-white dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-200">
                <main className="max-w-4xl mx-auto px-6 sm:px-8 py-16 sm:py-24">
                    <div className="bg-slate-100 dark:bg-slate-800/50 p-3 rounded-lg text-center text-sm mb-12">
                        Lihat, tulis, dan kolaborasi di dokumen Anda sendiri.{" "}
                        <Link href={route('register')} className="font-semibold text-emerald-500 hover:underline">
                            Coba gratis
                        </Link>
                        {" "}atau{" "}
                        <Link href={route('login')} className="font-semibold text-emerald-500 hover:underline">
                            masuk
                        </Link>.
                    </div>

                    <header className="mb-12">
                        <div className="text-6xl sm:text-7xl mb-6">📄</div>
                        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight mb-4">
                            {document.title || 'Dokumen Tanpa Judul'}
                        </h1>
                        <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                            {document.user && (
                                <>
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 text-xs font-semibold mr-2">{document.user.name.charAt(0)}</span>
                                    <span>Oleh {document.user.name}</span>
                                    <span className="mx-2">•</span>
                                </>
                            )}
                            <span>Terakhir diperbarui {formatDate(document.updated_at)}</span>
                        </div>
                    </header>
                    
                    <div className="prose prose-lg dark:prose-invert max-w-none">
                        {editor && document.content ? (
                            <BlockNoteView editor={editor} theme="light" />
                        ) : (
                            <p className="text-slate-500 italic">Dokumen ini tidak memiliki konten.</p>
                        )}
                    </div>
                </main>

                <footer className="max-w-4xl mx-auto px-6 sm:px-8 pb-8">
                     <p className="text-xs text-center text-slate-400 dark:text-slate-600">
                         Dibagikan melalui aplikasi dokumen cerdas
                     </p>
                </footer>
            </div>
        </>
    );
}