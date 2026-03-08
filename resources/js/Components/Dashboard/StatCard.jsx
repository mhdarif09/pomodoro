// resources/js/Components/Dashboard/StatCard.jsx
import { motion } from 'framer-motion';

export default function StatCard({ title, value, icon: Icon, onClick, isActive, colorClass = 'bg-slate-500' }) {
    
    const activeRingClass = colorClass.replace('bg-', 'ring-');

    return (
        <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className={`relative p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm cursor-pointer transition-all duration-300
                ${isActive ? `ring-2 ${activeRingClass}` : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'}`
            }
        >
            <div className="flex justify-between items-start">
                <div className="flex flex-col">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
                    <p className="text-4xl font-bold text-slate-900 dark:text-white mt-1">{value}</p>
                </div>
                <div className={`p-3 rounded-lg ${colorClass} text-white`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
            {isActive && 
                <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 ${colorClass} rotate-45`}></div>
            }
        </motion.div>
    );
}