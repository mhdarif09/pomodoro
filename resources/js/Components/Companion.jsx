import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ══════════════════════════════════════════
// 🎮 RETRO PIXEL ART COMPANION — "Kiko"
// Unisex design, 16-bit inspired
// ══════════════════════════════════════════

const PIXEL = 3;

// Color palette — warm retro aesthetic
const C = {
    _: 'transparent',    // empty
    K: '#2D1B2E',        // dark outline
    S: '#FFDBB4',        // skin
    H: '#6B4226',        // hair (warm brown)
    Hl: '#8B5E3C',       // hair highlight
    E: '#FFFFFF',        // eye white
    P: '#2D1B2E',        // pupil
    Bl: '#FF9999',       // blush
    M: '#E05A5A',        // mouth (happy)
    Md: '#2D1B2E',       // mouth (neutral)

    // Shirt colors per mood
    T: '#5B8CFF',        // teal/blue shirt (idle)
    Tl: '#7EAAFF',       // shirt highlight
    Td: '#4A6FCC',       // shirt shadow
    Ft: '#4CAF50',       // focus shirt
    Ftl: '#66C96A',      // focus highlight
    Ct: '#FFB74D',       // celebrate shirt
    Ctl: '#FFCC80',      // celebrate highlight

    P4: '#3D4D6E',       // pants
    P4l: '#536B91',      // pants highlight
    Sh: '#5A3E28',       // shoes
    Shl: '#7A5E48',      // shoes highlight
    St: '#FFD700',       // star
    Hb: '#E05A5A',       // headband (focus)
};

// 16x20 pixel grid characters
const createGrid = (mood) => {
    const _ = C._;
    const K = C.K;
    const S = C.S;
    const H = C.H;
    const Hl = C.Hl;
    const E = C.E;
    const P = C.P;
    const Bl = C.Bl;
    const P4 = C.P4;
    const P4l = C.P4l;
    const Sh = C.Sh;
    const Shl = C.Shl;

    // Mood-based colors
    const T = mood === 'focusing' ? C.Ft : mood === 'celebrating' ? C.Ct : C.T;
    const Tl = mood === 'focusing' ? C.Ftl : mood === 'celebrating' ? C.Ctl : C.Tl;
    const Td = mood === 'focusing' ? '#3D8C40' : mood === 'celebrating' ? '#E6A03A' : C.Td;

    // Hair (rows 0-4)
    const hair = [
        [_, _, _, _, _, K, K, K, K, K, K, _, _, _, _, _],
        [_, _, _, _, K, H, H, Hl, H, H, H, K, _, _, _, _],
        [_, _, _, K, H, H, Hl, Hl, H, H, H, H, K, _, _, _],
        [_, _, K, H, H, S, S, S, S, S, S, H, H, K, _, _],
        [_, _, K, H, S, S, S, S, S, S, S, S, H, K, _, _],
    ];

    // Face varies by mood
    let face;
    if (mood === 'focusing') {
        face = [
            [_, _, K, C.Hb, C.Hb, C.Hb, C.Hb, C.Hb, C.Hb, C.Hb, C.Hb, C.Hb, C.Hb, K, _, _],
            [_, _, K, S, S, K, K, S, S, K, K, S, S, K, _, _],
            [_, _, K, S, S, K, P, S, S, K, P, S, S, K, _, _],
            [_, _, _, K, S, S, S, S, S, S, S, S, K, _, _, _],
            [_, _, _, K, S, S, K, K, K, K, S, S, K, _, _, _],
        ];
    } else if (mood === 'celebrating') {
        face = [
            [_, _, K, S, S, S, S, S, S, S, S, S, S, K, _, _],
            [_, _, K, S, S, _, K, S, S, _, K, S, S, K, _, _],
            [_, _, K, S, K, _, _, K, K, _, _, K, S, K, _, _],
            [_, _, _, K, Bl, S, S, S, S, S, S, Bl, K, _, _, _],
            [_, _, _, K, S, K, C.M, C.M, C.M, C.M, K, S, K, _, _, _],
        ];
    } else if (mood === 'sleeping') {
        face = [
            [_, _, K, S, S, S, S, S, S, S, S, S, S, K, _, _],
            [_, _, K, S, S, K, K, S, S, K, K, S, S, K, _, _],
            [_, _, K, S, S, S, S, S, S, S, S, S, S, K, _, _],
            [_, _, _, K, S, S, S, S, S, S, S, S, K, _, _, _],
            [_, _, _, K, S, S, S, K, K, S, S, S, K, _, _, _],
        ];
    } else {
        face = [
            [_, _, K, S, S, S, S, S, S, S, S, S, S, K, _, _],
            [_, _, K, S, S, E, E, S, S, E, E, S, S, K, _, _],
            [_, _, K, S, S, E, P, S, S, E, P, S, S, K, _, _],
            [_, _, _, K, S, S, S, K, S, S, S, S, K, _, _, _],
            [_, _, _, K, S, S, K, C.Md, C.Md, K, S, S, K, _, _, _],
        ];
    }

    // Body (rows 10-14)
    let body;
    if (mood === 'celebrating') {
        body = [
            [_, _, _, _, K, S, T, T, T, T, S, K, _, _, _, _],
            [_, S, K, K, T, T, Tl, T, T, Tl, T, T, K, K, S, _],
            [_, _, _, K, T, Tl, T, T, T, T, Tl, T, K, _, _, _],
            [_, _, _, K, T, T, Td, T, T, Td, T, T, K, _, _, _],
            [_, _, _, _, K, T, T, T, T, T, T, K, _, _, _, _],
        ];
    } else {
        body = [
            [_, _, _, _, _, K, S, S, S, S, K, _, _, _, _, _],
            [_, _, _, K, K, T, T, Tl, T, T, T, K, K, _, _, _],
            [_, _, K, S, T, T, Tl, T, T, Tl, T, T, S, K, _, _],
            [_, _, K, S, T, T, Td, T, T, Td, T, T, S, K, _, _],
            [_, _, _, K, T, T, T, T, T, T, T, T, K, _, _, _],
        ];
    }

    // Legs (rows 15-19)
    const legs = [
        [_, _, _, _, K, P4, P4, P4l, P4, P4, P4, K, _, _, _, _],
        [_, _, _, _, K, P4, P4l, P4, P4, P4l, P4, K, _, _, _, _],
        [_, _, _, _, K, P4, K, _, _, K, P4, K, _, _, _, _],
        [_, _, _, _, K, P4, K, _, _, K, P4, K, _, _, _, _],
        [_, _, _, K, Sh, Shl, K, _, _, K, Sh, Shl, K, _, _, _],
    ];

    return [...hair, ...face, ...body, ...legs];
};

