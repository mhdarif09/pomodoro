import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, TicketIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/solid';
import { useForm } from '@inertiajs/react';
import axios from 'axios';

const CashbackRedemptionModal = ({ isOpen, onClose, pointsBalance, onRedeemSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [redeemedData, setRedeemedData] = useState(null);
    const [error, setError] = useState(null);
    const [amountToRedeem, setAmountToRedeem] = useState(1000);

    const handleRedeem = async () => {
        if (amountToRedeem < 1000) {
            setError("Minimum penukaran 1000 poin.");
            return;
        }
        if (amountToRedeem > pointsBalance) {
            setError("Poin tidak cukup.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await axios.post(route('api.cashback.redeem'), {
                points: parseInt(amountToRedeem)
            });

            if (response.data.success) {
                setRedeemedData(response.data.data);
                if (onRedeemSuccess) onRedeemSuccess(response.data.data.remaining_points);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Gagal menukar poin.");
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        alert("Kode disalin!");
    };

    const handleClose = () => {
        setRedeemedData(null);
        setAmountToRedeem(1000);
        setError(null);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4"
                    >
                        <div className="w-full max-w-md bg-white dark:bg-[#1C1C1E] rounded-[2rem] shadow-2xl p-6 pointer-events-auto border border-white/20 relative">
                            <button onClick={handleClose} className="absolute top-4 right-4 p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200">
                                <XMarkIcon className="w-5 h-5 text-slate-500" />
                            </button>

                            {!redeemedData ? (
                                <>
                                    <div className="text-center mb-6">
                                        <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-orange-500/20">
                                            <TicketIcon className="w-8 h-8 text-white" />
                                        </div>
                                        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Tukar Poin</h2>
                                        <p className="text-slate-500 dark:text-slate-400">
                                            Saldo Poin: <span className="font-bold text-orange-500">{pointsBalance?.toLocaleString()}</span>
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                                Jumlah Poin (1 Poin = Rp 1)
                                            </label>
                                            <input
                                                type="number"
                                                value={amountToRedeem}
                                                onChange={(e) => setAmountToRedeem(e.target.value)}
                                                min="1000"
                                                step="100"
                                                className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl border-dashed border-2 border-slate-300 dark:border-slate-700 p-3 text-center text-2xl font-black text-slate-900 dark:text-white focus:border-emerald-500 focus:ring-0"
                                            />
                                            <p className="text-xs text-center text-slate-500 mt-2">
                                                Minimal 1,000 poin. Maksimal sesuai saldo.
                                            </p>
                                        </div>

                                        {error && (
                                            <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-bold text-center border border-red-100">
                                                {error}
                                            </div>
                                        )}

                                        <button
                                            onClick={handleRedeem}
                                            disabled={loading || amountToRedeem < 1000 || amountToRedeem > pointsBalance}
                                            className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold shadow-lg shadow-orange-500/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {loading ? 'Memproses...' : 'Tukar Sekarang'}
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/20">
                                        <ClipboardDocumentCheckIcon className="w-8 h-8 text-white" />
                                    </div>
                                    <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Berhasil!</h2>
                                    <p className="text-slate-500 dark:text-slate-400 mb-6">
                                        Poin berhasil ditukar menjadi promo code.
                                    </p>

                                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 mb-6 relative group cursor-pointer" onClick={() => copyToClipboard(redeemedData.promo_code)}>
                                        <div className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">Kode Promo</div>
                                        <div className="text-2xl font-black text-slate-900 dark:text-white tracking-widest font-mono">
                                            {redeemedData.promo_code}
                                        </div>
                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="text-xs bg-black/70 text-white px-2 py-1 rounded">Klik salin</span>
                                        </div>
                                    </div>

                                    <div className="text-sm text-slate-600 dark:text-slate-400 mb-6 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-100 dark:border-yellow-700/30">
                                        Gunakan kode ini saat berlangganan untuk mendapatkan diskon sebesar <span className="font-bold">Rp {parseInt(redeemedData.value).toLocaleString()}</span>
                                    </div>

                                    <button
                                        onClick={handleClose}
                                        className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300 rounded-xl font-bold transition-colors"
                                    >
                                        Tutup
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default CashbackRedemptionModal;
