import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';

export default function SkillRadarChart({ skills }) {
    if (!skills || skills.length === 0) {
        return (
            <div className="flex h-64 items-center justify-center text-slate-400 bg-white/40 rounded-2xl border border-white/40 backdrop-blur-md">
                <p>Belum ada skill yang terunlock.</p>
            </div>
        );
    }

    // Transform data for Recharts
    // Recharts radar needs key-value pairs
    // We want to show 'Level' or 'Total XP' normalized.
    // Let's show Level for simplicity, maybe capped at 10 for visualization if needed, or just raw levels.
    const data = skills.map(skill => ({
        subject: skill.name,
        A: skill.pivot.level,
        fullMark: Math.max(10, ...skills.map(s => s.pivot.level * 1.2)), // Dynamic max
    }));

    return (
        <div className="w-full h-80 bg-white/60 rounded-2xl border border-white/40 backdrop-blur-xl p-4 shadow-lg">
            <h3 className="text-lg font-bold text-slate-800 mb-4 text-center">Skill Stats</h3>
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                    <PolarGrid stroke="#cbd5e1" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 12, fontWeight: 600 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
                    <Radar
                        name="Skill Level"
                        dataKey="A"
                        stroke="#8b5cf6"
                        strokeWidth={3}
                        fill="#a78bfa"
                        fillOpacity={0.6}
                    />
                    <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(value) => [`Level ${value}`, 'Level']}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
}
