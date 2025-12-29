import React, { useState, useEffect } from 'react';
import { useForm, router } from '@inertiajs/react';
import AdaptiveModal from './AdaptiveModal';
import {
    CheckIcon,
    SparklesIcon,
    TicketIcon,
    CreditCardIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import axios from 'axios';

const UpgradeModal = ({ isOpen, onClose, plans }) => {
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [promoCode, setPromoCode] = useState('');
    const [discountInfo, setDiscountInfo] = useState(null);
    const [isApplyingPromo, setIsApplyingPromo] = useState(false);
    const [promoError, setPromoError] = useState('');

    useEffect(() => {
        if (plans && plans.length > 0 && !selectedPlan) {
            // Default to first paid plan (usually Premium)
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
        try {
            const response = await axios.post(route('subscription.upgrade'), {
                plan_id: selectedPlan.id,
                promo_code: discountInfo?.promo_code
            });

            if (response.data.success && response.data.snap_token) {
                // Trigger Midtrans Snap
                window.snap.pay(response.data.snap_token, {
                    onSuccess: (result) => {
                        router.visit(route('dashboard'), { data: { success: 'Upgrade berhasil!' } });
                    },
                    onPending: (result) => {
                        onClose();
                    },
                    onError: (result) => {
                        alert('Pembayaran gagal.');
                    }
                });
            }
        } catch (error) {
            alert('Gagal memulai transaksi upgrade.');
        }
    };

    if (!selectedPlan) return null;

    const currentPrice = selectedPlan.price;
    const finalPrice = discountInfo ? discountInfo.final_price : currentPrice;

    return (
        <AdaptiveModal
            isOpen={isOpen}
            onClose={onClose}
            title="✨ Upgrade ke Premium"
            maxWidth="max-w-xl"
        >
            <div className="space-y-6">
                <p className="text-slate-500 dark:text-slate-400 text-center">
                    Buka potensi penuh dirimu dengan fitur eksklusif Sarang Tumbuh.
                </p>

                {/* Plan Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {plans.filter(p => p.price > 0).map(plan => (
                        <div
                            key={plan.id}
                            onClick={() => {
                                setSelectedPlan(plan);
                                setDiscountInfo(null);
                                setPromoCode('');
                            }}
                            className={clsx(
                                "relative p-4 rounded-2xl border-2 transition-all cursor-pointer",
                                selectedPlan.id === plan.id
                                    ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/20"
                                    : "border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600"
                            )}
                        >
                            {selectedPlan.id === plan.id && (
                                <div className="absolute -top-3 -right-3 bg-emerald-500 text-white p-1 rounded-full">
                                    <CheckIcon className="h-4 w-4" />
                                </div>
                            )}
                            <h4 className="font-bold text-slate-800 dark:text-white uppercase tracking-tight">{plan.name}</h4>
                            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                                Rp {parseInt(plan.price).toLocaleString()}
                                <span className="text-sm font-normal text-slate-500">/{plan.duration === 'yearly' ? 'tahun' : 'bulan'}</span>
                            </p>
                        </div>
                    ))}
                </div>

                {/* Features List */}
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 space-y-3">
                    <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Fitur Premium</h5>
                    {Array.isArray(selectedPlan.features) ? selectedPlan.features.map((feature, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                            <SparklesIcon className="h-4 w-4 text-emerald-500 shrink-0" />
                            <span>{feature}</span>
                        </div>
                    )) : (typeof selectedPlan.features === 'string' && selectedPlan.features.startsWith('[') ? JSON.parse(selectedPlan.features).map((feature, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                            <SparklesIcon className="h-4 w-4 text-emerald-500 shrink-0" />
                            <span>{feature}</span>
                        </div>
                    )) : null)}
                </div>

                {/* Promo Code */}
                <div className="space-y-3">
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <TicketIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <input
                                type="text"
                                value={promoCode}
                                onChange={e => setPromoCode(e.target.value.toUpperCase())}
                                placeholder="Punya kode promo?"
                                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                            />
                        </div>
                        <button
                            onClick={handleApplyPromo}
                            disabled={!promoCode || isApplyingPromo}
                            className="px-6 py-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl font-bold disabled:opacity-50 active:scale-95 transition-all shadow-lg"
                        >
                            {isApplyingPromo ? <ArrowPathIcon className="h-5 w-5 animate-spin" /> : 'Gunakan'}
                        </button>
                    </div>
                    {promoError && <p className="text-xs text-red-500 ml-1">{promoError}</p>}
                    {discountInfo && (
                        <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-xl animate-in fade-in slide-in-from-top-2">
                            <div className="flex items-center gap-2">
                                <CheckIcon className="h-4 w-4 text-emerald-600" />
                                <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Promo dipasang: <b>{discountInfo.promo_code}</b></span>
                            </div>
                            <span className="text-sm font-bold text-emerald-600">
                                -Rp {discountInfo.discount_amount.toLocaleString()}
                            </span>
                        </div>
                    )}
                </div>

                {/* Pricing Summary & Checkout */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                    <div className="flex justify-between items-end mb-6">
                        <div>
                            <p className="text-sm text-slate-500">Total Pembayaran</p>
                            <div className="flex items-baseline gap-2">
                                {discountInfo && (
                                    <span className="text-lg text-slate-400 line-through">Rp {parseInt(currentPrice).toLocaleString()}</span>
                                )}
                                <span className="text-3xl font-black text-slate-900 dark:text-white">
                                    Rp {parseInt(finalPrice).toLocaleString()}
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={handleUpgrade}
                            className="flex items-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-emerald-500/30 active:scale-95 transition-all"
                        >
                            <CreditCardIcon className="h-6 w-6" />
                            Upgrade Sekarang
                        </button>
                    </div>
                    <p className="text-[10px] text-slate-400 text-center uppercase tracking-widest">
                        Pembayaran aman via Midtrans • Langganan diproses otomatis
                    </p>
                </div>
            </div>
        </AdaptiveModal>
    );
};

export default UpgradeModal;