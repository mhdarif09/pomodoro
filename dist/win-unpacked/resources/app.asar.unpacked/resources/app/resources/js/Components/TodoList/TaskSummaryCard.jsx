import { motion } from 'framer-motion';

export default function TaskSummaryCard({ label, value, icon: Icon, onClick, isActive, colorClass }) {
    const activeClasses = isActive 
        ? 'ring-2 ring-offset-2 dark:ring-offset-slate-900 ' + colorClass.replace('bg-', 'ring-')
        : 'hover:bg-slate-50 dark:hover:bg-slate-800/60';
    
    return (
        <motion.div
            whileHover={{ scale: isActive ? 1 : 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm cursor-pointer transition-all duration-200 ${activeClasses}`}
            onClick={onClick}
        >
            <div className="flex items-center gap-4">
                <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-white ${colorClass}`}>
                    <Icon className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
                </div>
            </div>
        </motion.div>
    );
}