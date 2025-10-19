// File: resources/js/Components/UpgradeModal.jsx (atau path file Anda yang benar)
import { router, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { SparklesIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { useState, useEffect } from 'react';

export default function UpgradeModal({ isOpen, onClose, plans, snap_token }) {
    const [isLoading, setIsLoading] = useState(false);
    const { midtrans_client_key, midtrans_is_production } = usePage().props;

    // Efek untuk memuat script Midtrans secara dinamis
    useEffect(() => {
        if (!isOpen) return;

        if (!midtrans_client_key || midtrans_client_key === 'undefined') {
            console.error('Midtrans Client Key tidak ditemukan. Pastikan sudah dikirim dari controller.');
            return;
        }

        const scriptId = 'midtrans-snap-script';
        if (document.getElementById(scriptId)) {
            return;
        }

        const snapSrc = midtrans_is_production
            ? 'https://app.midtrans.com/snap/snap.js'
            : 'https://app.sandbox.midtrans.com/snap/snap.js';
        
        const script = document.createElement('script');
        script.id = scriptId;
        script.src = snapSrc;
        script.setAttribute('data-client-key', midtrans_client_key);
        script.async = true;

        document.body.appendChild(script);

        return () => {
            const existingScript = document.getElementById(scriptId);
            if (existingScript) {
                document.body.removeChild(existingScript);
            }
        };
    }, [isOpen, midtrans_client_key, midtrans_is_production]);

    // Efek untuk menangani snap_token yang datang dari URL (redirect)
    useEffect(() => {
        if (snap_token && window.snap) {
            window.snap.pay(snap_token);
        }
    }, [snap_token]);


    const handleUpgrade = (plan) => {
        setIsLoading(true);

        router.post(route('subscribe.checkout'), {
            plan_id: plan.id,
        }, {
            onSuccess: (page) => {
                const newSnapToken = page.props.flash?.snap_token;
                if (newSnapToken && window.snap) {
                    window.snap.pay(newSnapToken, {
                        onSuccess: (result) => {
                            router.get(route('subscription.payment.success'), { order_id: result.order_id });
                        },
                        onPending: (result) => {
                            router.get(route('subscription.payment.success'), { order_id: result.order_id });
                        },
                        onError: (result) => {
                            console.error('Payment Error:', result);
                            setIsLoading(false);
                            alert('Pembayaran gagal. Silakan coba lagi.');
                        },
                        onClose: () => {
                            console.log('Pop-up pembayaran ditutup oleh pengguna.');
                            setIsLoading(false);
                        },
                    });
                } else if (!window.snap) {
                    alert('Layanan pembayaran gagal dimuat. Coba refresh halaman.');
                    setIsLoading(false);
                } else {
                    alert('Gagal mendapatkan token pembayaran. Silakan coba lagi.');
                    setIsLoading(false);
                }
            },
            onError: (errors) => {
                console.error('Checkout Error:', errors);
                alert(errors.message || 'Terjadi kesalahan saat mempersiapkan pembayaran.');
                setIsLoading(false);
            },
        });
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md p-8 text-center relative"
                    >
                        <button 
                            onClick={onClose}
                            disabled={isLoading}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 disabled:opacity-50 transition-colors"
                            title="Tutup"
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>

                        <div className="w-16 h-16 mx-auto bg-gradient-to-tr from-yellow-400 to-amber-500 rounded-full flex items-center justify-center">
                            <SparklesIcon className="w-10 h-10 text-white" />
                        </div>
                        
                        <h2 className="mt-6 text-2xl font-bold text-slate-900 dark:text-white">
                            ✨ Upgrade ke Premium
                        </h2>
                        <p className="mt-2 text-slate-600 dark:text-slate-300">
                            Buka semua fitur canggih untuk produktivitas maksimal.
                        </p>
                        
                        {!isLoading && (
                            <div className="mt-6 space-y-4">
                                {plans && plans.length > 0 ? (
                                    plans.map((plan) => (
                                        <div key={plan.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg text-left hover:border-amber-300 transition-colors">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <h3 className="font-semibold text-slate-900 dark:text-white">{plan.name}</h3>
                                                    <p className="text-slate-600 dark:text-slate-300 text-sm mt-1">
                                                        Rp {Number(plan.price).toLocaleString('id-ID')} / {plan.duration === 'monthly' ? 'bulan' : 'tahun'}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleUpgrade(plan)}
                                                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 hover:scale-105 shadow-lg shadow-amber-500/30"
                                            >
                                                Pilih {plan.name}
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-slate-500 py-4">Paket premium tidak tersedia saat ini.</p>
                                )}
                                
                                <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                                    <button
                                        onClick={onClose}
                                        className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 text-sm font-medium transition-colors"
                                    >
                                        Lanjutkan dengan fitur gratis →
                                    </button>
                                </div>
                            </div>
                        )}

                        {isLoading && (
                            <div className="mt-6 space-y-4">
                                <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-6 text-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
                                    <p className="text-slate-600 dark:text-slate-300 font-medium text-lg">
                                        Mempersiapkan pembayaran...
                                    </p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                                        Popup pembayaran akan segera terbuka...
                                    </p>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}