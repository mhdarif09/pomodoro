// File: resources/js/Pages/Subscribe/Index.jsx
import { Head, usePage } from '@inertiajs/react';
import axios from 'axios';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckIcon,
    SparklesIcon,
    RocketLaunchIcon,
    ShieldCheckIcon,
    ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import clsx from 'clsx';

export default function SubscribeIndex() {
    const { message, plans, auth, midtrans } = usePage().props;
    const [isLoading, setIsLoading] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);

    useEffect(() => {
        if (!window.snap) {
            const isProduction = midtrans?.is_production ?? true;
            const snapUrl = isProduction ? 'https://app.midtrans.com/snap/snap.js' : 'https://app.sandbox.midtrans.com/snap/snap.js';
            const clientKey = midtrans?.client_key || import.meta.env.VITE_MIDTRANS_CLIENT_KEY;
            const script = document.createElement('script');
            script.src = snapUrl;
            script.setAttribute('data-client-key', clientKey);
            document.body.appendChild(script);
        }
    }, []);

    const handleSubscribe = async (planName) => {
        setIsLoading(true);
        setSelectedPlan(planName);
        try {
            const response = await axios.post(route('subscribe.checkout'), { plan: planName });
            if (response.data.success && response.data.snap_token) {
                window.snap.pay(response.data.snap_token, {
                    onSuccess: () => window.location.href = route('subscription.payment.success'),
                    onPending: () => { setIsLoading(false); setSelectedPlan(null); },
                    onError: () => { setIsLoading(false); setSelectedPlan(null); alert("Pembayaran gagal!"); },
                    onClose: () => { setIsLoading(false); setSelectedPlan(null); }
                });
            } else {
                alert(response.data.message || "Gagal membuat transaksi.");
                setIsLoading(false);
                setSelectedPlan(null);
            }
        } catch (error) {
            console.error('Checkout error:', error);
            alert(error.response?.data?.message || "Terjadi kesalahan sistem.");
            setIsLoading(false);
            setSelectedPlan(null);
        }
    };

    return (
        <div className="min-h-screen bg-[#F5F5F7] dark:bg-[#000000] selection:bg-blue-500/30 font-sans antialiased overflow-x-hidden">
            <Head title="Premium - Sarang Tumbuh" />

            {/* Background Decorative Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/20 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-400/20 blur-[120px] rounded-full" />
            </div>

            <main className="relative z-10 max-w-7xl mx-auto px-6 py-12 md:py-24">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="text-center mb-16 md:mb-24"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 dark:bg-white/10 backdrop-blur-md border border-white/50 dark:border-white/5 shadow-sm mb-6">
                        <SparklesIcon className="h-4 w-4 text-amber-500" />
                        <span className="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">Upgrade ke Premium</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white mb-6 tracking-tight leading-tight">
                        Fokus Lebih Tajam,<br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">Hasil Lebih Maksimal.</span>
                    </h1>
                    <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-500 dark:text-slate-400 font-medium">
                        {message || "Bebaskan potensi penuhmu dengan fitur eksklusif yang dirancang untuk meningkatkan produktivitas setiap hari."}
                    </p>
                </motion.div>

                {/* Pricing Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
                    {(plans || []).map((plan, index) => (
                        <motion.div
                            key={plan.id}
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                            className={clsx(
                                "group relative flex flex-col p-1 rounded-[2.5rem] transition-all",
                                plan.name.toLowerCase().includes('pro')
                                    ? "bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 shadow-2xl shadow-purple-500/20"
                                    : "bg-white/40 dark:bg-white/5 backdrop-blur-2xl border border-white/50 dark:border-white/10"
                            )}
                        >
                            <div className="flex-grow bg-white/90 dark:bg-black/80 backdrop-blur-2xl rounded-[2.3rem] p-8 md:p-10 flex flex-col items-center text-center">
                                {plan.name.toLowerCase().includes('pro') && (
                                    <div className="absolute top-6 right-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                                        Paling Populer
                                    </div>
                                )}

                                <div className={clsx(
                                    "p-4 rounded-3xl mb-6 shadow-inner",
                                    plan.name.toLowerCase().includes('pro') ? "bg-purple-50 dark:bg-purple-950/30 text-purple-600" : "bg-slate-50 dark:bg-slate-900 text-slate-600"
                                )}>
                                    {plan.name.toLowerCase().includes('annual') ? <RocketLaunchIcon className="h-8 w-8" /> : <ShieldCheckIcon className="h-8 w-8" />}
                                </div>

                                <h3 className="text-2xl font-black text-slate-800 dark:text-neutral-200 mb-2">{plan.name}</h3>

                                <div className="flex items-baseline gap-1 mb-6">
                                    <span className="text-sm font-black text-slate-400">RP</span>
                                    <span className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
                                        {Number(plan.price).toLocaleString('id-ID')}
                                    </span>
                                    <span className="text-sm font-bold text-slate-400">/{plan.duration === 'monthly' ? 'bln' : 'thn'}</span>
                                </div>

                                <div className="w-full space-y-4 mb-10 flex-grow">
                                    {(plan.features || []).map((feature, idx) => (
                                        <div key={idx} className="flex items-center gap-3 text-sm font-medium text-slate-600 dark:text-slate-400">
                                            <div className="flex-shrink-0 h-5 w-5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center">
                                                <CheckIcon className="h-3 w-3 text-emerald-500" />
                                            </div>
                                            <span className="text-left">{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={() => handleSubscribe(plan.name)}
                                    disabled={isLoading}
                                    className={clsx(
                                        "w-full py-5 rounded-[1.5rem] font-black text-lg transition-all active:scale-95 disabled:opacity-50 relative overflow-hidden group",
                                        plan.name.toLowerCase().includes('pro')
                                            ? "bg-slate-900 dark:bg-white text-white dark:text-black shadow-xl hover:shadow-2xl"
                                            : "bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-white/20"
                                    )}
                                >
                                    <span className="relative z-10">
                                        {isLoading && selectedPlan === plan.name ? 'Memproses...' : 'Dapatkan Sekarang'}
                                    </span>
                                    {plan.name.toLowerCase().includes('pro') && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Footer Link */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-16 text-center"
                >
                    <button
                        onClick={() => window.history.back()}
                        className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold transition-all"
                    >
                        <ArrowLeftIcon className="h-4 w-4" />
                        Kembali ke Dashboard
                    </button>
                </motion.div>
            </main>
        </div>
    );
}