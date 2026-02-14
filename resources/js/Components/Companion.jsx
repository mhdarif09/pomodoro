import React, { useState, useEffect } from 'react';
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
        // Row 0: top of hair
        [_, _, _, _, _, K, K, K, K, K, K, _, _, _, _, _],
        // Row 1
        [_, _, _, _, K, H, H, Hl, H, H, H, K, _, _, _, _],
        // Row 2
        [_, _, _, K, H, H, Hl, Hl, H, H, H, H, K, _, _, _],
        // Row 3: hair sides + forehead
        [_, _, K, H, H, S, S, S, S, S, S, H, H, K, _, _],
        // Row 4: fringe detail
        [_, _, K, H, S, S, S, S, S, S, S, S, H, K, _, _],
    ];

    // Face varies by mood
    let face;
    if (mood === 'focusing') {
        face = [
            // Row 5: headband
            [_, _, K, C.Hb, C.Hb, C.Hb, C.Hb, C.Hb, C.Hb, C.Hb, C.Hb, C.Hb, C.Hb, K, _, _],
            // Row 6: eyes (determined)
            [_, _, K, S, S, K, K, S, S, K, K, S, S, K, _, _],
            // Row 7: lower eyes
            [_, _, K, S, S, K, P, S, S, K, P, S, S, K, _, _],
            // Row 8: nose area
            [_, _, _, K, S, S, S, S, S, S, S, S, K, _, _, _],
            // Row 9: mouth (flat line = focused)
            [_, _, _, K, S, S, K, K, K, K, S, S, K, _, _, _],
        ];
    } else if (mood === 'celebrating') {
        face = [
            // Row 5: forehead
            [_, _, K, S, S, S, S, S, S, S, S, S, S, K, _, _],
            // Row 6: happy eyes (^ ^)
            [_, _, K, S, S, _, K, S, S, _, K, S, S, K, _, _],
            // Row 7: closed happy eyes
            [_, _, K, S, K, _, _, K, K, _, _, K, S, K, _, _],
            // Row 8: blush + nose
            [_, _, _, K, Bl, S, S, S, S, S, S, Bl, K, _, _, _],
            // Row 9: big smile
            [_, _, _, K, S, K, C.M, C.M, C.M, C.M, K, S, K, _, _, _],
        ];
    } else if (mood === 'sleeping') {
        face = [
            // Row 5
            [_, _, K, S, S, S, S, S, S, S, S, S, S, K, _, _],
            // Row 6: — — eyes
            [_, _, K, S, S, K, K, S, S, K, K, S, S, K, _, _],
            // Row 7
            [_, _, K, S, S, S, S, S, S, S, S, S, S, K, _, _],
            // Row 8
            [_, _, _, K, S, S, S, S, S, S, S, S, K, _, _, _],
            // Row 9: small "o" mouth
            [_, _, _, K, S, S, S, K, K, S, S, S, K, _, _, _],
        ];
    } else {
        // idle / guiding
        face = [
            // Row 5
            [_, _, K, S, S, S, S, S, S, S, S, S, S, K, _, _],
            // Row 6: eyes
            [_, _, K, S, S, E, E, S, S, E, E, S, S, K, _, _],
            // Row 7: pupils
            [_, _, K, S, S, E, P, S, S, E, P, S, S, K, _, _],
            // Row 8: nose area
            [_, _, _, K, S, S, S, K, S, S, S, S, K, _, _, _],
            // Row 9: small smile
            [_, _, _, K, S, S, K, C.Md, C.Md, K, S, S, K, _, _, _],
        ];
    }

    // Body (rows 10-14)
    let body;
    if (mood === 'celebrating') {
        body = [
            // Row 10: neck + raised arms start
            [_, _, _, _, K, S, T, T, T, T, S, K, _, _, _, _],
            // Row 11: arms up!
            [_, S, K, K, T, T, Tl, T, T, Tl, T, T, K, K, S, _],
            // Row 12: torso
            [_, _, _, K, T, Tl, T, T, T, T, Tl, T, K, _, _, _],
            // Row 13
            [_, _, _, K, T, T, Td, T, T, Td, T, T, K, _, _, _],
            // Row 14: bottom torso 
            [_, _, _, _, K, T, T, T, T, T, T, K, _, _, _, _],
        ];
    } else {
        body = [
            // Row 10: neck
            [_, _, _, _, _, K, S, S, S, S, K, _, _, _, _, _],
            // Row 11: shoulders
            [_, _, _, K, K, T, T, Tl, T, T, T, K, K, _, _, _],
            // Row 12: torso + arms
            [_, _, K, S, T, T, Tl, T, T, Tl, T, T, S, K, _, _],
            // Row 13
            [_, _, K, S, T, T, Td, T, T, Td, T, T, S, K, _, _],
            // Row 14: waist
            [_, _, _, K, T, T, T, T, T, T, T, T, K, _, _, _],
        ];
    }

    // Legs (rows 15-19)
    const legs = [
        // Row 15: belt area
        [_, _, _, _, K, P4, P4, P4l, P4, P4, P4, K, _, _, _, _],
        // Row 16: upper legs
        [_, _, _, _, K, P4, P4l, P4, P4, P4l, P4, K, _, _, _, _],
        // Row 17: lower legs
        [_, _, _, _, K, P4, K, _, _, K, P4, K, _, _, _, _],
        // Row 18: ankles
        [_, _, _, _, K, P4, K, _, _, K, P4, K, _, _, _, _],
        // Row 19: shoes
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
                            <rect
                                key={`${x}-${y}`}
                                x={x * PIXEL}
                                y={y * PIXEL}
                                width={PIXEL}
                                height={PIXEL}
                                fill={color}
                            />
                        ) : null
                    )
                )}
            </svg>

            {/* Zzz for sleeping */}
            {mood === 'sleeping' && (
                <>
                    <motion.span
                        className="absolute -top-1 -right-2 text-indigo-400 font-mono select-none"
                        style={{ fontSize: '8px', fontWeight: 900 }}
                        animate={{ opacity: [0.2, 1, 0.2], y: [0, -3, 0] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                    >z</motion.span>
                    <motion.span
                        className="absolute -top-3 right-0 text-indigo-300 font-mono select-none"
                        style={{ fontSize: '10px', fontWeight: 900 }}
                        animate={{ opacity: [0.2, 1, 0.2], y: [0, -3, 0] }}
                        transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
                    >Z</motion.span>
                </>
            )}

            {/* Sparkles for celebrating */}
            {mood === 'celebrating' && (
                <>
                    <motion.span
                        className="absolute -top-4 -left-3 text-yellow-400 select-none"
                        style={{ fontSize: '10px' }}
                        animate={{ opacity: [0, 1, 0], scale: [0.5, 1.3, 0.5], rotate: [0, 180, 360] }}
                        transition={{ repeat: Infinity, duration: 0.8 }}
                    >✦</motion.span>
                    <motion.span
                        className="absolute -top-2 -right-4 text-amber-400 select-none"
                        style={{ fontSize: '8px' }}
                        animate={{ opacity: [0, 1, 0], scale: [0.5, 1.3, 0.5] }}
                        transition={{ repeat: Infinity, duration: 0.8, delay: 0.3 }}
                    >★</motion.span>
                    <motion.span
                        className="absolute top-1 -left-4 text-orange-300 select-none"
                        style={{ fontSize: '7px' }}
                        animate={{ opacity: [0, 1, 0], y: [2, -4, 2] }}
                        transition={{ repeat: Infinity, duration: 1, delay: 0.6 }}
                    >✧</motion.span>
                </>
            )}

            {/* Focus aura */}
            {mood === 'focusing' && (
                <motion.div
                    className="absolute inset-0 rounded-full border-2 border-indigo-400/30"
                    style={{ margin: '-4px' }}
                    animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0, 0.4] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                />
            )}
        </div>
    );
};

