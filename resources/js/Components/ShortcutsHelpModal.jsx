import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '../Contexts/LanguageContext';

export default function ShortcutsHelpModal({ isOpen, onClose }) {
    const { t } = useLanguage();

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 dark:border-slate-800"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                            <h2 className="text-lg font-bold flex items-center gap-2 text-slate-800 dark:text-white">
                                <span className="text-xl">⌨️</span> {t('shortcuts_title')}
                            </h2>
                            <button onClick={onClose} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
                                <XMarkIcon className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6">
                            <div>
                                <h3 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    {t('shortcuts_nav')}
                                </h3>
                                <div className="grid grid-cols-1 gap-3">
                                    <ShortcutRow label={t('nav_dashboard')} keys={['Alt', '1']} />
                                    <ShortcutRow label={t('nav_gamification')} keys={['Alt', '2']} />
                                    <ShortcutRow label={t('nav_ai_genius')} keys={['Alt', '3']} />
                                    <ShortcutRow label={t('nav_learning')} keys={['Alt', '4']} />
                                    <ShortcutRow label={t('nav_docs')} keys={['Alt', '5']} />
                                </div>
                            </div>

                            <div>
                                <h3 className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    {t('shortcuts_actions')}
                                </h3>
                                <div className="grid grid-cols-1 gap-3">
                                    <ShortcutRow label={t('shortcut_help')} keys={['?']} />
                                    <ShortcutRow label="Focus / Break" keys={['Space']} />
                                    <ShortcutRow label={t('minimize')} keys={['Esc']} />
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-3 bg-slate-50 dark:bg-slate-900/50 text-center text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                            Power User Mode
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

const ShortcutRow = ({ label, keys }) => (
    <div className="flex justify-between items-center group">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-emerald-600 transition-colors">{label}</span>
        <div className="flex gap-1">
            {keys.map(k => (
                <kbd key={k} className="px-2 py-1 min-w-[28px] text-center text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-[6px] dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700 font-mono shadow-[0_2px_0_0_rgba(0,0,0,0.05)]">
                    {k}
                </kbd>
            ))}
        </div>
    </div>
);
