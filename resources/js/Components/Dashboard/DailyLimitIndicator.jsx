export default function DailyLimitIndicator({ current, limit, className = '' }) {
    const percentage = limit > 0 ? Math.min(100, (current / limit) * 100) : 0;

    return (
        <div className={`flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full ${className}`}>
            <div className="w-16 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                    className="h-full bg-orange-500 transition-all duration-300 ease-out"
                    style={{ width: `${percentage}%` }}
                />
            </div>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                {current}/{limit} Focus
            </span>
        </div>
    );
}
