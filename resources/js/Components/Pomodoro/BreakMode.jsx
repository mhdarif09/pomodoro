import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MagnifyingGlassIcon, MinusIcon, InformationCircleIcon, LanguageIcon } from '@heroicons/react/24/outline'; // Added LanguageIcon
import axios from 'axios';
import { useLanguage } from '../../Contexts/LanguageContext';
import useKeyboardShortcuts from '../../Hooks/useKeyboardShortcuts';

export default function BreakMode({
    duration = 5,
    timeLeft,
    isPaused,
    onTogglePause,
    onBreakEnd,
    onSkipBreak,
    onMinimize,
    isMinimized,
    preferences = {}
}) {
    const { t, language, toggleLanguage } = useLanguage();

    // Keyboard Shortcuts
    useKeyboardShortcuts({
        'Space': onTogglePause,
        'Escape': onMinimize
    });

    const [selectedActivity, setSelectedActivity] = useState(preferences.preferredActivity || 'rest');
    const [customUrl, setCustomUrl] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [activeProvider, setActiveProvider] = useState('youtube');
    const [searchMessage, setSearchMessage] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const extractYouTubeId = (url) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const handleSearch = async () => {
        if (!searchQuery.trim() || isSearching) return;
        setCustomUrl('');
        setSearchMessage('');
        setIsSearching(true);

        const query = searchQuery;
        const isUrl = query.includes('http') || query.includes('.com');
        const isSpotifyLink = query.includes('spotify.com');

        // 1. Client-Side Link Handling (Immediate)
        if (activeProvider === 'spotify' && isSpotifyLink) {
            let embedUrl = query;
            if (!query.includes('/embed/')) {
                embedUrl = query.replace('open.spotify.com/', 'open.spotify.com/embed/');
            }
            setCustomUrl(embedUrl);
            setShowSearch(false);
            setIsSearching(false);
            return;
        }

        if (activeProvider === 'youtube' && isUrl) {
            const videoId = extractYouTubeId(query);
            if (videoId) {
                setCustomUrl(`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`);
                setShowSearch(false);
                setIsSearching(false);
                return;
            }
        }

        // 2. Server-Side ID Resolution (Title Search)
        let source = activeProvider;

        if (activeProvider === 'spotify' && !isUrl) {
            source = 'youtube';
            setSearchMessage('Searching on YouTube (Spotify Title Search)...');
        } else {
            setSearchMessage(`Searching "${query}"...`);
        }

        try {
            // Call Backend
            const response = await axios.get(route('api.media.search'), {
                params: { q: query, source: source }
            });

            if (response.data && response.data.id) {
                if (response.data.source === 'youtube') {
                    setActiveProvider('youtube');
                    setSelectedActivity('youtube');
                    setCustomUrl(`https://www.youtube-nocookie.com/embed/${response.data.id}?autoplay=1`);
                } else if (response.data.source === 'spotify') {
                    setCustomUrl(`https://open.spotify.com/embed/track/${response.data.id}`);
                }
                setSearchMessage('');
                setShowSearch(false);
            }
        } catch (error) {
            console.error(error);
            setSearchMessage('Could not find content. Try a specific title.');
        } finally {
            setIsSearching(false);
        }
    };

    const defaultVideos = {
        lofi: 'jfKfPfyJRdk',
        nature: '5qap5aO4i9A',
    };

    const activities = [
        { id: 'rest', label: t('just_rest'), icon: '☕', description: t('recharge') },
        { id: 'music', label: t('quick_lofi'), icon: '🎵', description: 'Instant chill beats' },
        { id: 'youtube', label: t('youtube'), icon: '📺', description: t('search_youtube') },
        { id: 'spotify', label: t('spotify'), icon: '🎧', description: t('search_spotify') },
    ];

    const progress = ((duration * 60 - timeLeft) / (duration * 60)) * 100;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: isMinimized ? 0 : 1, scale: isMinimized ? 0.9 : 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`fixed inset-0 z-50 overflow-y-auto bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 scrollbar-hide ${isMinimized ? 'pointer-events-none' : ''}`}
        >
            <div className="min-h-full flex items-center justify-center p-4 sm:p-6">
                {/* Ambient Background */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 left-0 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] bg-emerald-400/20 rounded-full blur-[150px] animate-pulse"></div>
                    <div className="absolute bottom-0 right-0 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] bg-teal-400/20 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '1s' }}></div>
                </div>

                <div className="relative z-10 max-w-4xl w-full">
                    {/* Header Controls */}
                    <div className="absolute top-0 right-0 flex gap-2">
                        {/* Language Toggle */}
                        <button
                            onClick={toggleLanguage}
                            className="px-3 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-1 text-xs font-bold uppercase"
                            title="Switch Language"
                        >
                            <LanguageIcon className="w-4 h-4" />
                            {language === 'id' ? 'ID' : 'EN'}
                        </button>

                        <button
                            onClick={onMinimize}
                            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                            title={t('minimize')}
                        >
                            <MinusIcon className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Timer Display */}
                    <div className="text-center mb-8 sm:mb-12 pt-8 sm:pt-0">
                        <motion.h1
                            className="text-5xl sm:text-6xl md:text-8xl font-black text-white mb-4 tracking-tighter"
                        >
                            {formatTime(timeLeft)}
                        </motion.h1>
                        <p className="text-emerald-100 text-lg sm:text-xl font-semibold">{t('break_time')} - {t('recharge')}</p>

                        {/* Progress Ring */}
                        <div className="mt-6 sm:mt-8 flex justify-center">
                            <svg className="w-24 h-24 sm:w-32 sm:h-32 transform -rotate-90">
                                <circle cx="64" cy="64" r="56" stroke="white" strokeWidth="8" fill="none" opacity="0.2" className="hidden sm:block" />
                                <circle
                                    cx="64"
                                    cy="64"
                                    r="56"
                                    stroke="white"
                                    strokeWidth="8"
                                    fill="none"
                                    strokeDasharray={`${2 * Math.PI * 56}`}
                                    strokeDashoffset={`${2 * Math.PI * 56 * (1 - progress / 100)}`}
                                    strokeLinecap="round"
                                    className="transition-all duration-300 hidden sm:block"
                                />
                            </svg>
                        </div>
                    </div>

                    {/* Activity Selector */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
                        {activities.map(activity => (
                            <motion.button
                                key={activity.id}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                    setSelectedActivity(activity.id);
                                    setActiveProvider(activity.id === 'spotify' ? 'spotify' : 'youtube');
                                    setSearchMessage('');
                                    if (activity.id === 'youtube' || activity.id === 'spotify') setShowSearch(true);
                                    else setShowSearch(false);
                                }}
                                className={`p-4 sm:p-6 rounded-xl sm:rounded-2xl backdrop-blur-xl transition-all ${selectedActivity === activity.id
                                        ? 'bg-white text-emerald-900 shadow-2xl'
                                        : 'bg-white/10 text-white hover:bg-white/20'
                                    }`}
                            >
                                <div className="text-3xl sm:text-4xl mb-2">{activity.icon}</div>
                                <div className="font-bold text-sm sm:text-base mb-1">{activity.label}</div>
                                <div className="text-xs opacity-75 hidden sm:block">{activity.description}</div>
                            </motion.button>
                        ))}
                    </div>

                    {/* Search / Input Bar */}
                    {(showSearch || selectedActivity === 'youtube' || selectedActivity === 'spotify') && (
                        <div className="mb-6 sm:mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder={activeProvider === 'spotify' ? t('search_spotify') : t('search_youtube')}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    className="flex-1 px-4 py-3 rounded-xl bg-white/20 backdrop-blur-xl border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                                    disabled={isSearching}
                                />
                                <button
                                    onClick={handleSearch}
                                    disabled={isSearching}
                                    className="px-6 py-3 rounded-xl bg-white text-emerald-900 font-bold hover:bg-emerald-50 transition-colors flex items-center gap-2 disabled:opacity-70"
                                >
                                    {isSearching ? (
                                        <div className="w-5 h-5 border-2 border-emerald-900 border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <MagnifyingGlassIcon className="w-5 h-5" />
                                    )}
                                    <span className="hidden sm:inline">
                                        Search
                                    </span>
                                </button>
                            </div>
                            {searchMessage && (
                                <p className="text-emerald-300 text-sm mt-2 flex items-center gap-1">
                                    <InformationCircleIcon className="w-4 h-4" /> {searchMessage}
                                </p>
                            )}
                            {activeProvider === 'spotify' && (
                                <div className="mt-2 flex justify-end">
                                    <a
                                        href="/auth/spotify/redirect"
                                        className="text-[10px] sm:text-xs text-white/40 hover:text-[#1DB954] hover:bg-white/10 px-2 py-1 rounded-full transition-all flex items-center gap-1.5"
                                        title="Link customized Spotify account"
                                    >
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#1DB954]"></div>
                                        {t('connect_spotify')}
                                    </a>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Content Area */}
                    <div className="mb-6 sm:mb-8 rounded-2xl sm:rounded-3xl overflow-hidden bg-black/20 backdrop-blur-xl border border-white/10 min-h-[250px] sm:min-h-[350px] flex items-center justify-center relative shadow-inner">
                        <AnimatePresence mode="wait">
                            {selectedActivity === 'rest' && (
                                <motion.div
                                    key="rest"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="text-center p-8 sm:p-12"
                                >
                                    <div className="text-6xl sm:text-8xl mb-6 animate-pulse">☕</div>
                                    <p className="text-white text-xl sm:text-2xl font-bold mb-2">{t('just_rest')}</p>
                                    <p className="text-emerald-100 text-sm sm:text-base">Close your eyes and relax</p>
                                </motion.div>
                            )}
                            {selectedActivity === 'music' && (
                                <motion.div
                                    key="music"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="w-full h-[250px] sm:h-[350px]"
                                >
                                    <iframe
                                        width="100%"
                                        height="100%"
                                        src={`https://www.youtube-nocookie.com/embed/${defaultVideos.lofi}?autoplay=1&loop=1&playlist=${defaultVideos.lofi}`}
                                        title="Lo-fi Music"
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        className="rounded-xl sm:rounded-2xl"
                                    ></iframe>
                                </motion.div>
                            )}
                            {selectedActivity === 'youtube' && customUrl && (
                                <motion.div
                                    key="youtube-custom"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="w-full h-[250px] sm:h-[350px]"
                                >
                                    <iframe
                                        width="100%"
                                        height="100%"
                                        src={customUrl}
                                        title="YouTube Content"
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        className="rounded-xl sm:rounded-2xl"
                                    ></iframe>
                                </motion.div>
                            )}
                            {selectedActivity === 'spotify' && customUrl && (
                                <motion.div
                                    key="spotify-custom"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="w-full h-[250px] sm:h-[350px]"
                                >
                                    <iframe
                                        style={{ borderRadius: '12px' }}
                                        src={customUrl}
                                        width="100%"
                                        height="100%"
                                        frameBorder="0"
                                        allowFullScreen=""
                                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                        loading="lazy"
                                    ></iframe>
                                </motion.div>
                            )}

                            {(selectedActivity === 'youtube' || selectedActivity === 'spotify') && !customUrl && !isSearching && (
                                <motion.div
                                    key="empty"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-center opacity-50"
                                >
                                    <p>Select media to play</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onTogglePause}
                            className="px-6 sm:px-8 py-3 sm:py-4 rounded-full bg-white/20 backdrop-blur-xl text-white font-bold text-base sm:text-lg hover:bg-white/30 transition-all border border-white/20"
                        >
                            {isPaused ? `▶️ ${t('resume')}` : `⏸️ ${t('pause')}`}
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onSkipBreak}
                            className="px-6 sm:px-8 py-3 sm:py-4 rounded-full bg-white text-emerald-900 font-bold text-base sm:text-lg hover:bg-emerald-50 transition-all shadow-xl"
                        >
                            {t('skip_break')} →
                        </motion.button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
