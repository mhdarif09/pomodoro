import React, { useState, useEffect, useRef } from 'react';
import { Head, Link } from '@inertiajs/react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import {
    CheckIcon, ArrowRightIcon, ChevronLeftIcon,
    ClockIcon, UserGroupIcon, SparklesIcon,
    BoltIcon, ShieldCheckIcon, StarIcon,
    ArrowPathIcon, MusicalNoteIcon, FireIcon,
    MoonIcon, HandRaisedIcon, ChartBarIcon,
    TrophyIcon, FaceSmileIcon, SignalIcon,
    BookOpenIcon, ClipboardDocumentCheckIcon,
    BanknotesIcon, DocumentTextIcon,
    VideoCameraIcon, BookmarkIcon, QuestionMarkCircleIcon,
    ListBulletIcon, TagIcon, CalendarIcon,
    CurrencyDollarIcon, PresentationChartLineIcon, LinkIcon, PhotoIcon,
    FolderIcon, PencilSquareIcon, ShareIcon, ArrowDownTrayIcon
} from '@heroicons/react/24/outline';

const getIcon = (name) => {
    switch (name) {
        case 'clock': return ClockIcon;
        case 'chart': return ChartBarIcon;
        case 'sync': return ArrowPathIcon;
        case 'sound': return MusicalNoteIcon;
        case 'shield': return ShieldCheckIcon;
        case 'target': return BoltIcon;
        case 'live': return SignalIcon;
        case 'chat': return UserGroupIcon;
        case 'fire': return FireIcon;
        case 'badge': return TrophyIcon;
        case 'emoji': return FaceSmileIcon;
        case 'touch': return HandRaisedIcon;
        case 'moon': return MoonIcon;
        case 'star': return StarIcon;
        // Learning Hub
        case 'video': return VideoCameraIcon;
        case 'bookmark': return BookmarkIcon;
        case 'question': return QuestionMarkCircleIcon;
        // To-Do
        case 'list': return ListBulletIcon;
        case 'tag': return TagIcon;
        case 'calendar': return CalendarIcon;
        // Affiliate
        case 'dollar': return CurrencyDollarIcon;
        case 'presentation': return PresentationChartLineIcon;
        case 'link': return LinkIcon;
        case 'photo': return PhotoIcon;
        // Doc Hub
        case 'folder': return FolderIcon;
        case 'edit': return PencilSquareIcon;
        case 'share': return ShareIcon;
        case 'download': return ArrowDownTrayIcon;
        case 'doc': return DocumentTextIcon;
        case 'copy': return ClipboardDocumentCheckIcon;
        case 'history': return ArrowPathIcon;
        default: return SparklesIcon;
    }
};

