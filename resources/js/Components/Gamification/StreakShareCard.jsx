import { forwardRef } from 'react';
import { FireIcon, CheckCircleIcon, ClockIcon } from '@heroicons/react/24/solid';

const StreakShareCard = forwardRef(({ data, format = 'story' }, ref) => {
    if (!data) return null;

    // "story" = 1080x1920 ratio (9:16)
    // "square" = 1080x1080 ratio (1:1)
    
    // We use a fixed aspect ratio container that will be scaled by html2canvas
    // Using aspect-video or custom aspects for the canvas Capture
    const isSquare = format === 'square';
    
    // Gradient themes based on rank
    const getGradient = (rank) => {
        const lowerRank = (rank || '').toLowerCase();
        if (lowerRank.includes('master')) return 'from-amber-600 via-yellow-500 to-orange-500';
        if (lowerRank.includes('expert')) return 'from-indigo-600 via-purple-500 to-pink-500';
        return 'from-emerald-600 via-teal-500 to-cyan-500'; // Default SarangTumbuh green/teal
    };

    return (
        <div 
            ref={ref}
            // Add a specific class to ensure html2canvas can target a clean node
            className={`share-card-capture relative overflow-hidden bg-slate-900 flex flex-col justify-between p-8 text-white ${isSquare ? 'aspect-square w-[400px]' : 'aspect-[9/16] w-[360px]'}`}
            style={{ 
                // We use fixed widths for the DOM node so the canvas renders consistently,
                // but we will scale it up during export for high-res.
                fontFamily: "'Inter', sans-serif" 
            }}
        >
            {/* Background elements */}
            <div className={`absolute inset-0 bg-gradient-to-br ${getGradient(data.user.rank_title)} opacity-30`} />
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            
            {/* Noise overlay for texture */}
            <div className="absolute inset-0 opacity-20 mix-blend-overlay" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noiseFilter\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.65\" numOctaves=\"3\" stitchTiles=\"stitch\"/%3E%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23noiseFilter)\"/%3E%3C/svg%3E')" }} />

            {/* Header: User Info */}
            <div className="relative z-10 flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-black uppercase tracking-wider">{data.user.name}</h2>
                    <p className="text-white/70 font-medium text-sm">
                        {data.user.rank_title} • Lvl {data.user.level}
                    </p>
                </div>
                {/* Minimal Logo */}
                <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
                    <span className="font-bold text-sm tracking-tight">SarangTumbuh</span>
                </div>
            </div>

            {/* Center: The big streak number */}
            <div className="relative z-10 flex flex-col items-center justify-center flex-1 my-8">
                <div className="relative">
                    {/* Glowing background for the fire icon */}
                    <div className="absolute inset-0 bg-orange-500 blur-2xl opacity-50 rounded-full scale-150" />
                    <FireIcon className="w-20 h-20 text-orange-400 relative z-10 drop-shadow-2xl mb-2" />
                </div>
                
                <h1 className="text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70 drop-shadow-lg leading-none mb-2">
                    {data.streak.current}
                </h1>
                <p className="text-xl font-bold uppercase tracking-widest text-orange-200">
                    Day Streak
                </p>
                
                {data.streak.current === data.streak.longest && data.streak.current > 0 && (
                    <div className="mt-4 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 text-sm font-semibold text-yellow-300">
                        🏆 New Personal Best!
                    </div>
                )}
            </div>

            {/* Bottom: Stats Grid */}
            <div className="relative z-10 grid grid-cols-2 gap-3 mb-6">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex flex-col items-center text-center">
                    <ClockIcon className="w-6 h-6 text-emerald-400 mb-2" />
                    <span className="text-2xl font-black">{data.this_week.focus_hours}h</span>
                    <span className="text-[10px] uppercase font-bold text-white/60 tracking-wider">Jam Fokus<br/>Minggu Ini</span>
                </div>
                
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex flex-col items-center text-center">
                    <CheckCircleIcon className="w-6 h-6 text-emerald-400 mb-2" />
                    <span className="text-2xl font-black">{data.this_week.tasks_completed}</span>
                    <span className="text-[10px] uppercase font-bold text-white/60 tracking-wider">Tugas Selesai<br/>Minggu Ini</span>
                </div>
            </div>

            {/* Heatmap (only visible in Story mode as it takes space) */}
            {!isSquare && (
                <div className="relative z-10 bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 mb-6">
                    <p className="text-[10px] uppercase font-bold text-white/60 tracking-wider text-center mb-3">Aktivitas 7 Hari Terakhir</p>
                    <div className="flex justify-between items-center px-2">
                        {data.last_7_days.map((day, idx) => (
                            <div key={idx} className="flex flex-col items-center gap-2">
                                <div className={`w-6 h-6 rounded-md ${day.active ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-white/10'} border border-white/5`} />
                                <span className="text-[9px] text-white/50 uppercase font-bold">{day.day_short}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Footer */}
            <div className="relative z-10 text-center opacity-60">
                <p className="text-xs font-medium">✨ Build your focus habit at sarangtumbuh.com</p>
            </div>
        </div>
    );
});

export default StreakShareCard;