const PixelCharacter = ({ mood }) => {
    const grid = createGrid(mood);
    const width = 16;
    const height = grid.length;

    return (
        <div className="relative">
            <svg
                width={width * PIXEL}
                height={height * PIXEL}
                viewBox={`0 0 ${width * PIXEL} ${height * PIXEL}`}
                className="drop-shadow-lg"
                style={{ imageRendering: 'pixelated' }}
            >
                {grid.map((row, y) =>
                    row.map((color, x) =>
                        color !== C._ ? (
                            <rect key={`${x}-${y}`} x={x * PIXEL} y={y * PIXEL} width={PIXEL} height={PIXEL} fill={color} />
                        ) : null
                    )
                )}
            </svg>

            {/* Zzz for sleeping */}
            {mood === 'sleeping' && (
                <>
                    <motion.span className="absolute -top-1 -right-2 text-indigo-400 font-mono select-none" style={{ fontSize: '8px', fontWeight: 900 }} animate={{ opacity: [0.2, 1, 0.2], y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 2 }}>z</motion.span>
                    <motion.span className="absolute -top-3 right-0 text-indigo-300 font-mono select-none" style={{ fontSize: '10px', fontWeight: 900 }} animate={{ opacity: [0.2, 1, 0.2], y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}>Z</motion.span>
                </>
            )}

            {/* Sparkles for celebrating */}
            {mood === 'celebrating' && (
                <>
                    <motion.span className="absolute -top-4 -left-3 text-yellow-400 select-none" style={{ fontSize: '10px' }} animate={{ opacity: [0, 1, 0], scale: [0.5, 1.3, 0.5], rotate: [0, 180, 360] }} transition={{ repeat: Infinity, duration: 0.8 }}>✦</motion.span>
                    <motion.span className="absolute -top-2 -right-4 text-amber-400 select-none" style={{ fontSize: '8px' }} animate={{ opacity: [0, 1, 0], scale: [0.5, 1.3, 0.5] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.3 }}>★</motion.span>
                </>
            )}

            {/* Focus aura */}
            {mood === 'focusing' && (
                <motion.div className="absolute inset-0 rounded-full border-2 border-indigo-400/30" style={{ margin: '-4px' }} animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0, 0.4] }} transition={{ repeat: Infinity, duration: 2 }} />
            )}
        </div>
    );
};

