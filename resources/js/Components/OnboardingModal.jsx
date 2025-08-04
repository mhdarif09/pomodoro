import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AcademicCapIcon, BookOpenIcon, ClockIcon, PencilSquareIcon, SparklesIcon,
    ArrowRightIcon, ArrowLeftIcon, LightBulbIcon, PresentationChartLineIcon,
    ChatBubbleBottomCenterTextIcon, UserGroupIcon, BeakerIcon, HeartIcon
} from '@heroicons/react/24/outline';
import { PencilIcon } from '@heroicons/react/24/solid';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';

const stepsConfig = [
    {
        id: 1, icon: <UserGroupIcon className="h-10 w-10 mx-auto text-teal-500" />, title: "Tujuan Bertumbuh", question: "Apa yang ingin kamu tumbuhkan dalam dirimu sekarang?", type: 'checkbox', key: 'growth_goals',
        options: [{ text: "Fokus dan konsentrasi", icon: <BeakerIcon className="w-6 h-6" /> }, { text: "Disiplin diri", icon: <ClockIcon className="w-6 h-6" /> }, { text: "Mengurangi overthinking", icon: <LightBulbIcon className="w-6 h-6" /> }, { text: "Ketenangan emosi", icon: <HeartIcon className="w-6 h-6" /> }, { text: "Percaya diri dan komunikasi", icon: <ChatBubbleBottomCenterTextIcon className="w-6 h-6" /> }, { text: "Konsistensi belajar", icon: <AcademicCapIcon className="w-6 h-6" /> }, { text: "Mindset bertumbuh", icon: <SparklesIcon className="w-6 h-6" /> }, { text: "Produktivitas yang sehat", icon: <PresentationChartLineIcon className="w-6 h-6" /> }]
    },
    {
        id: 2, icon: <BookOpenIcon className="h-10 w-10 mx-auto text-teal-500" />, title: "Gaya Belajar Favorit", question: "Gaya belajar seperti apa yang paling cocok untukmu?", type: 'radio', key: 'learning_style',
        options: [{ text: "Baca teks singkat & artikel", value: "📖 Baca teks singkat & artikel", icon: <BookOpenIcon className="w-6 h-6" /> }, { text: "Mendengarkan audio (podcast, voice)", value: "🎧 Mendengarkan audio (podcast, voice)", icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" /></svg> }, { text: "Tanya jawab (interaktif)", value: "💬 Tanya jawab (interaktif)", icon: <ChatBubbleBottomCenterTextIcon className="w-6 h-6" /> }, { text: "Visual (grafik & ilustrasi)", value: "🎨 Visual (grafik & ilustrasi)", icon: <PresentationChartLineIcon className="w-6 h-6" /> }]
    },
    {
        id: 3, icon: <ClockIcon className="h-10 w-10 mx-auto text-teal-500" />, title: "Waktu Terbaik untuk Fokus", question: "Kapan waktu yang paling cocok buat kamu fokus?", type: 'radio', key: 'focus_time',
        options: [{ text: "Pagi (07.00 – 10.00)", icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></svg> }, { text: "Siang (10.00 – 14.00)", icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c1.355 0 2.707-.158 4.007-.462M12 21c-1.355 0-2.707-.158-4.007-.462m16.42-3.84a.75.75 0 00-.542-.93l-4.148-.711a.75.75 0 00-.712.067l-1.743 1.05a.75.75 0 00.17 1.282l4.022 1.429a.75.75 0 00.93-.542zM3.12 16.708a.75.75 0 00-.542.93l4.148.711a.75.75 0 00.712-.067l1.743-1.05a.75.75 0 00-.17-1.282L4.05 15.778a.75.75 0 00-.93.93zM12 3a.75.75 0 00-1.06-.027l-4.148 3.319a.75.75 0 00.53 1.348h8.236a.75.75 0 00.53-1.348L13.06 2.973A.75.75 0 0012 3z" /></svg> }, { text: "Sore (14.00 – 18.00)", icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a4.5 4.5 0 004.5-4.5V8.25a4.5 4.5 0 00-4.5-4.5H6.75a4.5 4.5 0 00-4.5 4.5v6.75z" /></svg> }, { text: "Malam (18.00 – 22.00)", icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" /></svg> }]
    },
    { id: 4, icon: <PencilSquareIcon className="h-10 w-10 mx-auto text-teal-500" />, title: "Motivasi Pribadi", question: "Kenapa kamu ingin bertumbuh sekarang?", type: 'textarea', key: 'personal_motivation' },
    { id: 5, icon: <SparklesIcon className="h-10 w-10 mx-auto text-teal-500" />, title: "Siap Bertumbuh 🌱", question: "Ini ringkasan perjalananmu. Tinggal satu langkah lagi!", type: 'summary', key: 'summary' },
    { id: 6, icon: <PencilIcon className="h-10 w-10 mx-auto text-teal-500" />, title: "Goal Harian Pertama Anda", question: "Apa satu hal terpenting yang ingin kamu capai hari ini?", type: 'textarea', key: 'daily_goal' }
];

export default function OnboardingModal({ onFinish, isProcessing }) {
    const [step, setStep] = useState(0);
    const [direction, setDirection] = useState(0);
    const [data, setData] = useState({ growth_goals: [], learning_style: '', focus_time: '', personal_motivation: '', daily_goal: '' });
    const currentStepConfig = stepsConfig[step];
    const paginate = (newDirection) => { setDirection(newDirection); setStep(prev => prev + newDirection); };
    const handleCheckboxChange = (value) => setData(prev => ({ ...prev, growth_goals: prev.growth_goals.includes(value) ? prev.growth_goals.filter(goal => goal !== value) : [...prev.growth_goals, value] }));
    const handleRadioChange = (key, value) => setData(prev => ({ ...prev, [key]: value }));
    const handleTextChange = (e, key) => setData(prev => ({ ...prev, [key]: e.target.value }));
    const isNextDisabled = () => {
        const { key, type } = currentStepConfig;
        if (type === 'checkbox' && data.growth_goals.length === 0) return true;
        if (type === 'radio' && !data[key]) return true;
        if (type === 'textarea' && key === 'personal_motivation' && data.personal_motivation.trim() === '') return true;
        if (type === 'textarea' && key === 'daily_goal' && data.daily_goal.trim() === '') return true;
        return false;
    };
    const slideVariants = { enter: (direction) => ({ x: direction > 0 ? '100%' : '-100%', opacity: 0 }), center: { zIndex: 1, x: 0, opacity: 1 }, exit: (direction) => ({ zIndex: 0, x: direction < 0 ? '100%' : '-100%', opacity: 0 })};

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ ease: "easeInOut", duration: 0.3 }} className="bg-white dark:bg-slate-800 shadow-2xl rounded-2xl p-6 sm:p-8 w-full max-w-2xl mx-auto flex flex-col h-[90vh] max-h-[600px] min-h-[500px]">
                <div className="flex-shrink-0 flex items-center gap-4 mb-6">
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5"><motion.div className="bg-teal-500 h-2.5 rounded-full" animate={{ width: `${((step + 1) / stepsConfig.length) * 100}%` }} transition={{ duration: 0.5, ease: "easeInOut" }} /></div>
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">Langkah {step + 1} dari {stepsConfig.length}</span>
                </div>
                <div className="flex-grow relative overflow-hidden">
                    <AnimatePresence initial={false} custom={direction}>
                        <motion.div key={step} custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ type: "tween", ease: "easeInOut", duration: 0.4 }} className="w-full h-full absolute flex flex-col">
                            <div className="flex-shrink-0 text-center">{currentStepConfig.icon}<h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-4">{currentStepConfig.title}</h2><p className="text-slate-600 dark:text-slate-300 mt-2 max-w-md mx-auto">{currentStepConfig.question}</p></div>
                            <div className="mt-8 flex-grow overflow-y-auto pr-2 pb-4">
                                {currentStepConfig.type === 'checkbox' && <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{currentStepConfig.options.map(opt => { const isChecked = data.growth_goals.includes(opt.text); return (<label key={opt.text} className={`relative flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${isChecked ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/30 ring-1 ring-teal-500' : 'border-slate-300 dark:border-slate-600 hover:border-slate-400'}`}><input type="checkbox" checked={isChecked} onChange={() => handleCheckboxChange(opt.text)} className="sr-only"/><div className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full mr-3 ${isChecked ? 'bg-teal-100 text-teal-600' : 'bg-slate-100 text-slate-500'}`}>{opt.icon}</div><span className="text-sm font-medium text-slate-800 dark:text-slate-200">{opt.text}</span>{isChecked && <CheckCircleSolid className="h-5 w-5 text-teal-500 ml-auto flex-shrink-0 absolute top-2 right-2"/>}</label>);})}</div>}
                                {currentStepConfig.type === 'radio' && <div className="space-y-3">{currentStepConfig.options.map(opt => { const isChecked = data[currentStepConfig.key] === (opt.value || opt.text); const valueToSet = opt.value || opt.text; return (<label key={opt.text} className={`relative flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 shadow-sm ${isChecked ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/30 ring-2 ring-teal-500' : 'bg-white dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500'}`}><input type="radio" name={currentStepConfig.key} value={valueToSet} checked={isChecked} onChange={() => handleRadioChange(currentStepConfig.key, valueToSet)} className="sr-only"/><div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg mr-4 bg-teal-100/50 dark:bg-teal-900/50 text-teal-600 dark:text-teal-400">{opt.icon}</div><span className="font-medium text-slate-800 dark:text-slate-200">{opt.text}</span>{isChecked && <CheckCircleSolid className="h-6 w-6 text-teal-500 ml-auto flex-shrink-0" />}</label>);})}</div>}
                                {currentStepConfig.type === 'textarea' && <textarea rows="4" placeholder={currentStepConfig.key === 'personal_motivation' ? "Cth: Aku ingin jadi lebih konsisten..." : "Cth: Menyelesaikan bab 1 skripsi"} value={data[currentStepConfig.key]} onChange={(e) => handleTextChange(e, currentStepConfig.key)} className="w-full p-3 rounded-lg bg-slate-100 dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors duration-200" />}
                                {currentStepConfig.type === 'summary' && (<div className="space-y-4 text-left p-6 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600"><div><h4 className="font-semibold text-slate-800 dark:text-slate-100 mb-2">Tujuan Bertumbuh</h4><div className="flex flex-wrap gap-2">{data.growth_goals.map(g => <span key={g} className="text-sm bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200 py-1 px-3 rounded-full">{g}</span>)}</div></div><div><h4 className="font-semibold text-slate-800 dark:text-slate-100">Gaya Belajar</h4><p className="text-slate-600 dark:text-slate-300">{data.learning_style}</p></div><div><h4 className="font-semibold text-slate-800 dark:text-slate-100">Waktu Fokus Terbaik</h4><p className="text-slate-600 dark:text-slate-300">{data.focus_time}</p></div><div className="pt-4 border-t border-slate-200 dark:border-slate-600"><h4 className="font-semibold text-slate-800 dark:text-slate-100">Motivasi Pribadi</h4><p className="text-slate-600 dark:text-slate-300 italic">"{data.personal_motivation}"</p></div></div>)}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
                <div className="flex-shrink-0 mt-auto pt-6 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <button onClick={() => paginate(-1)} className={`font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all flex items-center gap-1 ${step === 0 ? 'opacity-0 cursor-default' : 'opacity-100'}`} disabled={step === 0}><ArrowLeftIcon className="h-4 w-4"/> Kembali</button>
                    {step < stepsConfig.length - 1 ? (<button onClick={() => paginate(1)} disabled={isNextDisabled()} className="bg-teal-500 hover:bg-teal-600 disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-semibold py-2 px-6 rounded-lg shadow-lg shadow-teal-500/20 transform hover:scale-105 transition flex items-center gap-1.5">Lanjut <ArrowRightIcon className="h-4 w-4"/></button>) : (<button onClick={() => onFinish(data)} disabled={isProcessing || data.daily_goal.trim() === ''} className="bg-green-500 hover:bg-green-600 disabled:bg-slate-400 text-white font-semibold py-2 px-6 rounded-lg shadow-lg shadow-green-500/20 transform hover:scale-105 transition flex items-center gap-2">{isProcessing ? 'Menyimpan...' : 'Selesai & Mulai Produktif'}<CheckCircleSolid className="h-5 w-5" /></button>)}
                </div>
            </motion.div>
        </div>
    );
}