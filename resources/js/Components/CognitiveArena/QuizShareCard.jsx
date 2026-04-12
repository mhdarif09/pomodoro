import { forwardRef } from 'react';

const QuizShareCard = forwardRef(({ data, format = 'square' }, ref) => {
    if (!data) return null;

    const isSquare = format === 'square';

    const getScoreGradient = (score) => {
        if (score >= 80) return 'from-emerald-600 via-teal-500 to-cyan-500';
        if (score >= 60) return 'from-indigo-600 via-purple-500 to-violet-500';
        if (score >= 40) return 'from-amber-500 via-orange-500 to-yellow-500';
        return 'from-rose-600 via-pink-500 to-red-500';
    };

    const getScoreLabel = (score) => {
        if (score >= 90) return 'Luar Biasa! 🏆';
        if (score >= 80) return 'Sangat Bagus! 🌟';
        if (score >= 60) return 'Bagus! 💪';
        if (score >= 40) return 'Terus Berlatih! 🔥';
        return 'Jangan Menyerah! 💡';
    };

    return (
        <div
            ref={ref}
            className="quiz-share-card-capture relative overflow-hidden bg-slate-950 flex flex-col justify-between p-12 text-white"
            style={{
                width: '1080px',
                height: isSquare ? '1080px' : '1920px',
                fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
            }}
        >
            {/* Background */}
            <div className="absolute inset-0 bg-slate-950" />
            <div className={`absolute inset-0 bg-gradient-to-br ${getScoreGradient(data.score)} opacity-30`} />
            <div className="absolute -top-1/4 -right-1/4 w-[700px] h-[700px] bg-white/5 rounded-full blur-[100px]" />
            <div className="absolute -bottom-1/4 -left-1/4 w-[700px] h-[700px] bg-white/5 rounded-full blur-[100px]" />

            {/* Content */}
            <div className="relative z-10 flex flex-col h-full justify-between">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-white/50 text-2xl uppercase font-bold tracking-[0.3em] mb-2">Cognitive Arena</p>
                        <h2 className="text-5xl font-black uppercase tracking-tighter leading-tight">{data.user_name}</h2>
                    </div>
                    <div className="bg-white/15 px-6 py-3 rounded-2xl border border-white/25">
                        <span className="font-extrabold text-2xl tracking-tight">SarangTumbuh.site</span>
                    </div>
                </div>

                {/* Score Center */}
                <div className="flex flex-col items-center justify-center py-16">
                    <p className="text-white/50 text-3xl uppercase font-bold tracking-[0.3em] mb-6">Skor Kuis</p>
                    <div className={`relative`}>
                        <div className={`absolute inset-0 bg-gradient-to-br ${getScoreGradient(data.score)} blur-[80px] opacity-60 rounded-full scale-150`} />
                        <p className="text-[280px] font-[1000] tracking-tighter text-white leading-none mb-4 drop-shadow-2xl relative z-10">
                            {data.score}
                        </p>
                    </div>
                    <p className="text-6xl font-black uppercase tracking-[0.2em] text-white/70 drop-shadow-md -mt-4">%</p>
                    <div className={`mt-10 px-10 py-4 rounded-2xl bg-gradient-to-r ${getScoreGradient(data.score)} shadow-xl`}>
                        <p className="text-3xl font-black text-white">{getScoreLabel(data.score)}</p>
                    </div>
                </div>

                {/* Bottom Stats */}
                <div className="space-y-8">
                    <div className="grid grid-cols-3 gap-6">
                        <div className="bg-white/10 rounded-3xl p-7 border border-white/15 text-center">
                            <p className="text-white/50 text-xl uppercase font-bold tracking-widest mb-2">Topik</p>
                            <p className="text-3xl font-black leading-tight">{data.topic || 'Campuran'}</p>
                        </div>
                        <div className="bg-white/10 rounded-3xl p-7 border border-white/15 text-center">
                            <p className="text-white/50 text-xl uppercase font-bold tracking-widest mb-2">Level</p>
                            <p className="text-3xl font-black leading-tight">{data.difficulty || 'Auto'}</p>
                        </div>
                        <div className="bg-white/10 rounded-3xl p-7 border border-white/15 text-center">
                            <p className="text-white/50 text-xl uppercase font-bold tracking-widest mb-2">XP</p>
                            <p className="text-3xl font-black leading-tight">+{data.xp_earned}</p>
                        </div>
                    </div>

                    {/* Arena Rank */}
                    <div className="bg-white/10 rounded-3xl p-8 border border-white/15 flex items-center justify-between">
                        <div>
                            <p className="text-white/50 text-xl uppercase font-bold tracking-widest mb-1">Arena Rank</p>
                            <p className="text-4xl font-black">{data.arena_rank}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-white/50 text-xl uppercase font-bold tracking-widest mb-1">Total XP</p>
                            <p className="text-4xl font-black">{data.arena_xp}</p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="pt-4 text-center">
                        <p className="text-2xl font-bold text-white/40 tracking-wide">🧠 Asah otakmu setiap hari di <span className="text-white/70 font-black">sarangtumbuh.site</span></p>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default QuizShareCard;