// ══════════════════════════════════════════
// 🧠 COMPANION BRAIN
// ══════════════════════════════════════════

const useCompanionBrain = (tasks, isTimerRunning, user, activeTask) => {
    const [thought, setThought] = useState({ state: 'idle', message: null });

    const hour = new Date().getHours();
    const taskCount = tasks.filter(t => !t.is_completed).length;
    const completedCount = tasks.filter(t => t.is_completed).length;
    const userName = user?.name ? user.name.split(' ')[0] : 'Sobat';

    // Context Analysis Helpers
    const getContext = () => {
        if (!activeTask) return null;
        const title = activeTask.title.toLowerCase();
        if (title.includes('bug') || title.includes('fix') || title.includes('error')) return 'bug_squashing';
        if (title.includes('design') || title.includes('ui') || title.includes('ux') || title.includes('mockup')) return 'designing';
        if (title.includes('meeting') || title.includes('sync') || title.includes('call')) return 'meeting';
        if (title.includes('write') || title.includes('docs') || title.includes('post') || title.includes('blog')) return 'writing';
        if (title.includes('plan') || title.includes('strategy') || title.includes('roadmap')) return 'planning';
        return 'general_focus';
    };

    const getStreak = () => {
        // Simple mock streak based on recent completions in this session state
        // In a real app, track timestamps of completions
        return completedCount > 2 ? 'high' : completedCount > 0 ? 'medium' : 'none';
    };

    const MESSAGES = useMemo(() => ({
        morning: [`Pagi, ${userName}! Siap taklukkan hari?`, "Yuk, mulai dengan 1 tugas prioritas!", "Kopi dulu ☕, baru kerja."],
        evening: [`Udah malam, ${userName}. Istirahat gih.`, "Jangan forsir tenaga. Simpan buat besok.", "Tidur yang cukup ya!"],
        empty: [`Wah kosong nih. Tambah tugas dulu yuk?`, "Mulai dari hal kecil aja.", `Mau ngapain hari ini, ${userName}?`],
        focusing: {
            general: ["Sshh... Mode fokus on. 🤫", "Kamu pasti bisa!", "Keep going! 🔥", "Ganbatte! 💪"],
            bug_squashing: ["Basmi bug itu! 🐛", "Pasti cuma typo doang kan?", "Debugging is detective work. 🕵️‍♂️"],
            designing: ["Pixel perfect! 🎨", "Eksplorasi itu seru ya.", "Jangan lupa whitespace!"],
            meeting: ["Meeting lagi? Semangat! 🎧", "Semoga meetingnya efektif.", "Catat poin penting ya."],
            writing: ["Flow state is key. ✍️", "Tulis aja dulu, edit nanti.", "Kata-kata adalah senjata."],
            planning: ["Gagal merencana = Merencana gagal. 🧠", "Strategi yang mantap!", "Lihat big picture-nya."]
        },
        heavy: ["Waduh, banyak tugas. Pelan-pelan ya.", "Fokus satu-satu, jangan panik.", "Tarik napas... yuk lanjut."],
        completed: {
            normal: ["Keren! Lanjut lagi?", "Mantap! 🎉", "Produktif banget hari ini!"],
            streak: ["3x Combo! 🔥🔥🔥", "Kamu unstoppable hari ini!", "Gacor parah! 😎"]
        },
        idle: [`Masih di sana, ${userName}?`, "Yuk lanjut dikit lagi.", "Jangan lupa goal hari ini."],
        sleeping: ["Zzz...", "Sleep is productive too.", "Recharge energy..."]
    }), [userName]);

    useEffect(() => {
        let newState = 'idle';
        let possibleMessages = [];

        // 1. Check Time
        if (hour >= 23 || hour < 5) {
            newState = 'sleeping';
            possibleMessages = MESSAGES.sleeping;
        }

        // 2. Check Timer & Active Task
        else if (isTimerRunning) {
            newState = 'focusing';
            const context = getContext();
            possibleMessages = MESSAGES.focusing[context] || MESSAGES.focusing.general;
        }
        // 3. Check Tasks
        else if (taskCount === 0 && completedCount === 0) {
            newState = 'guiding';
            possibleMessages = MESSAGES.empty;
        } else if (taskCount > 8) {
            newState = 'idle'; // visually normal but concerned message
            possibleMessages = MESSAGES.heavy;
        } else if (completedCount > 0 && !isTimerRunning) {
            // Just finished something?
            const streak = getStreak();
            if (streak === 'high') {
                newState = 'celebrating';
                possibleMessages = MESSAGES.completed.streak;
            } else {
                newState = 'celebrating';
                possibleMessages = MESSAGES.completed.normal;
            }
        } else {
            // Idle states
            if (hour < 11) possibleMessages = MESSAGES.morning;
            else if (hour >= 20) possibleMessages = MESSAGES.evening;
            else possibleMessages = MESSAGES.idle;
        }

        // Logic to pick a message occasionally (not spamming)
        const randomMsg = possibleMessages[Math.floor(Math.random() * possibleMessages.length)];

        // Update thought
        setThought({ state: newState, message: randomMsg });

    }, [tasks, isTimerRunning, hour, MESSAGES, activeTask, completedCount]); // Added activeTask dependency

    return thought;
};

