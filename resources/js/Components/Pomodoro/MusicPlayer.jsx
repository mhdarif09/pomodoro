
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MusicalNoteIcon, XMarkIcon, ChevronDownIcon } from '@heroicons/react/24/solid';

const PLAYLISTS = [
    { id: 'lofi', name: 'Lofi Girl ☕', url: 'https://open.spotify.com/embed/playlist/0vvXsWCC9xrXsKd4FyS8kM' },
    { id: 'taylor', name: 'Taylor Swift 🧣', url: 'https://open.spotify.com/embed/playlist/7G7nC44qCeyXlJuoqqTQuK' },
    { id: 'focus', name: 'Deep Focus 🧠', url: 'https://open.spotify.com/embed/playlist/37i9dQZF1DWZeKCadgRdKQ' },
    { id: 'classical', name: 'Classical 🎻', url: 'https://open.spotify.com/embed/playlist/37i9dQZF1DWWEJlAGA9gs0' },
    { id: 'noise', name: 'White Noise 🌧️', url: 'https://open.spotify.com/embed/playlist/37i9dQZF1DwW1DWNZprP74' },
];

export default function MusicPlayer() {
    const [isOpen, setIsOpen] = useState(false);
    const [activePlaylist, setActivePlaylist] = useState(PLAYLISTS[0]); // Default to Lofi
    const [isPlaying, setIsPlaying] = useState(false);

    // Load saved playlist preference
    useEffect(() => {
        const saved = localStorage.getItem('pomodoro_music_playlist');
        if (saved) {
            const found = PLAYLISTS.find(p => p.id === saved);
            if (found) setActivePlaylist(found);
        }
    }, []);

    const handlePlaylistChange = (playlist) => {
        setActivePlaylist(playlist);
        localStorage.setItem('pomodoro_music_playlist', playlist.id);
        setIsPlaying(true);
    };

    return (
        <div className="relative">
            {/* Toggle Button - Matches Island Aesthetics */}
            <button
                onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
                className={`flex items-center gap-2 px-3 py-3 rounded-2xl transition-all duration-300 active:scale-95 border
                    ${isOpen || isPlaying
                        ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.3)]'
                        : 'bg-white/5 border-transparent hover:bg-white/10 text-slate-400 hover:text-white'
                    }`}
                title="Focus Music"
            >
                <MusicalNoteIcon className={`w-5 h-5 ${isPlaying ? 'animate-pulse' : ''}`} />
                <AnimatePresence>
                    {(isOpen || isPlaying) && (
                        <motion.span
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: 'auto', opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            className="text-[10px] font-black uppercase tracking-wider whitespace-nowrap overflow-hidden"
                        >
                            {activePlaylist.name.split(' ')[0]}
                        </motion.span>
                    )}
                </AnimatePresence>
            </button>

            {/* Popup Menu - Persistent in DOM for continuous playback */}
            <motion.div
                initial="closed"
                animate={isOpen ? "open" : "closed"}
                variants={{
                    open: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', pointerEvents: 'auto', visibility: 'visible' },
                    closed: { opacity: 0, y: -15, scale: 0.9, filter: 'blur(10px)', pointerEvents: 'none', transitionEnd: { visibility: 'hidden' } }
                }}
                className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-80 bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden z-[60]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/5">
                    <div className="flex items-center gap-2">
                        <MusicalNoteIcon className="w-3 h-3 text-indigo-400" />
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Spotify Vibes</span>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                        <ChevronDownIcon className="w-4 h-4" />
                    </button>
                </div>

                {/* Playlist List */}
                <div className="p-2 space-y-1">
                    {PLAYLISTS.map(playlist => (
                        <button
                            key={playlist.id}
                            onClick={() => handlePlaylistChange(playlist)}
                            className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all group
                                ${activePlaylist.id === playlist.id
                                    ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25'
                                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                                }`}
                        >
                            <span>{playlist.name}</span>
                            {activePlaylist.id === playlist.id && (
                                <div className="flex gap-0.5 items-end h-3">
                                    <div className="w-0.5 bg-white/80 animate-[music-bar_0.5s_ease-in-out_infinite] h-2"></div>
                                    <div className="w-0.5 bg-white/80 animate-[music-bar_0.7s_ease-in-out_infinite] h-3"></div>
                                    <div className="w-0.5 bg-white/80 animate-[music-bar_0.4s_ease-in-out_infinite] h-1.5"></div>
                                </div>
                            )}
                        </button>
                    ))}
                </div>

                {/* Player Embed */}
                <div className="p-1 bg-black/40 border-t border-white/5">
                    <div className="rounded-2xl overflow-hidden bg-black h-[80px] shadow-inner relative">
                        <iframe
                            key={activePlaylist.id}
                            src={`${activePlaylist.url}?utm_source=generator&autoplay=1`}
                            width="100%"
                            height="80"
                            frameBorder="0"
                            allowFullScreen=""
                            allow="autoplay *; encrypted-media *; clipboard-write; fullscreen; picture-in-picture"
                            className="opacity-90 hover:opacity-100 transition-opacity"
                        ></iframe>
                    </div>
                    <p className="text-[9px] text-slate-500 text-center py-1 cursor-default">
                        Browser memblokir autoplay? <span className="text-indigo-400">Klik play manual</span> jika hening.
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