// ── Shared Navbar Components ──
const FlyoutLink = ({ children, href, FlyoutContent }) => {
    const [open, setOpen] = useState(false);
    const showFlyout = FlyoutContent && open;

    return (
        <div
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
            className="relative h-fit w-fit"
        >
            <a href={href} className="relative text-slate-500 hover:text-emerald-600 font-semibold uppercase tracking-widest text-[13px] py-3 transition-colors">
                {children}
                <span
                    style={{ transform: showFlyout ? "scaleX(1)" : "scaleX(0)" }}
                    className="absolute -bottom-2 -left-2 -right-2 h-1 origin-left scale-x-0 rounded-full bg-emerald-500 transition-transform duration-300 ease-out"
                />
            </a>
            <AnimatePresence>
                {showFlyout && (
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 15 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="absolute left-1/2 top-12 -translate-x-1/2 bg-white rounded-2xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100 min-w-[300px] z-50 overflow-hidden"
                    >
                        <div className="absolute -top-6 left-0 right-0 h-6 bg-transparent" />
                        <div className="absolute left-1/2 top-0 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-white border-l border-t border-slate-100" />
                        <FlyoutContent />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const ProductMenu = () => (
    <div className="grid grid-cols-2 gap-4 w-[500px]">
        {[
            { title: "Learning Hub", desc: "Akses materi pembelajaran premium.", href: "/products/learning-hub", icon: <BookOpenIcon className="w-5 h-5 text-blue-500" /> },
            { title: "To-Do List", desc: "Kelola tugas harianmu.", href: "/products/todo-list", icon: <ClipboardDocumentCheckIcon className="w-5 h-5 text-emerald-500" /> },
            { title: "Affiliate", desc: "Dapatkan penghasilan tambahan.", href: "/products/affiliate", icon: <BanknotesIcon className="w-5 h-5 text-amber-500" /> },
            { title: "Pomodoro", desc: "Fokus tanpa gangguan.", href: "/products/focus-timer", icon: <ClockIcon className="w-5 h-5 text-rose-500" /> },
            { title: "Document Hub", desc: "Simpan & kelola dokumen.", href: "/products/document-hub", icon: <DocumentTextIcon className="w-5 h-5 text-indigo-500" /> },
        ].map((item, i) => (
            <a key={i} href={item.href} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group">
                <div className="mt-0.5 p-2 bg-slate-50 rounded-lg group-hover:bg-white border boundary-slate-100 group-hover:shadow-sm transition-all">
                    {item.icon}
                </div>
                <div>
                    <h3 className="font-bold text-slate-900 text-sm group-hover:text-emerald-600 transition-colors">{item.title}</h3>
                    <p className="text-xs text-slate-400">{item.desc}</p>
                </div>
            </a>
        ))}
    </div>
);

const ResourceMenu = () => (
    <div className="grid grid-cols-1 gap-2">
        <a href="/#cara-kerja" className="block p-3 rounded-xl hover:bg-slate-50 transition-colors text-sm font-bold text-slate-700 hover:text-emerald-600">
            📚 Learn (Cara Kerja)
        </a>
        <a href="/#cerita" className="block p-3 rounded-xl hover:bg-slate-50 transition-colors text-sm font-bold text-slate-700 hover:text-emerald-600">
            ⭐ Customer Reviews
        </a>
        <div className="p-3 rounded-xl text-sm font-bold text-slate-400 flex justify-between items-center cursor-not-allowed opacity-60">
            <span>🎉 Event</span>
            <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">Soon</span>
        </div>
        <div className="p-3 rounded-xl text-sm font-bold text-slate-400 flex justify-between items-center cursor-not-allowed opacity-60">
            <span>📰 Blog</span>
            <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">Soon</span>
        </div>
    </div>
);

// ── Visual Renderer Component (Clean UI Style) ──
const FeatureVisual = ({ type }) => {
    // Shared container style for "Clean Card" look
    const Card = ({ children, className = "" }) => (
        <div className={`w-full h-full min-h-[320px] bg-[#F8F9FB] rounded-[2.5rem] relative overflow-hidden flex items-center justify-center border border-slate-100 ${className}`}>
            <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] opacity-40"></div>
            {children}
        </div>
    );

    switch (type) {
        // FOCUS TIMER: Minimalist Timer
        // FOCUS TIMER
        case 'timer-loop':
            return (
                <Card>
                    <div className="relative w-48 h-48 border-4 border-slate-100 rounded-full flex items-center justify-center">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 10, ease: "linear", repeat: Infinity }}
                            className="absolute inset-0 border-4 border-emerald-500 rounded-full border-t-transparent"
                        />
                        <div className="text-3xl font-[900] text-slate-800">25:00</div>
                        <div className="absolute -bottom-8 px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full text-xs font-bold uppercase tracking-wider">Focusing</div>
                    </div>
                </Card>
            );

        case 'notification-shield':
            return (
                <Card>
                    <div className="w-64 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 space-y-3 relative z-10">
                        <div className="flex items-center gap-3 pb-3 border-b border-slate-50">
                            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white"><ShieldCheckIcon className="w-5 h-5" /></div>
                            <div>
                                <div className="font-bold text-slate-800 text-sm">Focus Mode Active</div>
                                <div className="text-[10px] text-slate-400">Notifications silenced</div>
                            </div>
                        </div>
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex items-center justify-between opacity-50 grayscale">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 bg-slate-100 rounded-md"></div>
                                    <div className="h-2 w-24 bg-slate-100 rounded-full"></div>
                                </div>
                                <div className="text-[10px] font-bold text-slate-300">BLOCKED</div>
                            </div>
                        ))}
                    </div>
                    {/* Particles */}
                    <div className="absolute top-10 right-10 w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
                </Card>
            );

        case 'sound-wave':
            return (
                <Card>
                    <div className="flex items-end gap-1 h-24 mb-6">
                        {[...Array(12)].map((_, i) => (
                            <motion.div
                                key={i}
                                animate={{ height: [20, 60 + Math.random() * 40, 20] }}
                                transition={{ duration: 1 + Math.random(), repeat: Infinity, ease: "easeInOut" }}
                                className="w-4 bg-slate-800 rounded-full opacity-20"
                            />
                        ))}
                    </div>
                    <div className="flex items-center gap-4 bg-white pl-2 pr-6 py-2 rounded-full shadow-lg border border-slate-100 relative z-10">
                        <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white"><MusicalNoteIcon className="w-5 h-5" /></div>
                        <div className="text-sm font-bold text-slate-700">Rainy Vibes 🌧️</div>
                    </div>
                </Card>
            );

        // LEARNING HUB
        case 'course-structure':
            return (
                <Card>
                    <div className="w-64 bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden relative z-10">
                        <div className="h-2 bg-indigo-500 w-full"></div>
                        <div className="p-4 space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full border-2 border-indigo-500 flex items-center justify-center text-[10px] font-bold text-indigo-500">1</div>
                                <div className="h-2 w-32 bg-slate-800 rounded-full"></div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full border-2 border-indigo-500 flex items-center justify-center text-[10px] font-bold text-indigo-500">2</div>
                                <div className="h-2 w-24 bg-slate-800 rounded-full"></div>
                            </div>
                            <div className="flex items-center gap-3 opacity-40">
                                <div className="w-6 h-6 rounded-full border-2 border-slate-300 flex items-center justify-center text-[10px] font-bold text-slate-400">3</div>
                                <div className="h-2 w-28 bg-slate-300 rounded-full"></div>
                            </div>
                        </div>
                    </div>
                </Card>
            );

        case 'case-study':
            return (
                <Card>
                    <div className="relative z-10 flex gap-4">
                        <div className="w-24 h-32 bg-white rounded-lg shadow-md p-2 flex flex-col items-center justify-center gap-2 border border-slate-100 transform -rotate-6">
                            <div className="w-8 h-8 bg-red-100 rounded-full text-red-500 flex items-center justify-center font-bold">❌</div>
                            <div className="h-1 w-12 bg-slate-200 rounded-full"></div>
                            <div className="text-[10px] text-slate-400 font-bold">Chaos</div>
                        </div>
                        <div className="w-24 h-32 bg-emerald-500 rounded-lg shadow-xl p-2 flex flex-col items-center justify-center gap-2 transform rotate-6 scale-110">
                            <div className="w-8 h-8 bg-white rounded-full text-emerald-500 flex items-center justify-center font-bold"><CheckIcon className="w-4 h-4" /></div>
                            <div className="h-1 w-12 bg-white/50 rounded-full"></div>
                            <div className="text-[10px] text-indigo-50 font-bold">Structured</div>
                        </div>
                    </div>
                </Card>
            );

        // TO-DO LIST
        case 'daily-limit':
            return (
                <Card>
                    <div className="w-64 bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4 relative z-10">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                            <span>Today</span>
                            <span className="text-emerald-500">3/3</span>
                        </div>
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="w-5 h-5 rounded bg-emerald-100 text-emerald-600 flex items-center justify-center"><CheckIcon className="w-3 h-3" /></div>
                                <div className="h-2 flex-1 bg-slate-100 rounded-full relative overflow-hidden">
                                    <div className="absolute inset-0 bg-slate-800 w-1/2 opacity-20"></div>
                                </div>
                            </div>
                        ))}
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
                            <div className="bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-xl transform rotate-3 flex items-center gap-2">
                                <ShieldCheckIcon className="w-4 h-4 text-emerald-400" />
                                Limit Reached
                            </div>
                        </div>
                    </div>
                </Card>
            );

        case 'kanban-board':
            return (
                <Card>
                    <div className="flex gap-3 relative z-10 w-full px-8">
                        {['Todo', 'Doing', 'Done'].map((col, i) => (
                            <div key={col} className="flex-1 bg-white rounded-lg shadow-sm border border-slate-100 p-2 space-y-2 h-32">
                                <div className={`text-[9px] font-bold uppercase tracking-wider mb-2 ${i === 0 ? 'text-slate-400' : i === 1 ? 'text-blue-500' : 'text-emerald-500'}`}>{col}</div>
                                <div className="h-8 bg-slate-50 rounded border border-slate-100"></div>
                                {i > 0 && <div className="h-8 bg-slate-50 rounded border border-slate-100"></div>}
                            </div>
                        ))}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing transform rotate-12 drop-shadow-2xl">
                            <div className="w-8 h-8 bg-slate-900 rounded-full border-2 border-white flex items-center justify-center text-white shadow-lg">✋</div>
                        </div>
                    </div>
                </Card>
            );

        // AFFILIATE
        case 'commission-chart':
            return (
                <Card>
                    <div className="w-full px-12 h-32 flex items-end gap-2 relative z-10">
                        {[20, 35, 30, 55, 45, 70, 60, 90].map((h, i) => (
                            <motion.div
                                key={i}
                                initial={{ height: 0 }}
                                whileInView={{ height: `${h}%` }}
                                transition={{ delay: i * 0.1, duration: 0.5 }}
                                className="flex-1 bg-emerald-500 rounded-t-sm opacity-90 hover:opacity-100 transition-opacity relative group"
                            >
                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">${h * 10}</div>
                            </motion.div>
                        ))}
                    </div>
                </Card>
            );

        case 'realtime-dashboard':
            return (
                <Card>
                    <div className="grid grid-cols-2 gap-3 w-64 relative z-10">
                        <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100">
                            <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">Clicks</div>
                            <div className="text-xl font-black text-slate-800">1,204</div>
                        </div>
                        <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100">
                            <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">Sales</div>
                            <div className="text-xl font-black text-emerald-500">86</div>
                        </div>
                        <div className="col-span-2 bg-gradient-to-r from-slate-900 to-slate-800 p-3 rounded-xl shadow-lg text-white flex justify-between items-center">
                            <div className="text-xs font-bold opacity-80">Active now</div>
                            <div className="flex items-center gap-2 text-sm font-bold"><div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div> 12</div>
                        </div>
                    </div>
                </Card>
            );

        // DOC HUB
        case 'wiki-structure':
            return (
                <Card>
                    <div className="w-56 bg-white rounded-lg shadow-lg border border-slate-100 p-4 relative z-10">
                        <div className="flex items-center gap-2 mb-3 text-slate-800 font-bold text-xs"><FolderIcon className="w-4 h-4 text-amber-400" /> Project Zeus</div>
                        <div className="pl-3 border-l border-slate-100 space-y-2">
                            <div className="flex items-center gap-2 text-slate-500 text-[10px]"><DocumentTextIcon className="w-3 h-3" /> Requirements</div>
                            <div className="flex items-center gap-2 text-emerald-600 text-[10px] bg-emerald-50 px-2 py-1 rounded font-bold"><DocumentTextIcon className="w-3 h-3" /> Roadmap 2024</div>
                            <div className="flex items-center gap-2 text-slate-500 text-[10px]"><DocumentTextIcon className="w-3 h-3" /> Brand Assets</div>
                        </div>
                    </div>
                </Card>
            );

        case 'realtime-collab':
            return (
                <Card>
                    <div className="w-64 bg-white h-40 rounded-t-xl shadow-sm border border-slate-200 p-4 relative z-10 overflow-hidden">
                        <div className="space-y-2 mb-4">
                            <div className="h-2 w-full bg-slate-100 rounded-full"></div>
                            <div className="h-2 w-3/4 bg-slate-100 rounded-full"></div>
                            <div className="h-2 w-5/6 bg-slate-100 rounded-full"></div>
                        </div>
                        {/* Cursors */}
                        <motion.div
                            animate={{ x: [0, 40, 10, 50], y: [0, -10, 20, 0] }}
                            transition={{ duration: 4, repeat: Infinity }}
                            className="absolute top-8 left-10"
                        >
                            <div className="w-3 h-3 -ml-1 -mt-1"><svg viewBox="0 0 24 24" fill="#10b981"><path d="M5 2l12 11.5-6 .5-2 6-4-18z" /></svg></div>
                            <div className="bg-emerald-500 text-white text-[9px] px-1 rounded ml-2">Arif</div>
                        </motion.div>
                        <motion.div
                            animate={{ x: [0, -30, -10, -40], y: [0, 20, -10, 0] }}
                            transition={{ duration: 5, repeat: Infinity }}
                            className="absolute bottom-8 right-10"
                        >
                            <div className="w-3 h-3 -ml-1 -mt-1"><svg viewBox="0 0 24 24" fill="#f59e0b"><path d="M5 2l12 11.5-6 .5-2 6-4-18z" /></svg></div>
                            <div className="bg-amber-500 text-white text-[9px] px-1 rounded ml-2">Team</div>
                        </motion.div>
                    </div>
                </Card>
            );

        // GUILD: Avatar Stack
        case 'guild-network':
        case 'visual': // Fallback legacy
        case 'accountability-chart':
        case 'leaderboard-medal':
            return (
                <Card>
                    <div className="text-center">
                        <div className="flex -space-x-4 mb-6 justify-center">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="w-14 h-14 rounded-full border-4 border-white bg-slate-100 shadow-sm flex items-center justify-center font-bold text-slate-600 text-sm">
                                    {['JD', 'AM', 'RK', 'S'][i]}
                                </div>
                            ))}
                            <div className="w-14 h-14 rounded-full border-4 border-white bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">+5</div>
                        </div>
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-slate-100 text-sm font-bold text-slate-900">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                            24 Members Focusing
                        </div>
                    </div>
                </Card>
            );

        // DEFAULT / COMPANION
        default:
            return (
                <Card>
                    <div className="relative w-64 p-6 bg-white rounded-3xl shadow-lg border border-slate-100">
                        <div className="flex items-start gap-4 mb-4">
                            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white text-lg">👾</div>
                            <div className="bg-slate-50 p-3 rounded-r-2xl rounded-bl-2xl text-sm font-medium text-slate-600">
                                Sudah 25 menit! Waktunya istirahat sebentar? ☕
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <div className="bg-emerald-500 text-white px-4 py-2 rounded-l-2xl rounded-br-2xl text-sm font-bold">
                                Siap, thanks Kiko!
                            </div>
                        </div>
                    </div>
                </Card>
            );
    }
};