// ══════════════════════════════════════════
// 🧩 MAIN COMPONENT
// ══════════════════════════════════════════

export default function Companion({ tasks = [], isTimerRunning = false, user, onClick, state: overrideState, message: overrideMessage }) {
    // Determine if tasks is paginated object or array
    const tasksArray = Array.isArray(tasks) ? tasks : (tasks?.data || []);
    const brain = useCompanionBrain(tasksArray, isTimerRunning, user);

    // Use overrides if provided, otherwise generic brain
    const state = overrideState && overrideState !== 'idle' ? overrideState : brain.state;
    const message = overrideMessage || brain.message;
    const [isHovered, setIsHovered] = useState(false);
    const [visibleMessage, setVisibleMessage] = useState(null);

    // Show message when state changes or on hover
    useEffect(() => {
        if (message && state !== 'sleeping') {
            setVisibleMessage(message);
            const timer = setTimeout(() => setVisibleMessage(null), 8000); // Hide after 8s
            return () => clearTimeout(timer);
        }
    }, [message, state]);

    const variants = {
        idle: { y: [0, -2, 0], transition: { repeat: Infinity, duration: 3, ease: "easeInOut" } },
        focusing: { scale: 1.05, transition: { duration: 0.5 } },
        celebrating: { y: [0, -8, 0], transition: { repeat: 3, duration: 0.35 } },
        sleeping: { opacity: 0.8, scale: 0.95 },
        guiding: { y: [0, -2, 0], transition: { repeat: Infinity, duration: 2.5, ease: "easeInOut" } },
    };

    return (
        <div className="fixed bottom-24 sm:bottom-4 right-4 z-50 flex flex-col items-end pointer-events-none" style={{ maxWidth: '200px' }}>
            {/* Dialogue Bubble */}
            <AnimatePresence>
                {(visibleMessage || isHovered) && state !== 'sleeping' && (
                    <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.85 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.85 }}
                        className="mb-2 mr-1 bg-white dark:bg-slate-800 px-3 py-2 rounded-xl rounded-br-none shadow-lg border border-slate-200 dark:border-slate-700 max-w-[170px] pointer-events-auto"
                    >
                        <p className="text-[11px] text-slate-700 dark:text-slate-200 font-medium leading-tight">
                            {visibleMessage || "Ada yang bisa dibantu?"}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Pixel Character */}
            <motion.div
                variants={variants}
                animate={state}
                className="cursor-pointer pointer-events-auto hover:scale-110 transition-transform duration-200 p-2"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={onClick}
                whileTap={{ scale: 0.85 }}
                title="Kiko — Your Productivity Companion"
            >
                <PixelCharacter mood={state} />
            </motion.div>
        </div>
    );
}