export default function Companion({ state = 'idle', message = null, onClick }) {
    const [isHovered, setIsHovered] = useState(false);
    const [localMessage, setLocalMessage] = useState(message);

    useEffect(() => {
        if (message) {
            setLocalMessage(message);
            const timer = setTimeout(() => setLocalMessage(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    const variants = {
        idle: { y: [0, -2, 0], transition: { repeat: Infinity, duration: 3, ease: "easeInOut" } },
        focusing: { scale: 1.05, transition: { duration: 0.5 } },
        celebrating: { y: [0, -8, 0], transition: { repeat: 3, duration: 0.35 } },
        sleeping: { opacity: 0.8, scale: 0.95 },
        guiding: { y: [0, -2, 0], transition: { repeat: Infinity, duration: 2.5, ease: "easeInOut" } },
    };

    return (
        <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end pointer-events-none" style={{ maxWidth: '200px' }}>
            {/* Dialogue Bubble */}
            <AnimatePresence>
                {(localMessage || isHovered) && (
                    <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.85 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.85 }}
                        className="mb-2 mr-1 bg-white dark:bg-slate-800 px-3 py-2 rounded-xl rounded-br-none shadow-lg border border-slate-200 dark:border-slate-700 max-w-[170px] pointer-events-auto"
                    >
                        <p className="text-[11px] text-slate-700 dark:text-slate-200 font-medium leading-tight">
                            {localMessage || "Siap produktif? 🚀"}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Pixel Character */}
            <motion.div
                variants={variants}
                animate={state}
                className="cursor-pointer pointer-events-auto hover:scale-125 transition-transform duration-200 p-2"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={onClick}
                whileTap={{ scale: 0.85 }}
                title="Kiko — Companion"
            >
                <PixelCharacter mood={state} />
            </motion.div>
        </div>
    );
}
