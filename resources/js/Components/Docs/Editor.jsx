import { useMemo, useRef, useEffect } from 'react';
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView, lightDefaultTheme } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";

const customLightTheme = {
    ...lightDefaultTheme,
    colors: {
        ...lightDefaultTheme.colors,
        editor: { text: "#1e293b", background: "#ffffff" },
        menu: { text: "#334155", background: "#ffffff" },
        tooltip: { text: "#f8fafc", background: "#1e293b" },
        hovered: { text: "#1e293b", background: "#f1f5f9" },
        selected: { text: "#16a34a", background: "#ecfdf5" },
        border: "#e2e8f0",
    },
    borderRadius: 6,
    fontFamily: "Inter, -apple-system, sans-serif",
};

const customDarkTheme = {
    ...customLightTheme,
    colors: {
        ...customLightTheme.colors,
        editor: { text: "#cbd5e1", background: "#1e293b" },
        menu: { text: "#cbd5e1", background: "#283447" },
        tooltip: { text: "#1e293b", background: "#f1f5f9" },
        hovered: { text: "#f1f5f9", background: "#334155" },
        selected: { text: "#4ade80", background: "#1e392a" },
        border: "#334155",
    }
};

export default function Editor({ document, editorRef }) {
    const saveTimeoutRef = useRef(null);
    const isSavingRef = useRef(false);

    const initialContent = useMemo(() => {
        try {
            if (typeof document.content === 'string') {
                return JSON.parse(document.content);
            }
            if (Array.isArray(document.content)) {
                return document.content;
            }
        } catch (error) {
            console.error("Gagal parse konten awal:", error);
        }
        return undefined;
    }, [document.id]);

    const editor = useCreateBlockNote({ initialContent });

    useEffect(() => {
        if (editorRef) {
            editorRef.current = editor;
        }
    }, [editor, editorRef]);

    useEffect(() => {
        if (!editor) return;

        const handleChange = () => {
            if (isSavingRef.current) return;
            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

            saveTimeoutRef.current = setTimeout(() => {
                isSavingRef.current = true;
                
                let contentToSave;
                try {
                    contentToSave = JSON.stringify(editor.document);
                } catch (error) {
                    console.warn("Auto-save dibatalkan: state editor tidak stabil.", error);
                    isSavingRef.current = false;
                    return; 
                }

                const csrfToken = window.document.querySelector('meta[name="csrf-token"]').getAttribute('content');

                const formData = new FormData();
                formData.append('_method', 'put');
                formData.append('content', contentToSave);
                
                // --- INI PERUBAHANNYA ---
                // Mengganti hardcoded URL dengan helper route()
                fetch(route('docs.update', document.id), { 
                // -------------------------
                    method: 'POST',
                    headers: {
                        'X-CSRF-TOKEN': csrfToken,
                        'Accept': 'application/json',
                    },
                    body: formData,
                })
                .then(response => {
                    if (response.ok) {
                        console.log("✅ Auto-saved!");
                    } else {
                        console.error("❌ Save failed:", response.status, response.statusText);
                        response.json().then(data => console.error("Detail Error:", data));
                    }
                })
                .catch(error => {
                    console.error("❌ Network error on save:", error);
                })
                .finally(() => {
                    isSavingRef.current = false;
                });

            }, 1500);
        };

        const unsubscribe = editor.onChange(handleChange);
        return () => {
            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        };
    }, [editor, document.id]);

    if (!editor) {
        return <div className="animate-pulse h-96 w-full bg-slate-200 dark:bg-slate-700 rounded-md"></div>;
    }

    return (
        <BlockNoteView 
            editor={editor} 
            theme={{ light: customLightTheme, dark: customDarkTheme }}
        />
    );
}