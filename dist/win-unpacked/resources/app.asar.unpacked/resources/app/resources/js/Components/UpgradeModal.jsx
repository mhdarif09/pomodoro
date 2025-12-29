import { router, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { SparklesIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

export default function UpgradeModal({ show, onClose, plans = [] }) {
    const [isLoading, setIsLoading] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState('');
    const { snap_token } = usePage().props;
    const paymentTimeoutRef = useRef(null);
    const snapLoadedRef = useRef(false);

    useEffect(() => {
        if (!show) return;

        const loadSnapScript = () => {
            if (window.snap || snapLoadedRef.current) {
                return;
            }
            if (document.querySelector('script[src*="snap.js"]')) {
                return;
            }
            const script = document.createElement('script');
            const isProduction = !['localhost', '127.0.0.1'].includes(window.location.hostname);
            script.src = isProduction 
                ? 'https://app.midtrans.com/snap/snap.js'
                : 'https://app.sandbox.midtrans.com/snap/snap.js';
            
            const clientKey = document.querySelector('meta[name="midtrans-client-key"]')?.getAttribute('content');
            if (clientKey) {
                script.setAttribute('data-client-key', clientKey);
            }
            script.onload = () => {
                snapLoadedRef.current = true;
            };
            script.onerror = () => {
                console.error('Gagal memuat Snap.js');
            };
            document.body.appendChild(script);
        };

        loadSnapScript();
    }, [show]);

    if (!show) return null;

    const checkSnapLoaded = (callback, maxAttempts = 20) => {
        let attempts = 0;
        const check = () => {
            attempts++;
            if (typeof window.snap !== 'undefined') {
                callback(true);
            } else if (attempts >= maxAttempts) {
                callback(false);
            } else {
                setTimeout(check, 500);
            }
        };
        check();
    };

    const handleClose = () => {
        if (paymentTimeoutRef.current) {
            clearTimeout(paymentTimeoutRef.current);
        }
        onClose();
    };

    const handleCheckout = async (planName) => {
        setIsLoading(true);
        setPaymentStatus('preparing');
        
        try {
            const response = await axios.post(route('subscribe.checkout'), {
                plan: planName,
            });

            const data = response.data;
            
            if (data.success && data.snap_token) {
                setPaymentStatus('loading_snap');
                checkSnapLoaded((isLoaded) => {
                    if (isLoaded) {
                        openSnapPayment(data.snap_token);
                    } else {
                        handleSnapNotLoaded();
                    }
                });
            } else {
                throw new Error(data.message || 'Gagal membuat transaksi');
            }
            
        } catch (error) {
            let errorMessage = 'Gagal memulai pembayaran.';
            if (error.response) {
                console.error('Checkout error:', error.response.data);
                if (error.response.status === 419) {
                    errorMessage = 'Sesi Anda telah kedaluwarsa. Silakan refresh halaman dan coba lagi.';
                } else {
                    errorMessage = error.response.data.message || errorMessage;
                }
            } else {
                console.error('Network or request error:', error.message);
                errorMessage = 'Terjadi masalah jaringan. Periksa koneksi Anda.';
            }

            alert(errorMessage);
            setIsLoading(false);
            setPaymentStatus('error');
        }
    };

    const openSnapPayment = (token) => {
        setPaymentStatus('opening_payment');
        
        if (paymentTimeoutRef.current) {
            clearTimeout(paymentTimeoutRef.current);
        }

        paymentTimeoutRef.current = setTimeout(handlePaymentTimeout, 30000);

        try {
            window.snap.pay(token, {
                onSuccess: (result) => {
                    clearTimeout(paymentTimeoutRef.current);
                    setPaymentStatus('success');
                    router.get(route('subscription.payment.success'), {}, {
                        onFinish: () => setIsLoading(false)
                    });
                },
                onPending: (result) => {
                    clearTimeout(paymentTimeoutRef.current);
                    setPaymentStatus('pending');
                    router.get(route('subscription.payment.success'), {}, {
                        onFinish: () => setIsLoading(false)
                    });
                },
                onError: (result) => {
                    clearTimeout(paymentTimeoutRef.current);
                    console.error('Payment error:', result);
                    setPaymentStatus('error');
                    alert('Pembayaran gagal, silakan coba lagi.');
                    setIsLoading(false);
                },
                onClose: () => {
                    clearTimeout(paymentTimeoutRef.current);
                    setPaymentStatus('closed');
                    setIsLoading(false);
                },
            });
        } catch (error) {
            clearTimeout(paymentTimeoutRef.current);
            setPaymentStatus('error');
            alert('Error membuka pembayaran: ' + error.message);
            setIsLoading(false);
        }
    };

    const handlePaymentTimeout = () => {
        setPaymentStatus('timeout');
        alert('Pembayaran sedang diproses. Jika popup pembayaran tidak terbuka, silakan refresh halaman dan coba lagi.');
        setIsLoading(false);
    };

    const handleSnapNotLoaded = () => {
        setPaymentStatus('snap_error');
        alert('Sistem pembayaran sedang tidak tersedia. Silakan refresh halaman dan coba lagi dalam beberapa saat.');
        setIsLoading(false);
    };

    useEffect(() => {
        if (snap_token && show && !isLoading) {
            setPaymentStatus('loading_snap');
            setIsLoading(true);
            checkSnapLoaded((isLoaded) => {
                if (isLoaded) {
                    openSnapPayment(snap_token);
                } else {
                    handleSnapNotLoaded();
                }
            });
        }
    }, [snap_token, show]);

    useEffect(() => {
        return () => {
            if (paymentTimeoutRef.current) {
                clearTimeout(paymentTimeoutRef.current);
            }
        };
    }, []);

    const getLoadingText = () => {
        switch (paymentStatus) {
            case 'preparing': return 'Mempersiapkan pembayaran...';
            case 'loading_snap': return 'Memuat sistem pembayaran...';
            case 'opening_payment': return 'Membuka halaman pembayaran...';
            case 'success': return 'Pembayaran berhasil!';
            case 'pending': return 'Pembayaran tertunda...';
            case 'error': return 'Terjadi kesalahan';
            case 'snap_error': return 'Error sistem pembayaran';
            case 'timeout': return 'Sedang memproses...';
            case 'closed': return 'Pembayaran ditutup';
            default: return 'Memproses...';
        }
    };

    const getSubText = () => {
        switch (paymentStatus) {
            case 'loading_snap': return 'Sedang memuat Midtrans...';
            case 'opening_payment': return 'Popup pembayaran akan segera terbuka...';
            case 'timeout': return 'Jika popup tidak terbuka, silakan refresh';
            default: return 'Jangan tutup halaman ini';
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative bg-white dark:bg-slate-800 shadow-xl rounded-2xl p-8 w-full max-w-md text-center"
            >
                <button 
                    onClick={handleClose}
                    disabled={isLoading && !['timeout', 'error', 'snap_error'].includes(paymentStatus)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 disabled:opacity-50 transition-colors"
                    title="Tutup dan lanjutkan dengan fitur gratis"
                >
                    <XMarkIcon className="h-6 w-6" />
                </button>
                
                <div className="w-16 h-16 mx-auto bg-gradient-to-tr from-yellow-400 to-amber-500 rounded-full flex items-center justify-center">
                    <SparklesIcon className="w-10 h-10 text-white" />
                </div>
                
                <h2 className="mt-6 text-2xl font-bold text-slate-900 dark:text-white">Tingkatkan ke Premium</h2>
                <p className="mt-2 text-slate-600 dark:text-slate-300">
                    Nikmati fitur lengkap tanpa batas. Atau lanjutkan dengan fitur gratis.
                </p>
                
                {!isLoading && (
                    <div className="mt-6 space-y-4">
                        {plans.length > 0 ? (
                            plans.map((plan) => (
                                <div key={plan.name} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 text-left hover:border-amber-300 transition-colors">
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{plan.name}</h3>
                                    <p className="text-slate-600 dark:text-slate-300 mt-1">
                                        Rp {plan.price?.toLocaleString('id-ID')} / {plan.duration === 'monthly' ? 'bulan' : 'tahun'}
                                    </p>
                                    <button
                                        onClick={() => handleCheckout(plan.name)}
                                        disabled={isLoading}
                                        className={`mt-4 w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 ${
                                            isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 shadow-lg shadow-amber-500/30'
                                        }`}
                                    >
                                        {isLoading ? 'Memproses...' : `Upgrade ke ${plan.name}`}
                                    </button>
                                </div>
                            ))
                        ) : (
                            <p className="text-slate-600 dark:text-slate-300 py-4">Tidak ada paket tersedia.</p>
                        )}
                        
                        <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                            <button
                                onClick={handleClose}
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
                            <div className={`animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4 ${
                                ['timeout', 'error', 'snap_error'].includes(paymentStatus) ? 'hidden' : ''
                            }`}></div>
                            
                            {['timeout', 'error', 'snap_error'].includes(paymentStatus) && (
                                <div className="w-12 h-12 mx-auto mb-4 text-amber-500">
                                    <XMarkIcon className="w-12 h-12" />
                                </div>
                            )}
                            
                            <p className="text-slate-600 dark:text-slate-300 font-medium text-lg">
                                {getLoadingText()}
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                                {getSubText()}
                            </p>
                            
                            {paymentStatus === 'timeout' && (
                                <div className="mt-4 space-y-2">
                                    <p className="text-xs text-slate-500">Popup pembayaran mungkin terbuka di belakang browser</p>
                                    <div className="flex gap-2 justify-center">
                                        <button
                                            onClick={() => window.location.reload()}
                                            className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm"
                                        >
                                            Refresh Halaman
                                        </button>
                                        <button
                                            onClick={handleClose}
                                            className="bg-slate-500 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm"
                                        >
                                            Batalkan
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
}