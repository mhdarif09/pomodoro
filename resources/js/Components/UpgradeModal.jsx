// resources/js/Components/UpgradeModal.jsx
import { router, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { SparklesIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { useState, useEffect } from 'react';

export default function UpgradeModal({ show, onClose, plans = [], snap_token }) {
    const [isLoading, setIsLoading] = useState(false);

    if (!show) return null;

    const handleClose = () => {
        router.post('/dashboard/dismiss-upgrade-modal', {}, {
            onSuccess: () => onClose(),
            onError: () => onClose(), // Close modal even if request fails
            preserveScroll: true, // Prevent page scroll reset
        });
    };

    const handleCheckout = (planName) => {
        setIsLoading(true);
        router.post('/subscribe/checkout', { plan: planName }, {
            onSuccess: () => {
                if (snap_token) {
                    window.snap.pay(snap_token, {
                        onSuccess: () => {
                            router.get('/subscription/payment-success');
                            setIsLoading(false);
                        },
                        onPending: () => {
                            router.get('/subscription/payment-success');
                            setIsLoading(false);
                        },
                        onError: () => {
                            alert('Pembayaran gagal, silakan coba lagi.');
                            setIsLoading(false);
                        },
                        onClose: () => {
                            handleClose();
                            setIsLoading(false);
                        },
                    });
                } else {
                    alert('Gagal memuat pembayaran, silakan coba lagi.');
                    setIsLoading(false);
                }
            },
            onError: (errors) => {
                console.error('Checkout error:', errors);
                alert('Gagal memulai pembayaran: ' + (errors.plan || 'Terjadi kesalahan.'));
                setIsLoading(false);
            },
            preserveScroll: true, // Prevent page scroll reset
        });
    };

    // Automatically trigger Midtrans Snap if snap_token is present
    useEffect(() => {
        if (snap_token && show && !isLoading) {
            setIsLoading(true);
            window.snap.pay(snap_token, {
                onSuccess: () => {
                    router.get('/subscription/payment-success');
                    setIsLoading(false);
                },
                onPending: () => {
                    router.get('/subscription/payment-success');
                    setIsLoading(false);
                },
                onError: () => {
                    alert('Pembayaran gagal, silakan coba lagi.');
                    setIsLoading(false);
                },
                onClose: () => {
                    handleClose();
                    setIsLoading(false);
                },
            });
        }
    }, [snap_token, show]);

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative bg-white dark:bg-slate-800 shadow-xl rounded-2xl p-8 w-full max-w-md text-center"
            >
                <button onClick={handleClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                    <XMarkIcon className="h-6 w-6" />
                </button>
                <div className="w-16 h-16 mx-auto bg-gradient-to-tr from-yellow-400 to-amber-500 rounded-full flex items-center justify-center">
                    <SparklesIcon className="w-10 h-10 text-white" />
                </div>
                <h2 className="mt-6 text-2xl font-bold text-slate-900 dark:text-white">Buka Refleksi Mendalam</h2>
                <p className="mt-2 text-slate-600 dark:text-slate-300">
                    Pilih paket Premium untuk mendapatkan insight AI yang dipersonalisasi, melacak emosi, dan rekomendasi pertumbuhan.
                </p>
                <div className="mt-6 space-y-4">
                    {plans.length > 0 ? (
                        plans.map((plan) => (
                            <div key={plan.name} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 text-left">
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{plan.name}</h3>
                                <p className="text-slate-600 dark:text-slate-300">
                                    Rp {plan.price.toLocaleString('id-ID')} / {plan.duration}
                                </p>
                                <button
                                    onClick={() => handleCheckout(plan.name)}
                                    disabled={isLoading}
                                    className={`mt-4 w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded-lg transition transform hover:scale-105 shadow-lg shadow-amber-500/30 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {isLoading ? 'Memproses...' : `Pilih ${plan.name}`}
                                </button>
                            </div>
                        ))
                    ) : (
                        <p className="text-slate-600 dark:text-slate-300">Tidak ada paket tersedia saat ini.</p>
                    )}
                </div>
            </motion.div>
        </div>
    );
}