export default function ProductShow({ product }) {
    if (!product) return null;

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { scrollY } = useScroll();
    const y = useTransform(scrollY, [0, 500], ['0%', '20%']);
    const opacity = useTransform(scrollY, [0, 500], [1, 0]);

    // ── Hero App Mockup (Premium SaaS Style) ──
    const AppMockup = ({ type }) => {
        const WindowFrame = ({ children }) => (
            <motion.div
                initial={{ y: 40, opacity: 0, rotateX: 10 }}
                animate={{ y: 0, opacity: 1, rotateX: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-full h-[500px] bg-white rounded-2xl shadow-2xl shadow-slate-200 border border-slate-200 overflow-hidden flex flex-col relative z-20"
            >
                {/* Window Header */}
                <div className="h-10 bg-slate-50 border-b border-slate-100 flex items-center px-4 gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                    <div className="flex-1 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {type.replace('-', ' ')}
                    </div>
                </div>
                {/* Window Body */}
                <div className="flex-1 relative overflow-hidden bg-[#F8FAFC]">
                    {children}
                </div>
                {/* Glare Effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none"></div>
            </motion.div>
        );

        if (type === 'focus-timer') {
            return (
                <WindowFrame>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center space-y-8 relative z-10">
                            <div className="relative">
                                {/* Timer Circle */}
                                <svg className="w-64 h-64 -rotate-90 drop-shadow-xl">
                                    <circle cx="128" cy="128" r="120" stroke="#e2e8f0" strokeWidth="12" fill="white" />
                                    <motion.circle
                                        cx="128" cy="128" r="120"
                                        stroke="#10b981" strokeWidth="12"
                                        strokeLinecap="round"
                                        fill="none"
                                        strokeDasharray="753"
                                        initial={{ strokeDashoffset: 753 }}
                                        animate={{ strokeDashoffset: 0 }}
                                        transition={{ duration: 30, ease: "linear" }}
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <div className="text-6xl font-black text-slate-800 tracking-tighter mix-blend-multiply">24:59</div>
                                    <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-2">Focus Mode</div>
                                </div>
                            </div>

                            <div className="flex items-center justify-center gap-6">
                                <button className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center hover:bg-slate-200 transition-colors"><boltIcon className="w-6 h-6" /></button>
                                <button className="w-20 h-20 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xl shadow-emerald-500/30 hover:scale-105 transition-transform"><div className="w-6 h-6 bg-white rounded-sm"></div></button>
                                <button className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center hover:bg-slate-200 transition-colors"><MusicalNoteIcon className="w-6 h-6" /></button>
                            </div>
                        </div>

                        {/* Decorative Background Elements */}
                        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-50"></div>
                    </div>
                </WindowFrame>
            );
        }

        if (type === 'guild-system') {
            return (
                <WindowFrame>
                    <div className="p-8 h-full flex flex-col">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">Productive Squad 🚀</h3>
                                <p className="text-xs text-slate-400">12 Members Online</p>
                            </div>
                            <div className="flex -space-x-2">
                                {[1, 2, 3, 4].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200"></div>)}
                            </div>
                        </div>
                        <div className="flex-1 space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100"></div>
                                    <div className="flex-1">
                                        <div className="h-2 w-24 bg-slate-100 rounded-full mb-2"></div>
                                        <div className="h-2 w-16 bg-slate-50 rounded-full"></div>
                                    </div>
                                    <div className="px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-lg truncate">Focusing 2h</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </WindowFrame>
            );
        }

        if (type === 'smart-companion') {
            return (
                <WindowFrame>
                    <div className="flex flex-col h-full bg-white">
                        <div className="flex-1 p-6 space-y-6 overflow-hidden relative">
                            <div className="absolute inset-0 bg-[#F8FAFC] opacity-50"></div>

                            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex gap-4 relative z-10 max-w-[80%]">
                                <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-xl shadow-lg">👾</div>
                                <div className="bg-white border border-slate-100 p-4 rounded-2xl rounded-tl-none shadow-sm text-sm text-slate-600 leading-relaxed">
                                    Halo! Kelihatannya kamu sudah fokus selama 2 jam. Mau istirahat sebentar agar energi kembali *full*? ⚡
                                </div>
                            </motion.div>

                            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1 }} className="flex gap-4 relative z-10 max-w-[80%] ml-auto flex-row-reverse">
                                <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center text-xl">👤</div>
                                <div className="bg-emerald-500 p-4 rounded-2xl rounded-tr-none shadow-md shadow-emerald-500/20 text-sm text-white leading-relaxed">
                                    Boleh juga Ko. Set timer 15 menit ya!
                                </div>
                            </motion.div>

                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 2 }} className="w-fit mx-auto bg-slate-100 px-4 py-2 rounded-full text-xs font-bold text-slate-500 relative z-10 block">
                                Kiko mengatur timer istirahat...
                            </motion.div>
                        </div>
                        <div className="p-4 border-t border-slate-100 bg-white relative z-20">
                            <div className="h-12 bg-slate-50 rounded-xl border border-slate-100 flex items-center px-4 text-slate-300 text-sm">Ketuk untuk membalas...</div>
                        </div>
                    </div>
                </WindowFrame>
            );
        }

        if (type === 'learning-hub') {
            return (
                <WindowFrame>
                    <div className="flex h-full">
                        <div className="w-16 bg-slate-50 border-r border-slate-100 flex flex-col items-center py-6 gap-4">
                            <div className="w-8 h-8 rounded-lg bg-indigo-500 text-white flex items-center justify-center">📚</div>
                            <div className="w-8 h-8 rounded-lg bg-slate-200"></div>
                            <div className="w-8 h-8 rounded-lg bg-slate-200"></div>
                        </div>
                        <div className="flex-1 p-8 space-y-6">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-24 h-32 bg-slate-200 rounded-lg shadow-sm"></div>
                                <div className="flex-1 space-y-3">
                                    <div className="h-6 w-3/4 bg-slate-800 rounded-md"></div>
                                    <div className="h-4 w-1/2 bg-slate-300 rounded-md"></div>
                                    <div className="flex gap-2 mt-2">
                                        <div className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold">Course</div>
                                        <div className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-600 text-xs font-bold">Active</div>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full w-2/3 bg-indigo-500 rounded-full"></div>
                                </div>
                                <div className="flex justify-between text-xs text-slate-400 font-medium">
                                    <span>Progress</span>
                                    <span>66%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </WindowFrame>
            );
        }

        if (type === 'todo-list') {
            return (
                <WindowFrame>
                    <div className="p-8 h-full bg-white flex flex-col">
                        <div className="text-2xl font-[900] text-slate-800 mb-6">Today's Focus <span className="text-slate-300 font-normal text-lg">/ 3 Tasks</span></div>
                        <div className="space-y-4">
                            {[
                                { text: "Selesaikan Laporan Q3", done: true },
                                { text: "Meeting dengan Klien", done: false, active: true },
                                { text: "Review Design System", done: false },
                            ].map((task, i) => (
                                <div key={i} className={`flex items-center gap-4 p-4 rounded-xl border ${task.active ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-100 bg-white'} transition-all`}>
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${task.done ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300'}`}>
                                        {task.done && <CheckIcon className="w-4 h-4 text-white" />}
                                    </div>
                                    <span className={`flex-1 font-bold ${task.done ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{task.text}</span>
                                    {task.active && <div className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase rounded-md">Now</div>}
                                </div>
                            ))}
                        </div>
                        <div className="mt-8 pt-8 border-t border-slate-100 text-center text-slate-400 text-sm">
                            "You are what you do, not what you say you'll do."
                        </div>
                    </div>
                </WindowFrame>
            );
        }

        if (type === 'affiliate') {
            return (
                <WindowFrame>
                    <div className="p-8 h-full bg-[#FAFAFA]">
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                <div className="text-xs text-slate-400 font-bold uppercase mb-1">Total Earnings</div>
                                <div className="text-2xl font-[900] text-emerald-500">Rp 12.500.000</div>
                            </div>
                            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                <div className="text-xs text-slate-400 font-bold uppercase mb-1">Conversions</div>
                                <div className="text-2xl font-[900] text-slate-800">142</div>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-48 flex items-end justify-between px-8 pb-4 gap-2">
                            {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                                <div key={i} className="w-full bg-slate-100 rounded-t-lg relative group">
                                    <div style={{ height: `${h}%` }} className="absolute bottom-0 w-full bg-emerald-500 rounded-t-lg opacity-80 group-hover:opacity-100 transition-opacity"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </WindowFrame>
            );
        }

        if (type === 'document-hub') {
            return (
                <WindowFrame>
                    <div className="flex h-full bg-white">
                        <div className="w-48 bg-[#F8FAFC] border-r border-slate-200 p-4 space-y-4">
                            <div className="h-2 w-20 bg-slate-200 rounded-full mb-6"></div>
                            <div className="space-y-2">
                                <div className="h-8 w-full bg-white border border-slate-200 rounded-md flex items-center px-3 text-xs text-slate-600 font-bold shadow-sm">🏠 Home</div>
                                <div className="h-8 w-full rounded-md flex items-center px-3 text-xs text-slate-400 hover:bg-slate-100 transition-colors">📂 Projects</div>
                                <div className="h-8 w-full rounded-md flex items-center px-3 text-xs text-slate-400 hover:bg-slate-100 transition-colors">📝 Notes</div>
                            </div>
                        </div>
                        <div className="flex-1 p-8">
                            <div className="max-w-md mx-auto space-y-6">
                                <div className="h-8 w-3/4 bg-slate-100 rounded-md"></div>
                                <div className="space-y-3">
                                    <div className="h-2 w-full bg-slate-50 rounded-full"></div>
                                    <div className="h-2 w-full bg-slate-50 rounded-full"></div>
                                    <div className="h-2 w-2/3 bg-slate-50 rounded-full"></div>
                                </div>
                                <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/50 flex gap-4 items-center">
                                    <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center text-xl">💡</div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-2 w-32 bg-indigo-200 rounded-full"></div>
                                        <div className="h-2 w-20 bg-indigo-100 rounded-full"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </WindowFrame>
            );
        }

        return null;
    };

    return (
        <div className="min-h-screen bg-[#FAFBFC] text-slate-900 font-sans selection:bg-emerald-100 selection:text-emerald-900 overflow-x-hidden">
            <Head title={`${product.title} — Sarang Tumbuh`} />

            {/* Background Texture */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.4] z-0" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>

            {/* ═════════ NAV ═════════ */}
            <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50">
                <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 group">
                        <span className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center text-white text-xs font-black shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">S</span>
                        <span className="font-[800] text-slate-900 tracking-tight pl-1">Sarang Tumbuh</span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-10">
                        <FlyoutLink href="#" FlyoutContent={ProductMenu}>Product</FlyoutLink>
                        <FlyoutLink href="#" FlyoutContent={ResourceMenu}>Resources</FlyoutLink>
                        <a href="/#harga" className="text-slate-500 hover:text-emerald-600 font-semibold uppercase tracking-widest text-[13px] transition-colors">Pricing</a>
                    </div>

                    <div className="hidden md:flex items-center gap-4">
                        <a href="/login" className="text-sm font-bold text-slate-500 hover:text-emerald-600 transition-colors">Masuk</a>
                        <Link href="/register" className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                            Coba Gratis
                        </Link>
                    </div>

                    {/* Mobile Toggle */}
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 text-slate-900">
                        <div className="space-y-1.5">
                            <span className={`block w-6 h-0.5 bg-current transition-transform ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                            <span className={`block w-6 h-0.5 bg-current transition-opacity ${isMenuOpen ? 'opacity-0' : ''}`}></span>
                            <span className={`block w-6 h-0.5 bg-current transition-transform ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
                        </div>
                    </button>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="md:hidden bg-white border-b border-slate-100 overflow-hidden">
                            <div className="p-6 space-y-4">
                                <a href="#" className="block font-bold text-lg">Product</a>
                                <a href="#" className="block font-bold text-lg">Resources</a>
                                <a href="/#harga" className="block font-bold text-lg">Pricing</a>
                                <Link href="/register" className="block w-full text-center py-3 bg-slate-900 text-white rounded-xl font-bold mt-4">Coba Gratis</Link>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            <main className="pt-32 relative z-10">
                {/* ═════════ HERO ═════════ */}
                <section className="relative px-6 py-20 md:py-24 overflow-hidden">
                    <div className="container mx-auto max-w-6xl grid md:grid-cols-2 gap-16 items-center">
                        <div className="relative z-10 order-2 md:order-1">
                            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
                                <h2 className="text-emerald-600 font-bold tracking-widest uppercase mb-6 text-sm flex items-center gap-3">
                                    <span className="w-8 h-[1px] bg-emerald-500"></span>
                                    {product.subtitle}
                                </h2>
                                <h1 className="text-5xl md:text-7xl font-[900] text-slate-900 leading-[1.1] tracking-tight mb-8">
                                    {product.title}
                                    <span className="text-emerald-500">.</span>
                                </h1>
                                <p className="text-lg md:text-xl text-slate-500 leading-relaxed max-w-xl mb-10 font-medium border-l-4 border-slate-200 pl-6">
                                    {product.description}
                                </p>
                                <div className="flex flex-wrap gap-4">
                                    <Link href="/register" className="px-8 py-4 bg-slate-900 text-white rounded-xl font-bold text-lg hover:scale-105 hover:bg-emerald-900 transition-all shadow-xl shadow-slate-900/20">
                                        Mulai Gratis
                                    </Link>
                                    <a href="#details" className="px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold text-lg hover:bg-slate-50 transition-colors shadow-sm">
                                        Pelajari Fitur
                                    </a>
                                </div>
                            </motion.div>
                        </div>

                        {/* HERO MOCKUP */}
                        <div className="relative h-full flex items-center justify-center order-1 md:order-2 perspective-1000">
                            {/* Decorative Blobs Behind Mockup */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-emerald-200/30 to-blue-200/30 blur-3xl rounded-full pointer-events-none"></div>

                            <AppMockup type={product.slug} />
                        </div>
                    </div>
                </section>

                {/* ═════════ DEEP DIVE (ZIG ZAG) ═════════ */}
                <section id="details" className="py-24 px-6 bg-white overflow-hidden">
                    <div className="container mx-auto max-w-6xl space-y-32">
                        {product.deep_dive && product.deep_dive.map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 0.8 }}
                                className={`flex flex-col md:flex-row items-center gap-12 md:gap-24 ${item.orientation === 'left' ? 'md:flex-row-reverse' : ''}`}
                            >
                                <div className="flex-1 space-y-6">
                                    <div className="w-12 h-1 bg-emerald-500 rounded-full"></div>
                                    <h3 className="text-3xl md:text-4xl font-[900] text-slate-900 leading-tight">{item.title}</h3>
                                    <p className="text-lg text-slate-500 leading-relaxed font-medium">{item.content}</p>
                                </div>

                                {/* FEATURE VISUAL REPLACEMENT */}
                                <div className="flex-1 w-full relative group">
                                    {/* ── Visual Renderer Component (Clean UI Style) ── */}
                                    <FeatureVisual type={item.visual} />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* ═════════ FEATURES BENTO GRID ═════════ */}
                <section className="py-24 px-6 bg-[#FAFBFC]">
                    <div className="container mx-auto max-w-6xl">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-5xl font-[900] tracking-tight mb-6 text-slate-900">Segalanya untuk performa.</h2>
                            <p className="text-slate-500 text-lg">Fitur lengkap yang didesain dengan obsesi terhadap detail.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(180px,auto)]">
                            {product.features.map((feature, i) => {
                                const Icon = getIcon(feature.icon);
                                return (
                                    <motion.div
                                        key={i}
                                        whileHover={{ y: -5 }}
                                        className={`relative group overflow-hidden p-8 rounded-[2rem] bg-white border border-slate-200 hover:border-transparent hover:shadow-2xl hover:shadow-emerald-500/10 transition-all ${feature.span || 'col-span-1'}`}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-teal-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                                        <div className="relative z-10 flex flex-col h-full justify-between">
                                            <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-6 group-hover:bg-white group-hover:scale-110 transition-all duration-300 shadow-sm">
                                                <Icon className="w-7 h-7 text-slate-700 group-hover:text-emerald-500 transition-colors" />
                                            </div>

                                            <div>
                                                <h3 className="text-xl font-[800] text-slate-900 mb-2">{feature.title}</h3>
                                                <p className="text-slate-500 font-medium leading-relaxed text-sm group-hover:text-slate-600 transition-colors">{feature.desc}</p>
                                            </div>
                                        </div>

                                        {/* Decorative Elements for larger cards */}
                                        {feature.span?.includes('col-span-2') && (
                                            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none group-hover:bg-emerald-500/10 transition-colors"></div>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* ═════════ BENEFITS (Compact) ═════════ */}
                {product.benefits && (
                    <section className="py-24 px-6 bg-white border-t border-slate-100">
                        <div className="container mx-auto max-w-4xl text-center">
                            <p className="text-emerald-600 font-bold uppercase tracking-widest text-xs mb-8">The Result</p>
                            <div className="flex flex-wrap justify-center gap-4 md:gap-8">
                                {product.benefits.map((benefit, i) => (
                                    <div key={i} className="flex items-center gap-3 px-6 py-3 rounded-full bg-slate-50 border border-slate-200 text-slate-700 font-bold text-sm hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-colors cursor-default">
                                        <CheckIcon className="w-5 h-5 text-emerald-500" />
                                        {benefit}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}
            </main>

            {/* CTA */}
            <div className="py-24 bg-slate-900 text-white text-center px-6">
                <div className="container mx-auto max-w-2xl">
                    <h2 className="text-3xl font-bold mb-6">Siap mencoba {product.title}?</h2>
                    <p className="text-slate-400 mb-8 text-lg">Mulai gunakan Sarang Tumbuh hari ini. Gratis.</p>
                    <Link href="/register" className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/25">
                        Daftar Sekarang <ArrowRightIcon className="w-5 h-5" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
