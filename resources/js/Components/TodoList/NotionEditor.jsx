import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { Extension } from '@tiptap/core';
import Suggestion from '@tiptap/suggestion';
import { ReactRenderer } from '@tiptap/react';
import tippy from 'tippy.js';
import {
    BoldIcon, ItalicIcon, ListBulletIcon,
    QueueListIcon, CodeBracketIcon, SparklesIcon,
    LanguageIcon, BookOpenIcon, PencilSquareIcon
} from '@heroicons/react/24/outline';
import CommandList from './Extensions/CommandList';
import axios from 'axios';

// --- Slash Command Extension Definition ---
const SlashCommand = Extension.create({
    name: 'slashCommand',
    addOptions() {
        return {
            suggestion: {
                char: '/',
                command: ({ editor, range, props }) => {
                    props.command({ editor, range });
                },
            },
        };
    },
    addProseMirrorPlugins() {
        return [
            Suggestion({
                editor: this.editor,
                ...this.options.suggestion,
            }),
        ];
    },
});

export default function ModernEditor({ content, onChange, editable = true, enableAi = true }) {

    const handleAICommand = async (editor, range, item) => {
        // 1. Delete the slash command query
        editor.chain().focus().deleteRange(range).run();

        // 2. Insert Loading State
        const loadingPos = editor.state.selection.from;
        editor.chain().focus().insertContent('<span class="text-slate-400 italic animate-pulse">✨ AI sedang berpikir...</span>').run();

        try {
            // 3. Call API
            const response = await axios.post(route('api.ai.text-action'), {
                action: item.title,
                context: editor.getText(), // Send plain text for better context processing
                marketing_mode: false
            });

            // 4. Replace Loading with Result
            // We select the range where we inserted the loading text. 
            // Since it's just a span, we can try to undo? No, that's risky.
            // Let's just delete the range of the inserted loading text.
            // Approximate length of "✨ AI sedang berpikir..." is 24 chars + span tags.
            // A safer way: Select the whole document and replace? No.
            // Let's just use `undo` to remove the loading text, then insert.
            editor.chain().focus().undo().run();

            if (response.data && response.data.text) {
                editor.chain().focus().insertContent(response.data.text).run();
            }

        } catch (error) {
            console.error("AI Error:", error);
            editor.chain().focus().undo().run(); // Remove loading
            // Optional: Insert error message
            // editor.chain().focus().insertContent('<span class="text-red-500 text-xs">Gagal.</span>').run();
        }
    };

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                bulletList: { keepMarks: true, keepAttributes: false },
                orderedList: { keepMarks: true, keepAttributes: false },
            }),
            Placeholder.configure({
                placeholder: enableAi ? 'Ketik "/" untuk perintah AI...' : 'Mulai menulis...',
            }),
            TaskList,
            TaskItem.configure({ nested: true }),
            enableAi ? SlashCommand.configure({
                suggestion: {
                    items: ({ query }) => {
                        return [
                            { title: 'Lanjutkan Tulisan', description: 'AI melanjutkan kalimatmu.', icon: PencilSquareIcon },
                            { title: 'Ringkas Teks', description: 'Buat kesimpulan singkat.', icon: ListBulletIcon },
                            { title: 'Perbaiki Ejaan', description: 'Koreksi tata bahasa.', icon: SparklesIcon },
                            { title: 'Sederhanakan', description: 'Buat kalimat lebih mudah dipahami.', icon: BookOpenIcon },
                            { title: 'Cari Ide', description: 'Brainstorming ide kreatif.', icon: SparklesIcon },
                            { title: 'Terjemahkan', description: 'Indonesia <-> Inggris.', icon: LanguageIcon },
                        ].filter(item => item.title.toLowerCase().startsWith(query.toLowerCase()));
                    },
                    render: () => {
                        let component;
                        let popup;

                        return {
                            onStart: props => {
                                component = new ReactRenderer(CommandList, {
                                    props,
                                    editor: props.editor,
                                });

                                if (!props.clientRect) return;

                                popup = tippy('body', {
                                    getReferenceClientRect: props.clientRect,
                                    appendTo: () => document.body,
                                    content: component.element,
                                    showOnCreate: true,
                                    interactive: true,
                                    trigger: 'manual',
                                    placement: 'bottom-start',
                                });
                            },
                            onUpdate(props) {
                                component.updateProps(props);
                                if (!props.clientRect) return;
                                if (popup && popup[0]) {
                                    popup[0].setProps({ getReferenceClientRect: props.clientRect });
                                }
                            },
                            onKeyDown(props) {
                                if (props.event.key === 'Escape') {
                                    if (popup && popup[0]) popup[0].hide();
                                    return true;
                                }
                                return component.ref?.onKeyDown(props);
                            },
                            onExit() {
                                if (popup && popup[0]) popup[0].destroy();
                                component.destroy();
                            },
                        };
                    },
                    command: ({ editor, range, props }) => {
                        handleAICommand(editor, range, props);
                    },
                },
            }) : null, // Disable SlashCommand if enableAi is false
        ].filter(Boolean), // Filter out null extensions
        content: content,
        editable: editable,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose dark:prose-invert max-w-none focus:outline-none min-h-[150px] px-4 py-3',
            },
        },
    });

    if (!editor) return null;

    const MenuButton = ({ onClick, isActive, children, title }) => (
        <button
            type="button"
            onClick={onClick}
            title={title}
            className={`p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition ${isActive ? 'bg-slate-200 dark:bg-slate-700 text-emerald-600' : 'text-slate-500 dark:text-slate-400'}`}
        >
            {children}
        </button>
    );

    return (
        <div className={`border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden ${editable ? 'bg-white dark:bg-slate-800' : 'bg-slate-50 dark:bg-slate-900 border-none'}`}>
            {editable && (
                <div className="flex items-center gap-1 p-2 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 overflow-x-auto">
                    <MenuButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} title="Bold (Ctrl+B)"><BoldIcon className="w-4 h-4" /></MenuButton>
                    <MenuButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} title="Italic (Ctrl+I)"><ItalicIcon className="w-4 h-4" /></MenuButton>
                    <div className="w-px h-4 bg-slate-300 dark:bg-slate-600 mx-1"></div>
                    <MenuButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} title="Bullet List"><ListBulletIcon className="w-4 h-4" /></MenuButton>
                    <MenuButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} title="Ordered List"><QueueListIcon className="w-4 h-4" /></MenuButton>
                    <MenuButton onClick={() => editor.chain().focus().toggleTaskList().run()} isActive={editor.isActive('taskList')} title="Task List"><span className="text-xs font-bold border border-current rounded px-0.5">✓</span></MenuButton>
                    <div className="w-px h-4 bg-slate-300 dark:bg-slate-600 mx-1"></div>
                    <MenuButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} isActive={editor.isActive('codeBlock')} title="Code Block"><CodeBracketIcon className="w-4 h-4" /></MenuButton>
                </div>
            )}
            <EditorContent editor={editor} className={!editable ? 'pointer-events-none' : ''} />
            <style>{`
                .ProseMirror ul[data-type="taskList"] { list-style: none; padding: 0; }
                .ProseMirror li[data-type="taskItem"] { display: flex; gap: 0.5rem; alignItems: flex-start; margin-bottom: 0.25rem; }
                .ProseMirror li[data-type="taskItem"] input[type="checkbox"] { margin-top: 0.3rem; cursor: pointer; }
                .ProseMirror p.is-editor-empty:first-child::before { color: #94a3b8; content: attr(data-placeholder); float: left; height: 0; pointer-events: none; }
                /* Tippy Customization for Slash Menu */
                .tippy-box[data-theme~='light'] { background-color: white; color: black; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); border-radius: 12px; }
            `}</style>
        </div>
    );
}
