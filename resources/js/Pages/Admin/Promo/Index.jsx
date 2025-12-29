import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AdminLayout';
import {
    PlusIcon,
    TicketIcon,
    TrashIcon,
    PencilSquareIcon,
    CheckCircleIcon,
    XCircleIcon,
    CalendarIcon,
    UserGroupIcon
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

const PromoIndex = ({ promos }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [editingPromo, setEditingPromo] = useState(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        code: '',
        discount_type: 'percentage',
        discount_value: '',
        is_active: true,
        expires_at: '',
        usage_limit: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingPromo) {
            put(route('admin.promos.update', editingPromo.id), {
                onSuccess: () => {
                    reset();
                    setEditingPromo(null);
                    setIsAdding(false);
                }
            });
        } else {
            post(route('admin.promos.store'), {
                onSuccess: () => {
                    reset();
                    setIsAdding(false);
                }
            });
        }
    };

    const handleEdit = (promo) => {
        setEditingPromo(promo);
        setData({
            code: promo.code,
            discount_type: promo.discount_type,
            discount_value: promo.discount_value,
            is_active: promo.is_active,
            expires_at: promo.expires_at ? promo.expires_at.split('T')[0] : '',
            usage_limit: promo.usage_limit || '',
        });
        setIsAdding(true);
    };

    const handleDelete = (promo) => {
        if (confirm(`Hapus promo "${promo.code}"?`)) {
            router.delete(route('admin.promos.destroy', promo.id));
        }
    };

    const handleToggle = (promo) => {
        router.patch(route('admin.promos.toggle-status', promo.id));
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-slate-800 dark:text-neutral-200 leading-tight">Kelola Promo</h2>}
        >
            <Head title="Admin - Kelola Promo" />

            <div className="py-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Daftar Promo</h1>
                        <p className="text-slate-500 dark:text-slate-400">Buat dan kelola kode diskon untuk user.</p>
                    </div>
                    <button
                        onClick={() => {
                            setIsAdding(!isAdding);
                            setEditingPromo(null);
                            reset();
                        }}
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-all shadow-lg active:scale-95"
                    >
                        <PlusIcon className="h-5 w-5" />
                        {isAdding ? 'Batal' : 'Tambah Promo'}
                    </button>
                </div>

                {/* Form Tambah/Edit */}
                {isAdding && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6 mb-8"
                    >
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Kode Promo</label>
                                <input
                                    type="text"
                                    value={data.code}
                                    onChange={e => setData('code', e.target.value.toUpperCase())}
                                    placeholder="CONTOH: PROMO10"
                                    className="w-full bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-emerald-500 focus:border-emerald-500"
                                />
                                {errors.code && <p className="text-xs text-red-500">{errors.code}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Tipe Diskon</label>
                                <select
                                    value={data.discount_type}
                                    onChange={e => setData('discount_type', e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-xl"
                                >
                                    <option value="percentage">Persentase (%)</option>
                                    <option value="fixed">Nominal Tetap (Rp)</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Nilai Diskon</label>
                                <input
                                    type="number"
                                    value={data.discount_value}
                                    onChange={e => setData('discount_value', e.target.value)}
                                    placeholder={data.discount_type === 'percentage' ? "10 (%)" : "50000 (Rp)"}
                                    className="w-full bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-xl"
                                />
                                {errors.discount_value && <p className="text-xs text-red-500">{errors.discount_value}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Batas Penggunaan</label>
                                <input
                                    type="number"
                                    value={data.usage_limit}
                                    onChange={e => setData('usage_limit', e.target.value)}
                                    placeholder="Kosongkan jika tidak terbatas"
                                    className="w-full bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-xl"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Tanggal Kadaluarsa</label>
                                <input
                                    type="date"
                                    value={data.expires_at}
                                    onChange={e => setData('expires_at', e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-xl"
                                />
                            </div>

                            <div className="flex items-end pb-1">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={data.is_active}
                                        onChange={e => setData('is_active', e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 dark:peer-focus:ring-emerald-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:width-5 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-600"></div>
                                    <span className="ml-3 text-sm font-medium text-slate-700 dark:text-slate-300">Aktif</span>
                                </label>
                            </div>

                            <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                                <button
                                    type="button"
                                    onClick={() => { setIsAdding(false); setEditingPromo(null); reset(); }}
                                    className="px-6 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-8 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-lg shadow-emerald-600/20"
                                >
                                    {editingPromo ? 'Simpan Perubahan' : 'Simpan Promo'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}

                {/* Grid List Promo */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {promos.map(promo => (
                        <div key={promo.id} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl text-emerald-600 outline outline-4 outline-emerald-50/50 dark:outline-emerald-900/10 transition-all group-hover:outline-emerald-500/10">
                                    <TicketIcon className="h-6 w-6" />
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleToggle(promo)}
                                        className={clsx(
                                            "p-2 rounded-lg transition-colors",
                                            promo.is_active ? "text-orange-500 hover:bg-orange-50" : "text-emerald-500 hover:bg-emerald-50"
                                        )}
                                        title={promo.is_active ? "Nonaktifkan" : "Aktifkan"}
                                    >
                                        {promo.is_active ? <XCircleIcon className="h-5 w-5" /> : <CheckCircleIcon className="h-5 w-5" />}
                                    </button>
                                    <button
                                        onClick={() => handleEdit(promo)}
                                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Edit"
                                    >
                                        <PencilSquareIcon className="h-5 w-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(promo)}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Hapus"
                                    >
                                        <TrashIcon className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1 tracking-wider uppercase font-mono">
                                        {promo.code}
                                    </h3>
                                    <p className="text-2xl font-black text-emerald-600">
                                        {promo.discount_type === 'percentage' ? `${promo.discount_value}% OFF` : `Rp ${promo.discount_value.toLocaleString()} OFF`}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-3 text-xs font-medium text-slate-500 dark:text-slate-400">
                                    <div className="flex items-center gap-1.5 p-2 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                                        <UserGroupIcon className="h-4 w-4" />
                                        <span>{promo.usage_count} / {promo.usage_limit || '∞'}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 p-2 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                                        <CalendarIcon className="h-4 w-4" />
                                        <span>{promo.expires_at ? new Date(promo.expires_at).toLocaleDateString() : 'No Limit'}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className={clsx(
                                        "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                                        promo.is_active
                                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                            : "bg-slate-100 text-slate-600 dark:bg-slate-700/50 dark:text-slate-400"
                                    )}>
                                        {promo.is_active ? 'Status: Active' : 'Status: Paused'}
                                    </span>
                                    {promo.expires_at && new Date(promo.expires_at) < new Date() && (
                                        <span className="px-2.5 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                            Expired
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {promos.length === 0 && (
                    <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
                        <TicketIcon className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-slate-900 dark:text-white">Belum ada promo</h3>
                        <p className="text-slate-500">Klik "Tambah Promo" untuk membuat kode diskon pertama.</p>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
};

export default PromoIndex;
