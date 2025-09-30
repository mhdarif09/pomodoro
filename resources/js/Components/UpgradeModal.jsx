import { router, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { SparklesIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { useState, useEffect, useRef } from 'react';

export default function UpgradeModal({ show, onClose, plans = [] }) {
    const [isLoading, setIsLoading] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState('');
    const { snap_token, flash } = usePage().props;
    const paymentTimeoutRef = useRef(null);
    const snapCheckRef = useRef(null);

    if (!show) return null;

    const checkSnapLoaded = (callback, maxAttempts = 10) => {
        let attempts = 0;
        
        const check = () => {
            attempts++;
            console.log(`Checking Snap.js... Attempt ${attempts}`);
            
            if (typeof window.snap !== 'undefined') {
                console.log('Snap.js is loaded!');
                callback(true);
            } else if (attempts >= maxAttempts) {
                console.error('Snap.js failed to load after maximum attempts');
                callback(false);
            } else {
                setTimeout(check, 1000);
            }
        };
        
        check();
    };

    const handleClose = () => {
        // Clear all timeouts
        if (paymentTimeoutRef.current) {
            clearTimeout(paymentTimeoutRef.current);
        }
        if (snapCheckRef.current) {
            clearTimeout(snapCheckRef.current);
        }
        
        console.log('User closed upgrade modal - continuing with free features');
        
        // Langsung close modal tanpa API call
        onClose();
        
        // Simpan di localStorage bahwa user sudah menutup modal
        // Ini optional, hanya untuk UX improvement
        localStorage.setItem('upgrade_modal_last_closed', new Date().toISOString());
    };

    const handleCheckout = async (planName) => {
        setIsLoading(true);
        setPaymentStatus('preparing');
        
        try {
            const response = await fetch('/subscribe/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                },
                body: JSON.stringify({ plan: planName })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.success && data.snap_token) {
                setPaymentStatus('loading_snap');
                console.log('Snap token received:', data.snap_token);
                
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
            console.error('Checkout error:', error);
            alert('Gagal memulai pembayaran: ' + error.message);
            setIsLoading(false);
            setPaymentStatus('error');
        }
    };

    const openSnapPayment = (token) => {
        console.log('Opening Snap payment with token:', token);
        setPaymentStatus('opening_payment');
        
        if (paymentTimeoutRef.current) {
            clearTimeout(paymentTimeoutRef.current);
        }

        paymentTimeoutRef.current = setTimeout(() => {
            if (paymentStatus === 'opening_payment') {
                handlePaymentTimeout();
            }
        }, 30000);

        try {
            window.snap.pay(token, {
                onSuccess: (result) => {
                    clearTimeout(paymentTimeoutRef.current);
                    console.log('Payment success:', result);
                    setPaymentStatus('success');
                    window.location.href = '/subscription/payment-success';
                },
                onPending: (result) => {
                    clearTimeout(paymentTimeoutRef.current);
                    console.log('Payment pending:', result);
                    setPaymentStatus('pending');
                    window.location.href = '/subscription/payment-success';
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
                    console.log('Payment popup closed by user');
                    setPaymentStatus('closed');
                    setIsLoading(false);
                    // User memilih untuk tidak bayar sekarang, tetap bisa pakai fitur gratis
                },
            });
        } catch (error) {
            console.error('Error opening Snap payment:', error);
            clearTimeout(paymentTimeoutRef.current);
            setPaymentStatus('error');
            alert('Error membuka pembayaran: ' + error.message);
            setIsLoading(false);
        }
    };

    const handlePaymentTimeout = () => {
        console.error('Payment timeout occurred');
        setPaymentStatus('timeout');
        alert('Pembayaran sedang diproses. Jika popup pembayaran tidak terbuka, silakan refresh halaman dan coba lagi.');
        setIsLoading(false);
    };

    const handleSnapNotLoaded = () => {
        console.error('Snap.js failed to load');
        setPaymentStatus('snap_error');
        alert('Sistem pembayaran sedang tidak tersedia. Silakan refresh halaman dan coba lagi dalam beberapa saat.');
        setIsLoading(false);
    };

    // Handle snap token dari props
    useEffect(() => {
        if (snap_token && show && !isLoading) {
            console.log('Snap token from props received:', snap_token);
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

    // Cleanup
    useEffect(() => {
        return () => {
            if (paymentTimeoutRef.current) {
                clearTimeout(paymentTimeoutRef.current);
            }
            if (snapCheckRef.current) {
                clearTimeout(snapCheckRef.current);
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
                {/* Close button - user bebas menutup kapan saja */}
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
                        
                        {/* Optional: Skip button untuk lebih jelas */}
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