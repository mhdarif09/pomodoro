import React from 'react';


export default function StatCard({ title, value, icon: Icon, color }) {
    return (
        <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl shadow-lg shadow-slate-200/50 dark:shadow-black/20 rounded-[2rem] p-6 border border-white/20 dark:border-white/5 transition-transform hover:scale-[1.02]">
            <div className="flex items-center">
                <div className={`flex-shrink-0 flex items-center justify-center h-14 w-14 rounded-2xl text-white shadow-lg ${color}`}>
                    <Icon className="h-7 w-7" />
                </div>
                <div className="ml-5 w-0 flex-1">
                    <dl>
                        <dt className="text-sm font-bold text-slate-500 dark:text-slate-400 truncate uppercase tracking-wide">
                            {title}
                        </dt>
                        <dd className="text-3xl font-[900] text-slate-900 dark:text-white mt-1">
                            {value}
                        </dd>
                    </dl>
                </div>
            </div>
        </div>
    );
}