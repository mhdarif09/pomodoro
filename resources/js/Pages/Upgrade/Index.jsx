import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckIcon, SparklesIcon, RocketLaunchIcon, ShieldCheckIcon,
    BoltIcon, StarIcon, ArrowPathIcon, GiftIcon, TicketIcon,
    CreditCardIcon, TrophyIcon, FireIcon
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import axios from 'axios';

function XPRedeemSection({ xpInfo, onRedeemed }) {
    const [xpAmount, setXpAmount] = useState(100);
    const [isRedeeming, setIsRedeeming] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    const discountPreview = Math.floor((xpAmount / 100) * 1000);
    const maxRedeemable = Math.floor((xpInfo.total_xp || 0) / 100) * 100;

    const presets = [100, 200, 500, 1000].filter(v => v <= maxRedeemable);

    const handleRedeem = async () => {
        setIsRedeeming(true);
        setError('');
        setResult(null);
        try {
            const res = await axios.post(route('upgrade.redeem-xp'), { xp_amount: xpAmount });
            if (res.data.success) {
                setResult(res.data);
                onRedeemed?.(res.data);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal menukar XP.');
        } finally {
            setIsRedeeming(false);
        }
    };

    return (
        <div className="bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-700 rounded-[2rem] p-8 shadow-2xl shadow-purple-500/20 relative overflow-hidden">
            {/* Decorative */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-400/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 bg-white/10 rounded-2xl backdrop-blur-sm">
                        <GiftIcon className="w-6 h-6 text-amber-300" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-white tracking-tight">Tukar XP untuk Diskon</h3>
                        <p className="text-white/60 text-sm font-medium">100 XP = Rp 1.000 diskon langganan</p>
                    </div>
                </div>

                {/* XP Balance */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center">
                        <p className="text-xs font-bold text-white/50 uppercase tracking-wider mb-1">Total XP</p>
                        <p className="text-2xl font-black text-white">{(xpInfo.total_xp || 0).toLocaleString()}</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center">
                        <p className="text-xs font-bold text-white/50 uppercase tracking-wider mb-1">Level</p>
                        <p className="text-2xl font-black text-amber-300">{xpInfo.level}</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center">
                        <p className="text-xs font-bold text-white/50 uppercase tracking-wider mb-1">Title</p>
                        <p className="text-sm font-black text-white truncate">{xpInfo.level_title}</p>
                    </div>
                </div>

                {maxRedeemable >= 100 ? (
                    <>
                        {/* Quick Presets */}
                        <div className="flex flex-wrap gap-2 mb-4">
                            {presets.map(val => (
                                <button
                                    key={val}
                                    onClick={() => setXpAmount(val)}
                                    className={clsx(
                                        "px-4 py-2 rounded-xl text-sm font-bold transition-all active:scale-95",
                                        xpAmount === val
                                            ? "bg-white text-purple-700 shadow-lg"
                                            : "bg-white/10 text-white/80 hover:bg-white/20"
                                    )}
                                >
                                    {val} XP
                                </button>
                            ))}
                        </div>

                        {/* Custom Amount */}
                        <div className="flex gap-3 mb-4">
                            <div className="flex-1 relative">
                                <input
                                    type="number"
                                    value={xpAmount}
                                    onChange={(e) => setXpAmount(Math.max(100, Math.min(maxRedeemable, parseInt(e.target.value) || 100)))}
                                    min={100}
                                    max={maxRedeemable}
                                    step={100}
                                    className="w-full px-5 py-3.5 bg-white/10 border-0 rounded-2xl text-white font-bold placeholder:text-white/40 focus:ring-2 focus:ring-white/30 transition-all backdrop-blur-sm"
                                    placeholder="Jumlah XP"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 font-bold text-sm">XP</span>
                            </div>
                        </div>

                        {/* Preview */}
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 mb-5 flex items-center justify-between">
                            <span className="text-white/70 font-semibold text-sm">Diskon yang didapat:</span>
                            <span className="text-2xl font-black text-emerald-300">Rp {discountPreview.toLocaleString()}</span>
                        </div>

                        {/* Redeem Button */}
                        <button
                            onClick={handleRedeem}
                            disabled={isRedeeming || xpAmount < 100}
                            className="w-full py-4 bg-white text-purple-700 rounded-2xl font-black text-lg shadow-2xl hover:bg-slate-50 transition-all active:scale-[0.97] disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isRedeeming ? (
                                <><ArrowPathIcon className="w-5 h-5 animate-spin" /> Memproses...</>
                            ) : (
                                <><SparklesIcon className="w-5 h-5" /> Tukar {xpAmount} XP → Kode Promo</>
                            )}
                        </button>
                    </>
                ) : (
                    <div className="text-center py-6">
                        <p className="text-white/60 font-semibold">Kamu butuh minimal 100 XP untuk menukar diskon.</p>
                        <p className="text-white/40 text-sm mt-1">Selesaikan Focus Rounds untuk mendapatkan XP! 🚀</p>
                    </div>
                )}

                {/* Success Result */}
                <AnimatePresence>
                    {result && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="mt-4 bg-emerald-500/20 border border-emerald-400/30 rounded-2xl p-5"
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <CheckIcon className="w-5 h-5 text-emerald-400" />
                                <span className="font-black text-emerald-300">Berhasil!</span>
                            </div>
                            <div className="bg-black/20 rounded-xl p-4 text-center">
                                <p className="text-xs text-white/50 font-bold uppercase tracking-widest mb-1">Kode Promo Kamu</p>
                                <p className="text-2xl font-black text-white tracking-wider">{result.promo_code}</p>
                                <p className="text-emerald-300 font-bold mt-1">Diskon Rp {result.discount_value.toLocaleString()}</p>
                            </div>
                            <p className="text-white/50 text-xs mt-3 text-center">Gunakan kode promo ini saat checkout untuk mendapatkan diskon!</p>
                        </motion.div>
                    )}
                    {error && (
                        <motion.p
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="mt-4 text-red-300 font-bold text-sm text-center bg-red-500/10 rounded-xl p-3"
                        >
                            {error}
                        </motion.p>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

export default function UpgradeIndex() {
    const { plans = [], xpInfo = {}, availablePromoCodes = [], activeSubscription, is_premium, midtrans_client_key, midtrans_is_production } = usePage().props;

    const [selectedPlan, setSelectedPlan] = useState(null);
    const [promoCode, setPromoCode] = useState('');
    const [discountInfo, setDiscountInfo] = useState(null);
    const [isApplyingPromo, setIsApplyingPromo] = useState(false);
    const [promoError, setPromoError] = useState('');
    const [isUpgrading, setIsUpgrading] = useState(false);
    const [localXpInfo, setLocalXpInfo] = useState(xpInfo);
    const [localPromoCodes, setLocalPromoCodes] = useState(availablePromoCodes);

    useEffect(() => {
        if (plans.length > 0 && !selectedPlan) {
            const premiumPlan = plans.find(p => p.price > 0) || plans[0];
            setSelectedPlan(premiumPlan);
        }
    }, [plans]);

    // Load Midtrans script
    useEffect(() => {
        if (!window.snap) {
            const isProduction = midtrans_is_production ?? true;
            const snapUrl = isProduction ? 'https://app.midtrans.com/snap/snap.js' : 'https://app.sandbox.midtrans.com/snap/snap.js';
            const clientKey = midtrans_client_key || import.meta.env.VITE_MIDTRANS_CLIENT_KEY;
            const script = document.createElement('script');
            script.src = snapUrl;
            script.setAttribute('data-client-key', clientKey);
            script.async = true;
            document.body.appendChild(script);
        }
    }, []);

    const handleApplyPromo = async () => {
        if (!promoCode) return;
        setIsApplyingPromo(true);
        setPromoError('');
        try {
            const res = await axios.post(route('subscription.apply-promo'), {
                code: promoCode,
                plan_id: selectedPlan.id,
            });
            if (res.data.success) {
                setDiscountInfo(res.data);
            }
        } catch (err) {
            setPromoError(err.response?.data?.message || 'Kode promo tidak valid.');
            setDiscountInfo(null);
        } finally {
            setIsApplyingPromo(false);
        }
    };

    const handleUseExistingPromo = (code) => {
        setPromoCode(code);
        setDiscountInfo(null);
        setPromoError('');
        // Auto-apply
        setTimeout(() => {
            const applyBtn = document.getElementById('apply-promo-btn');
            if (applyBtn) applyBtn.click();
        }, 100);
    };

    const handleUpgrade = async () => {
        if (!selectedPlan) return;
        setIsUpgrading(true);
        try {
            const res = await axios.post(route('subscription.upgrade'), {
                plan_id: selectedPlan.id,
                promo_code: discountInfo?.promo_code || promoCode || undefined,
            });

            if (res.data.success && res.data.snap_token) {
                if (window.snap) {
                    window.snap.pay(res.data.snap_token, {
                        onSuccess: () => {
                            router.visit(route('dashboard'), { data: { success: 'Upgrade berhasil! 🎉' } });
                        },
                        onPending: () => setIsUpgrading(false),
                        onError: () => { setIsUpgrading(false); alert('Pembayaran gagal.'); },
                        onClose: () => setIsUpgrading(false),
                    });
                } else {
                    alert('Midtrans belum siap. Silakan refresh halaman.');
                    setIsUpgrading(false);
                }
            } else {
                alert(res.data.message || 'Gagal memulai transaksi.');
                setIsUpgrading(false);
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Gagal memulai upgrade.');
            setIsUpgrading(false);
        }
    };

    const handleXPRedeemed = (data) => {
        setLocalXpInfo(prev => ({
            ...prev,
            total_xp: data.remaining_xp,
        }));
        // Add new promo code to local list
        setLocalPromoCodes(prev => [{
            promo_code: data.promo_code,
            cashback_value: data.discount_value,
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        }, ...prev]);
    };

    const currentPrice = selectedPlan?.price || 0;
    const finalPrice = discountInfo ? discountInfo.final_price : currentPrice;

    const features = [
        { icon: BoltIcon, text: 'Unlimited Task & Subtask AI Generation' },
        { icon: FireIcon, text: 'Advanced Focus Analytics & Insights' },
        { icon: TrophyIcon, text: 'Priority Guild Features & Challenges' },
        { icon: ShieldCheckIcon, text: 'Auto-Open URLs & Premium Integrations' },
        { icon: StarIcon, text: 'Exclusive Level Badges & Achievements' },
        { icon: RocketLaunchIcon, text: 'Early Access to New Features' },
    ];

    return (
        <AuthenticatedLayout
            header={<h2 className="font-extrabold text-2xl text-slate-900 dark:text-white tracking-tight">Upgrade Plan</h2>}
        >
            <Head title="Upgrade Plan" />

            <div className="py-6 sm:py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
                {/* Hero Header */}
                <motion.div
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="text-center mb-12"
                >
                    <motion.div
                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                        transition={{ type: 'spring', bounce: 0.5, delay: 0.2 }}
                        className="inline-flex p-4 rounded-[1.5rem] bg-gradient-to-br from-amber-400 to-orange-500 shadow-2xl shadow-orange-500/30 mb-6"
                    >
                        <SparklesIcon className="h-8 w-8 text-white" />
                    </motion.div>
                    <h1 className="text-4xl sm:text-6xl font-[900] text-slate-900 dark:text-white tracking-tight leading-tight">
                        Upgrade ke <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 bg-clip-text text-transparent">Premium</span>
                    </h1>
                    <p className="text-lg text-slate-500 dark:text-slate-400 mt-4 font-semibold max-w-xl mx-auto">
                        Buka potensi penuh produktivitasmu. Gunakan XP yang kamu kumpulkan untuk mendapatkan diskon! ✨
                    </p>
                </motion.div>

                {/* Active Subscription Banner */}
                <AnimatePresence>
                    {is_premium && activeSubscription && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                            className="mb-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-[2rem] p-6 shadow-xl shadow-emerald-500/20 text-white text-center"
                        >
                            <CheckIcon className="w-8 h-8 mx-auto mb-2" />
                            <h3 className="text-xl font-black">Kamu sudah Premium! 🎉</h3>
                            <p className="text-white/80 font-medium mt-1">
                                Aktif sampai {new Date(activeSubscription.expired_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left: Plans + Checkout */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="space-y-6"
                    >
                        {/* Plan Cards */}
                        <div>
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Pilih Paket</h3>
                            <div className="space-y-4">
                                {plans.filter(p => p.price > 0).map((plan, idx) => (
                                    <motion.div
                                        key={plan.id}
                                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.15 + idx * 0.1 }}
                                        onClick={() => {
                                            setSelectedPlan(plan);
                                            setDiscountInfo(null);
                                            setPromoCode('');
                                        }}
                                        className={clsx(
                                            "relative p-6 rounded-[2rem] border-2 transition-all cursor-pointer group hover:scale-[1.02] active:scale-[0.98]",
                                            selectedPlan?.id === plan.id
                                                ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/10 shadow-xl shadow-blue-500/10"
                                                : "border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 bg-white dark:bg-black/20"
                                        )}
                                    >
                                        {plan.name?.toLowerCase().includes('annual') && (
                                            <div className="absolute -top-3 right-6 px-3 py-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full text-[10px] font-black text-white uppercase tracking-wider shadow-lg">
                                                🔥 HEMAT 20%
                                            </div>
                                        )}
                                        <div className="flex items-center justify-between gap-4">
                                            <div>
                                                <h4 className="text-lg font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
                                                    {plan.name}
                                                </h4>
                                                <div className="flex items-baseline gap-1 mt-1">
                                                    <span className="text-xs font-bold text-slate-400">RP</span>
                                                    <span className="text-3xl font-black text-slate-900 dark:text-white">
                                                        {parseInt(plan.price).toLocaleString()}
                                                    </span>
                                                    <span className="text-xs font-bold text-slate-400">/{plan.duration === 'yearly' ? 'thn' : 'bln'}</span>
                                                </div>
                                            </div>
                                            <div className={clsx(
                                                "w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all",
                                                selectedPlan?.id === plan.id ? "bg-blue-500 border-blue-500 scale-110" : "border-slate-200 dark:border-slate-700"
                                            )}>
                                                {selectedPlan?.id === plan.id && <CheckIcon className="h-4 w-4 text-white" />}
                                            </div>
                                        </div>

                                        {/* Features */}
                                        {selectedPlan?.id === plan.id && Array.isArray(plan.features) && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2"
                                            >
                                                {plan.features.slice(0, 4).map((feature, i) => (
                                                    <div key={i} className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
                                                        <div className="w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                                                            <CheckIcon className="h-3 w-3 text-blue-500" />
                                                        </div>
                                                        <span>{feature}</span>
                                                    </div>
                                                ))}
                                            </motion.div>
                                        )}

                                        {/* Select Button for clarity */}
                                        <div className="mt-6">
                                            <button
                                                className={clsx(
                                                    "w-full py-2.5 rounded-xl font-bold text-sm transition-all",
                                                    selectedPlan?.id === plan.id
                                                        ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30"
                                                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                                                )}
                                            >
                                                {selectedPlan?.id === plan.id ? 'Dipilih' : 'Pilih Paket'}
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Checkout Card */}
                        {selectedPlan && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                className="bg-white dark:bg-[#1C1C1E] border border-slate-100 dark:border-slate-800 rounded-[2rem] p-6 shadow-xl space-y-5"
                            >
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Detail Transaksi</h3>

                                {/* Promo Code */}
                                <div className="space-y-3">
                                    <div className="flex gap-2">
                                        <div className="relative flex-1 group">
                                            <TicketIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                            <input
                                                type="text"
                                                value={promoCode}
                                                onChange={e => setPromoCode(e.target.value.toUpperCase())}
                                                placeholder="KODE PROMO / XP"
                                                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-white/5 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 font-bold placeholder:text-slate-400 transition-all uppercase"
                                            />
                                        </div>
                                        <button
                                            id="apply-promo-btn"
                                            onClick={handleApplyPromo}
                                            disabled={!promoCode || isApplyingPromo}
                                            className="px-5 py-3 bg-blue-500 hover:bg-blue-600 text-white font-black rounded-2xl active:scale-95 disabled:opacity-30 transition-all"
                                        >
                                            {isApplyingPromo ? <ArrowPathIcon className="h-5 w-5 animate-spin" /> : 'PASANG'}
                                        </button>
                                    </div>

                                    {/* Available XP Promo Codes */}
                                    {localPromoCodes.length > 0 && (
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black text-purple-500 uppercase tracking-widest">Kode dari XP kamu:</p>
                                            {localPromoCodes.map((p, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => handleUseExistingPromo(p.promo_code)}
                                                    className="w-full flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/20 transition-all group"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <GiftIcon className="w-4 h-4 text-purple-500" />
                                                        <span className="text-sm font-black text-purple-700 dark:text-purple-300">{p.promo_code}</span>
                                                    </div>
                                                    <span className="text-xs font-bold text-purple-500">-Rp {parseInt(p.cashback_value).toLocaleString()}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    <AnimatePresence>
                                        {promoError && (
                                            <motion.p
                                                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                                className="text-[10px] text-red-500 font-bold uppercase tracking-widest ml-1"
                                            >
                                                {promoError}
                                            </motion.p>
                                        )}
                                        {discountInfo && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                                                className="flex items-center justify-between p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <CheckIcon className="h-4 w-4 text-emerald-500" />
                                                    <span className="text-xs font-black text-emerald-600 uppercase tracking-widest">{discountInfo.promo_code} AKTIF</span>
                                                </div>
                                                <span className="text-xs font-black text-emerald-600">
                                                    -RP {discountInfo.discount_amount?.toLocaleString()}
                                                </span>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Price Summary */}
                                <div className="space-y-3 pt-4 border-t border-slate-50 dark:border-white/5">
                                    <div className="flex justify-between items-center text-sm font-bold text-slate-500">
                                        <span>HARGA NORMAL</span>
                                        <span>RP {parseInt(currentPrice).toLocaleString()}</span>
                                    </div>
                                    {discountInfo && (
                                        <div className="flex justify-between items-center text-sm font-bold text-emerald-500">
                                            <span>POTONGAN</span>
                                            <span>-RP {discountInfo.discount_amount?.toLocaleString()}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-end pt-2">
                                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">TOTAL</span>
                                        <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
                                            RP {parseInt(finalPrice).toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={handleUpgrade}
                                    disabled={isUpgrading}
                                    className="w-full flex items-center justify-center gap-3 py-5 bg-slate-900 dark:bg-white text-white dark:text-black rounded-[2rem] font-black text-lg shadow-2xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-all active:scale-[0.97] group"
                                >
                                    <CreditCardIcon className="h-6 w-6 group-hover:rotate-12 transition-transform" />
                                    <span>{isUpgrading ? 'Memproses...' : 'Bayar & Langganan'}</span>
                                </button>

                                <p className="text-[10px] text-slate-400 text-center font-bold uppercase tracking-widest">
                                    MIDTRANS SECURE CHECKOUT • NO AUTO-RENEW
                                </p>
                            </motion.div>
                        )}
                    </motion.div>

                    {/* Right: XP Redemption + Features */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="space-y-8"
                    >
                        {/* XP Redeem */}
                        <XPRedeemSection xpInfo={localXpInfo} onRedeemed={handleXPRedeemed} />

                        {/* Premium Features */}
                        <div className="apple-glass rounded-[2rem] p-8">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                <ShieldCheckIcon className="w-4 h-4 text-blue-500" />
                                Premium Privileges
                            </h3>
                            <div className="space-y-4">
                                {features.map(({ icon: Icon, text }, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 + i * 0.08 }}
                                        className="flex items-center gap-4 group"
                                    >
                                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <Icon className="w-5 h-5 text-blue-500" />
                                        </div>
                                        <span className="font-semibold text-slate-700 dark:text-slate-300 text-sm">{text}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Social Proof / Trust */}
                        <div className="text-center py-6">
                            <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-widest">
                                Bergabung dengan produktivitas squad 🚀
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
