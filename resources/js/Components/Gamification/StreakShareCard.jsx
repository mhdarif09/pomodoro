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
            className={`share-card-capture relative overflow-hidden bg-slate-950 flex flex-col justify-between p-8 text-white`}
            style={{ 
                width: isSquare ? '1080px' : '1080px',
                height: isSquare ? '1080px' : '1920px',
                fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
                // Explicitly use large pixels for capture node to ensure high quality
                // and avoid scaling issues with smaller relative units
            }}
        >
            {/* Background elements - using more robust gradients */}
            <div className={`absolute inset-0 bg-slate-950`} />
            <div className={`absolute inset-0 bg-gradient-to-br ${getGradient(data.user.rank_title)} opacity-40`} />
            
            {/* Decorative Orbs - use simple divs with background colors instead of complex blurs if possible */}
            <div className="absolute -top-1/4 -right-1/4 w-[800px] h-[800px] bg-white/5 rounded-full blur-[120px]" />
            <div className="absolute -bottom-1/4 -left-1/4 w-[800px] h-[800px] bg-white/5 rounded-full blur-[120px]" />
            
            {/* Texture overlay - simplify to avoid rendering issues */}
            <div className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

            {/* Content Container to ensure padding and alignment */}
            <div className="relative z-10 flex flex-col h-full justify-between">
                
                {/* Header: User Info */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-5xl font-black uppercase tracking-tighter mb-1 leading-tight">{data.user.name}</h2>
                        <div className="flex items-center gap-3">
                            <span className="px-4 py-1.5 bg-white/10 rounded-full text-xl font-bold border border-white/20">
                                {data.user.rank_title}
                            </span>
                            <span className="text-2xl font-medium text-white/70">Level {data.user.level}</span>
                        </div>
                    </div>
                    {/* Minimal Logo */}
                    <div className="bg-white/20 px-6 py-3 rounded-2xl border border-white/30">
                        <span className="font-extrabold text-2xl tracking-tight">SarangTumbuh.site</span>
                    </div>
                </div>

                {/* Center: The big streak number */}
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="relative mb-8">
                        {/* Glowing background for the fire icon */}
                        <div className="absolute inset-0 bg-orange-500 blur-[80px] opacity-60 rounded-full scale-150" />
                        <FireIcon className="w-48 h-48 text-orange-400 relative z-10 drop-shadow-[0_0_30px_rgba(251,146,60,0.8)]" />
                    </div>
                    
                    <div className="text-center">
                        <h1 className="text-[280px] font-[1000] tracking-tighter text-white leading-none mb-4 drop-shadow-2xl">
                            {data.streak.current}
                        </h1>
                        <p className="text-5xl font-black uppercase tracking-[0.2em] text-orange-300 drop-shadow-md">
                            Day Streak
                        </p>
                    </div>
                    
                    {data.streak.current === data.streak.longest && data.streak.current > 0 && (
                        <div className="mt-12 bg-gradient-to-r from-amber-400 to-orange-500 px-8 py-3 rounded-2xl shadow-xl text-2xl font-black text-slate-900 uppercase tracking-wider animate-pulse">
                            🏆 Rekor Baru!
                        </div>
                    )}
                </div>

                {/* Bottom Section */}
                <div className="space-y-8">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="bg-white/15 rounded-3xl p-8 border border-white/20 flex flex-col items-center text-center shadow-lg">
                            <ClockIcon className="w-12 h-12 text-emerald-400 mb-3" />
                            <span className="text-6xl font-black mb-1">{data.this_week.focus_hours}h</span>
                            <span className="text-xl uppercase font-bold text-white/60 tracking-widest leading-tight">Focus Time<br/>This Week</span>
                        </div>
                        
                        <div className="bg-white/15 rounded-3xl p-8 border border-white/20 flex flex-col items-center text-center shadow-lg">
                            <CheckCircleIcon className="w-12 h-12 text-emerald-400 mb-3" />
                            <span className="text-6xl font-black mb-1">{data.this_week.tasks_completed}</span>
                            <span className="text-xl uppercase font-bold text-white/60 tracking-widest leading-tight">Tasks Done<br/>This Week</span>
                        </div>
                    </div>

                    {/* Heatmap (only visible in Story mode) */}
                    {!isSquare && (
                        <div className="bg-white/10 rounded-3xl p-8 border border-white/15">
                            <p className="text-xl uppercase font-black text-white/70 tracking-[0.3em] text-center mb-8">Activity Last 7 Days</p>
                            <div className="flex justify-between items-center px-4">
                                {data.last_7_days.map((day, idx) => (
                                    <div key={idx} className="flex flex-col items-center gap-4">
                                        <div className={`w-14 h-14 rounded-2xl ${day.active ? 'bg-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.6)] border-white/20' : 'bg-white/10 border-white/5'} border-2 transition-all`} />
                                        <span className={`text-xl ${day.active ? 'text-emerald-400 font-black' : 'text-white/40 font-bold'} uppercase`}>
                                            {day.day_short}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Footer Message */}
                    <div className="pt-8 text-center">
                        <p className="text-2xl font-bold text-white/40 tracking-wide">✨ Start your journey at <span className="text-white/70 font-black">sarangtumbuh.site</span></p>
                    </div>
                </div>
            </div>
        </div>
        </div>
    );
});

export default StreakShareCard;
