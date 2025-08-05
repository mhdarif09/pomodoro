// File: resources/js/Pages/Pomodoro/components/UpgradeModal.jsx
import { router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function UpgradeModal({ isOpen, onClose, plans, snap_token }) {
    const [isLoading, setIsLoading] = useState(false);

    const handleClose = () => {
        router.post('/dashboard/dismiss-upgrade-modal', {}, {
            onSuccess: () => onClose(),
            onError: () => onClose(), // Close modal even if request fails
            preserveScroll: true,
        });
    };

    const handleUpgrade = (plan) => {
        setIsLoading(true);
        router.post('/subscribe/checkout', { plan: plan.name }, {
            onSuccess: (page) => {
                const snapToken = page.props.snap_token;
                if (snapToken && window.snap) {
                    window.snap.pay(snapToken, {
                        onSuccess: (result) => {
                            alert('Pembayaran berhasil!');
                            console.log(result);
                            router.get('/subscription/payment-success');
                            setIsLoading(false);
                        },
                        onPending: (result) => {
                            alert('Menunggu pembayaran Anda!');
                            console.log(result);
                            router.get('/subscription/payment-success');
                            setIsLoading(false);
                        },
                        onError: (result) => {
                            alert('Pembayaran gagal, silakan coba lagi.');
                            console.log(result);
                            setIsLoading(false);
                        },
                        onClose: () => {
                            alert('Anda menutup popup tanpa menyelesaikan pembayaran.');
                            handleClose();
                            setIsLoading(false);
                        },
                    });
                } else {
                    alert('Gagal memuat gateway pembayaran. Silakan coba lagi.');
                    setIsLoading(false);
                }
            },
            onError: (errors) => {
                alert('Gagal memulai pembayaran: ' + (errors.plan || 'Terjadi kesalahan.'));
                console.error('Checkout error:', errors);
                setIsLoading(false);
            },
            preserveScroll: true,
        });
    };

    // Automatically trigger Midtrans Snap if snap_token is present (e.g., from existing unpaid subscription)
    useEffect(() => {
        if (snap_token && isOpen && !isLoading && window.snap) {
            setIsLoading(true);
            window.snap.pay(snap_token, {
                onSuccess: (result) => {
                    alert('Pembayaran berhasil!');
                    console.log(result);
                    router.get('/subscription/payment-success');
                    setIsLoading(false);
                },
                onPending: (result) => {
                    alert('Menunggu pembayaran Anda!');
                    console.log(result);
                    router.get('/subscription/payment-success');
                    setIsLoading(false);
                },
                onError: (result) => {
                    alert('Pembayaran gagal, silakan coba lagi.');
                    console.log(result);
                    setIsLoading(false);
                },
                onClose: () => {
                    alert('Anda menutup popup tanpa menyelesaikan pembayaran.');
                    handleClose();
                    setIsLoading(false);
                },
            });
        }
    }, [snap_token, isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={handleClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md p-6 text-center"
                    >
                        <h2 className="text-2xl font-bold mb-2">✨ Upgrade ke Premium</h2>
                        <p className="text-slate-600 dark:text-slate-300 mb-6">Buka semua fitur canggih untuk produktivitas maksimal.</p>
                        <div className="space-y-4">
                            {plans && plans.length > 0 ? (
                                plans.map((plan) => (
                                    <div key={plan.id} className="p-4 border dark:border-slate-700 rounded-lg flex justify-between items-center text-left">
                                        <div>
                                            <h3 className="font-semibold">{plan.name}</h3>
                                            <p className="text-sm text-slate-500">
                                                Rp {Number(plan.price).toLocaleString('id-ID')} / {plan.duration}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleUpgrade(plan)}
                                            disabled={isLoading}
                                            className={`bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 px-4 rounded-lg transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            {isLoading ? 'Memproses...' : 'Pilih Paket'}
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <p className="text-slate-500">Paket premium tidak tersedia saat ini.</p>
                            )}
                        </div>
                        <button onClick={handleClose} className="mt-6 text-sm text-slate-500 hover:underline">
                            Lain kali
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}