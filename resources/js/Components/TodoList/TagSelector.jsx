import { useState, useEffect, useRef } from 'react';
import { PlusIcon, XMarkIcon, TagIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const COLORS = [
    { name: 'Biru', value: '#3B82F6', bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300' },
    { name: 'Hijau', value: '#10B981', bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300' },
    { name: 'Kuning', value: '#F59E0B', bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300' },
    { name: 'Merah', value: '#EF4444', bg: 'bg-rose-100 dark:bg-rose-900/30', text: 'text-rose-700 dark:text-rose-300' },
    { name: 'Ungu', value: '#8B5CF6', bg: 'bg-violet-100 dark:bg-violet-900/30', text: 'text-violet-700 dark:text-violet-300' },
    { name: 'Pink', value: '#EC4899', bg: 'bg-pink-100 dark:bg-pink-900/30', text: 'text-pink-700 dark:text-pink-300' },
    { name: 'Oranye', value: '#F97316', bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-300' },
    { name: 'Teal', value: '#14B8A6', bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300' },
];

export default function TagSelector({ selectedTags = [], onTagsChange }) {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [availableTags, setAvailableTags] = useState([]);
    const [isCreating, setIsCreating] = useState(false);
    const [selectedColor, setSelectedColor] = useState(COLORS[0].value);
    const wrapperRef = useRef(null);

    useEffect(() => {
        fetchTags();
    }, []);

    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchTags = async () => {
        try {
            const response = await axios.get(route('tags.index'));
            setAvailableTags(response.data);
        } catch (error) {
            console.error('Failed to fetch tags:', error);
        }
    };

    const handleCreateTag = async () => {
        if (!query.trim()) return;

        try {
            const response = await axios.post(route('tags.store'), {
                name: query,
                color: selectedColor,
            });

            const newTag = response.data;
            setAvailableTags([...availableTags, newTag]);
            onTagsChange([...selectedTags, newTag.id]); // Auto-select created tag
            setQuery('');
            setIsCreating(false);
        } catch (error) {
            console.error('Failed to create tag:', error);
        }
    };

    const toggleTag = (tagId) => {
        const newSelected = selectedTags.includes(tagId)
            ? selectedTags.filter(id => id !== tagId)
            : [...selectedTags, tagId];
        onTagsChange(newSelected);
    };

    const filteredTags = availableTags.filter(tag =>
        tag.name.toLowerCase().includes(query.toLowerCase())
    );

    // Helper to get tailwind classes for custom hex color
    const getTagStyle = (hexColor) => {
        const preset = COLORS.find(c => c.value === hexColor);
        if (preset) return `${preset.bg} ${preset.text}`;

        // Fallback for custom colors (not used yet but good for future)
        return 'bg-slate-100 text-slate-700';
    };

    return (
        <div className="relative" ref={wrapperRef}>
            <div className="flex flex-wrap gap-2 mb-2 p-2 border border-slate-300 dark:border-slate-600 rounded-md min-h-[42px] bg-white dark:bg-slate-800 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-500 cursor-text" onClick={() => setIsOpen(true)}>
                {selectedTags.length > 0 ? (
                    selectedTags.map(tagId => {
                        const tag = availableTags.find(t => t.id === tagId);
                        if (!tag) return null;
                        return (
                            <span key={tag.id} className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getTagStyle(tag.color)}`}>
                                {tag.name}
                                <button type="button" onClick={(e) => { e.stopPropagation(); toggleTag(tag.id); }} className="ml-1 hover:text-rose-500">
                                    <XMarkIcon className="w-3 h-3" />
                                </button>
                            </span>
                        );
                    })
                ) : (
                    <span className="text-slate-400 text-sm flex items-center gap-1"><TagIcon className="w-4 h-4" /> Tambah tags...</span>
                )}
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 rounded-md shadow-lg border border-slate-200 dark:border-slate-700 p-2"
                    >
                        <input
                            type="text"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            placeholder="Cari atau buat tag baru..."
                            className="w-full text-sm border-slate-300 dark:border-slate-700 rounded-md mb-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-slate-700 dark:text-white"
                            autoFocus
                        />

                        <div className="max-h-48 overflow-y-auto space-y-1">
                            {filteredTags.map(tag => (
                                <button
                                    key={tag.id}
                                    type="button"
                                    onClick={() => toggleTag(tag.id)}
                                    className="w-full flex items-center justify-between px-2 py-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-left text-sm"
                                >
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getTagStyle(tag.color)}`}>
                                        {tag.name}
                                    </span>
                                    {selectedTags.includes(tag.id) && <span className="text-emerald-500">✓</span>}
                                </button>
                            ))}

                            {query && !filteredTags.find(t => t.name.toLowerCase() === query.toLowerCase()) && (
                                <div className="p-2 border-t border-slate-100 dark:border-slate-700 mt-2">
                                    <p className="text-xs text-slate-500 mb-2">Buat tag "{query}"</p>
                                    <div className="flex gap-2 mb-2">
                                        {COLORS.map(c => (
                                            <button
                                                key={c.value}
                                                type="button"
                                                onClick={() => setSelectedColor(c.value)}
                                                className={`w-5 h-5 rounded-full border ${selectedColor === c.value ? 'ring-2 ring-offset-2 ring-emerald-500 border-transparent' : 'border-slate-200'}`}
                                                style={{ backgroundColor: c.value }}
                                            />
                                        ))}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleCreateTag}
                                        className="w-full py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 rounded text-xs font-medium hover:bg-emerald-100"
                                    >
                                        + Buat Tag Baru
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
