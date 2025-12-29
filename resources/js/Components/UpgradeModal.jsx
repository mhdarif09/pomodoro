import React, { useState, useEffect } from 'react';
import { useForm, router } from '@inertiajs/react';
import AdaptiveModal from './AdaptiveModal';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckIcon,
    SparklesIcon,
    TicketIcon,
    CreditCardIcon,
    ArrowPathIcon,
    ShieldCheckIcon,
    BoltIcon,
    StarIcon
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import axios from 'axios';

const UpgradeModal = ({ isOpen, onClose, plans, midtransClientKey: propClientKey, isProduction: propIsProduction }) => {
    const { midtrans } = usePage().props;
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [promoCode, setPromoCode] = useState('');
    const [discountInfo, setDiscountInfo] = useState(null);
    const [isApplyingPromo, setIsApplyingPromo] = useState(false);
    const [promoError, setPromoError] = useState('');
    const [isUpgrading, setIsUpgrading] = useState(false);

    useEffect(() => {
        if (isOpen && !window.snap) {
            const isProduction = propIsProduction ?? midtrans?.is_production ?? true;
            const snapUrl = isProduction ? 'https://app.midtrans.com/snap/snap.js' : 'https://app.sandbox.midtrans.com/snap/snap.js';
            const clientKey = propClientKey || midtrans?.client_key || import.meta.env.VITE_MIDTRANS_CLIENT_KEY;

            const script = document.createElement('script');
            script.src = snapUrl;
            script.setAttribute('data-client-key', clientKey);
            script.async = true;
            document.body.appendChild(script);

            return () => {
                // We keep it loaded for future use
            };
        }
    }, [isOpen]);

    useEffect(() => {
        if (plans && plans.length > 0 && !selectedPlan) {
            const premiumPlan = plans.find(p => p.price > 0) || plans[0];
            setSelectedPlan(premiumPlan);
        }
    }, [plans]);

    const handleApplyPromo = async () => {
        if (!promoCode) return;
        setIsApplyingPromo(true);
        setPromoError('');
        try {
            const response = await axios.post(route('subscription.apply-promo'), {
                code: promoCode,
                plan_id: selectedPlan.id
            });
            if (response.data.success) {
                setDiscountInfo(response.data);
            }
        } catch (error) {
            setPromoError(error.response?.data?.message || 'Gagal menggunakan kode promo.');
            setDiscountInfo(null);
        } finally {
            setIsApplyingPromo(false);
        }
    };

    const handleUpgrade = async () => {
        setIsUpgrading(true);
        try {
            const response = await axios.post(route('subscription.upgrade'), {
                plan_id: selectedPlan.id,
                promo_code: discountInfo?.promo_code
            });

            if (response.data.success && response.data.snap_token) {
                if (window.snap) {
                    window.snap.pay(response.data.snap_token, {
                        onSuccess: () => {
                            onClose();
                            router.visit(route('dashboard'), { data: { success: 'Upgrade berhasil!' } });
                        },
                        onPending: () => { setIsUpgrading(false); onClose(); },
                        onError: () => { setIsUpgrading(false); alert('Pembayaran gagal.'); },
                        onClose: () => setIsUpgrading(false)
                    });
                } else {
                    alert('Sistem pembayaran (Midtrans) belum siap. Silakan refresh halaman.');
                    setIsUpgrading(false);
                }
            } else {
                alert(response.data.message || 'Gagal memulai transaksi.');
                setIsUpgrading(false);
            }
        } catch (error) {
            console.error('Upgrade error:', error);
            const message = error.response?.data?.message || 'Gagal memulai transaksi upgrade.';
            alert(message);
            setIsUpgrading(false);
        }
    };

    if (!selectedPlan) return null;

    const currentPrice = selectedPlan.price;
    const finalPrice = discountInfo ? discountInfo.final_price : currentPrice;

    return (
        <AdaptiveModal
            isOpen={isOpen}
            onClose={onClose}
            title={null} // We'll handle the title inside for more control
            maxWidth="max-w-2xl"
        >
            <div className="relative overflow-hidden">
                {/* Decorative Background for Modal Content */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/10 blur-3xl rounded-full" />
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/10 blur-3xl rounded-full" />

                <div className="relative z-10 px-2 sm:px-6 py-4">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-orange-500/20 mb-4 animate-bounce-subtle">
                            <SparklesIcon className="h-6 w-6 text-white" />
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Evolusi ke Premium</h2>
                        <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Buka pintu menuju produktivitas tanpa batas.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                        {/* Left Side: Selection & Features */}
                        <div className="space-y-6">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Pilih Paket Fokusmu</h3>
                            <div className="grid grid-cols-1 gap-4">
                                {plans.filter(p => p.price > 0).map(plan => (
                                    <div
                                        key={plan.id}
                                        onClick={() => {
                                            setSelectedPlan(plan);
                                            setDiscountInfo(null);
                                            setPromoCode('');
                                        }}
                                        className={clsx(
                                            "relative p-5 rounded-[1.5rem] border-2 transition-all cursor-pointer group hover:scale-[1.02] active:scale-[0.98]",
                                            selectedPlan.id === plan.id
                                                ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/10 shadow-lg shadow-blue-500/5"
                                                : "border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 bg-white dark:bg-black/20"
                                        )}
                                    >
                                        <div className="flex items-center justify-between gap-4">
                                            <div>
                                                <h4 className="font-black text-slate-800 dark:text-white uppercase tracking-tight flex items-center gap-2">
                                                    {plan.name}
                                                    {plan.name.toLowerCase().includes('annual') && (
                                                        <span className="text-[9px] bg-blue-500 text-white px-2 py-0.5 rounded-full tracking-widest">HEMAT 20%</span>
                                                    )}
                                                </h4>
                                                <div className="flex items-baseline gap-1 mt-1">
                                                    <span className="text-xs font-bold text-slate-400">RP</span>
                                                    <span className="text-xl font-black text-slate-900 dark:text-white">
                                                        {parseInt(plan.price).toLocaleString()}
                                                    </span>
                                                    <span className="text-xs font-bold text-slate-400">/{plan.duration === 'yearly' ? 'thn' : 'bln'}</span>
                                                </div>
                                            </div>
                                            <div className={clsx(
                                                "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                                                selectedPlan.id === plan.id ? "bg-blue-500 border-blue-500" : "border-slate-200 dark:border-slate-700"
                                            )}>
                                                {selectedPlan.id === plan.id && <CheckIcon className="h-4 w-4 text-white" />}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-slate-50 dark:bg-white/5 rounded-[1.5rem] p-6 space-y-4">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <ShieldCheckIcon className="h-4 w-4 text-blue-500" />
                                    Privilese yang Anda dapatkan
                                </h4>
                                <div className="space-y-3">
                                    {Array.isArray(selectedPlan.features) && selectedPlan.features.slice(0, 4).map((feature, i) => (
                                        <div key={i} className="flex items-center gap-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
                                            <div className="w-5 h-5 rounded-full bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center shrink-0">
                                                <StarIcon className="h-3 w-3 text-blue-500 fill-blue-500" />
                                            </div>
                                            <span>{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right Side: Payment & Promo */}
                        <div className="space-y-6">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Detail Transaksi</h3>

                            <div className="bg-white dark:bg-black/40 border border-slate-100 dark:border-slate-800 rounded-[1.5rem] p-6 space-y-6 shadow-sm">
                                {/* Promo Code Section */}
                                <div className="space-y-3">
                                    <div className="flex gap-2">
                                        <div className="relative flex-1 group">
                                            <TicketIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                            <input
                                                type="text"
                                                value={promoCode}
                                                onChange={e => setPromoCode(e.target.value.toUpperCase())}
                                                placeholder="KODE PROMO"
                                                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-white/5 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 font-bold placeholder:text-slate-400 transition-all uppercase"
                                            />
                                        </div>
                                        <button
                                            onClick={handleApplyPromo}
                                            disabled={!promoCode || isApplyingPromo}
                                            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-black rounded-2xl active:scale-95 disabled:opacity-30 transition-all"
                                        >
                                            {isApplyingPromo ? <ArrowPathIcon className="h-5 w-5 animate-spin" /> : 'PASANG'}
                                        </button>
                                    </div>
                                    <AnimatePresence>
                                        {promoError && (
                                            <motion.p
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0 }}
                                                className="text-[10px] text-red-500 font-bold uppercase tracking-widest ml-1"
                                            >
                                                {promoError}
                                            </motion.p>
                                        )}
                                        {discountInfo && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="flex items-center justify-between p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <CheckIcon className="h-4 w-4 text-emerald-500" />
                                                    <span className="text-xs font-black text-emerald-600 uppercase tracking-widest">{discountInfo.promo_code} AKTIF</span>
                                                </div>
                                                <span className="text-xs font-black text-emerald-600">
                                                    -RP {discountInfo.discount_amount.toLocaleString()}
                                                </span>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Price Summary */}
                                <div className="space-y-3 pt-4 border-t border-slate-50 dark:border-white/5">
                                    <div className="flex justify-between items-center text-sm font-bold text-slate-500 dark:text-slate-400">
                                        <span>HARGA NORMAL</span>
                                        <span>RP {parseInt(currentPrice).toLocaleString()}</span>
                                    </div>
                                    {discountInfo && (
                                        <div className="flex justify-between items-center text-sm font-bold text-emerald-500 uppercase tracking-widest">
                                            <span>POTONGAN PROMO</span>
                                            <span>-RP {discountInfo.discount_amount.toLocaleString()}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-end pt-2">
                                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">ESTIMASI TOTAL</span>
                                        <div className="text-right">
                                            <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
                                                RP {parseInt(finalPrice).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleUpgrade}
                                    disabled={isUpgrading}
                                    className="w-full flex items-center justify-center gap-3 py-5 bg-slate-900 dark:bg-white text-white dark:text-black rounded-[1.5rem] font-black text-lg shadow-2xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-all active:scale-[0.97] group overflow-hidden"
                                >
                                    <CreditCardIcon className="h-6 w-6 group-hover:rotate-12 transition-transform" />
                                    <span>{isUpgrading ? 'Sinkronisasi...' : 'Konfirmasi Upgrade'}</span>
                                </button>

                                <p className="text-[10px] text-slate-400 text-center font-bold uppercase tracking-widest pointer-events-none">
                                    MIDTRANS SECURE CHECKOUT • NO AUTO-RENEW
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdaptiveModal>
    );
};

export default UpgradeModal;
