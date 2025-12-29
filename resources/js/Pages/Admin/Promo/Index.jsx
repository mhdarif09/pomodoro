import { Head, useForm, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
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
            header={<h2 className="font-bold text-xl text-slate-800 dark:text-neutral-200 leading-tight">💎 Dashboard Elit Admin</h2>}
        >
            <Head title="Admin - Kelola Promo" />

            <div className="py-8 max-w-7xl mx-auto space-y-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-700">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Pusat Kupon & Promo</h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">Buat momen spesial dengan kode diskon eksklusif untuk para fokus-mania.</p>
                    </div>
                    <button
                        onClick={() => {
                            setIsAdding(!isAdding);
                            setEditingPromo(null);
                            reset();
                        }}
                        className="flex items-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-2xl font-black transition-all shadow-xl shadow-emerald-500/20 active:scale-95 group"
                    >
                        <PlusIcon className="h-6 w-6 group-hover:rotate-90 transition-transform" />
                        {isAdding ? 'Batalkan Aksi' : 'Ciptakan Promo Baru'}
                    </button>
                </div>

                {/* Form Tambah/Edit */}
                <AnimatePresence>
                    {isAdding && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -20 }}
                            className="bg-white dark:bg-slate-800 rounded-[3rem] shadow-2xl border-4 border-emerald-500/20 p-10 relative overflow-hidden"
                        >
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl" />

                            <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase mb-8 flex items-center gap-3">
                                <TicketIcon className="h-6 w-6 text-emerald-500" />
                                {editingPromo ? 'Modifikasi Promo' : 'Konfigurasi Promo Baru'}
                            </h2>

                            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Kode Identitas</label>
                                    <input
                                        type="text"
                                        value={data.code}
                                        onChange={e => setData('code', e.target.value.toUpperCase())}
                                        placeholder="CONTOH: FOKUS10"
                                        className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-2xl p-4 font-mono font-bold text-lg focus:border-emerald-500 outline-none transition-all placeholder:opacity-30"
                                    />
                                    {errors.code && <p className="text-xs text-red-500 ml-1 font-bold">{errors.code}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Arsitektur Diskon</label>
                                    <select
                                        value={data.discount_type}
                                        onChange={e => setData('discount_type', e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-2xl p-4 font-bold focus:border-emerald-500 outline-none transition-all"
                                    >
                                        <option value="percentage">Persentase Potongan (%)</option>
                                        <option value="fixed">Nominal Harga Mati (IDR)</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nilai Keuntungan</label>
                                    <input
                                        type="number"
                                        value={data.discount_value}
                                        onChange={e => setData('discount_value', e.target.value)}
                                        placeholder={data.discount_type === 'percentage' ? "0 - 100" : "Format: 50000"}
                                        className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-2xl p-4 font-bold focus:border-emerald-500 outline-none transition-all"
                                    />
                                    {errors.discount_value && <p className="text-xs text-red-500 ml-1 font-bold">{errors.discount_value}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Limitasi Penggunaan</label>
                                    <input
                                        type="number"
                                        value={data.usage_limit}
                                        onChange={e => setData('usage_limit', e.target.value)}
                                        placeholder="Tanpa Batas"
                                        className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-2xl p-4 font-bold focus:border-emerald-500 outline-none transition-all"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Masa Aktif</label>
                                    <input
                                        type="date"
                                        value={data.expires_at}
                                        onChange={e => setData('expires_at', e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-2xl p-4 font-bold focus:border-emerald-500 outline-none transition-all"
                                    />
                                </div>

                                <div className="flex items-end pb-2">
                                    <button
                                        type="button"
                                        onClick={() => setData('is_active', !data.is_active)}
                                        className={clsx(
                                            "flex items-center gap-3 w-full p-4 rounded-2xl border-2 transition-all font-bold",
                                            data.is_active ? "bg-emerald-50 border-emerald-500 text-emerald-700" : "bg-slate-50 border-slate-200 text-slate-400"
                                        )}
                                    >
                                        <div className={clsx("w-5 h-5 rounded-full border-4 transition-all", data.is_active ? "border-emerald-500 bg-emerald-500" : "border-slate-300")} />
                                        Status: {data.is_active ? 'PUBLIKASI' : 'DRAFT'}
                                    </button>
                                </div>

                                <div className="md:col-span-2 lg:col-span-3 flex justify-end gap-4 mt-4">
                                    <button
                                        type="button"
                                        onClick={() => { setIsAdding(false); setEditingPromo(null); reset(); }}
                                        className="px-10 py-4 font-bold text-slate-500 hover:text-slate-900 transition-colors"
                                    >
                                        Abaikan
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-12 py-4 bg-emerald-600 text-white rounded-2xl font-black shadow-2xl shadow-emerald-600/30 hover:bg-emerald-700 active:scale-95 transition-all disabled:opacity-50"
                                    >
                                        {processing ? 'Menyinkronkan...' : (editingPromo ? 'Perbarui Promo' : 'Ledakkan Promo!')}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Grid List Promo */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {promos.map(promo => (
                        <div key={promo.id} className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                                <TicketIcon className="h-24 w-24 text-emerald-500" />
                            </div>

                            <div className="flex justify-between items-start mb-6 relative">
                                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl text-emerald-600 shadow-inner">
                                    <TicketIcon className="h-8 w-8" />
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                                    <button
                                        onClick={() => handleToggle(promo)}
                                        className={clsx(
                                            "p-3 rounded-xl transition-all shadow-sm",
                                            promo.is_active ? "bg-orange-50 text-orange-600 hover:bg-orange-100" : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                                        )}
                                        title={promo.is_active ? "Jeda Promo" : "Aktifkan"}
                                    >
                                        {promo.is_active ? <XCircleIcon className="h-6 w-6" /> : <CheckCircleIcon className="h-6 w-6" />}
                                    </button>
                                    <button
                                        onClick={() => handleEdit(promo)}
                                        className="p-3 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl transition-all shadow-sm"
                                        title="Modifikasi"
                                    >
                                        <PencilSquareIcon className="h-6 w-6" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(promo)}
                                        className="p-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-all shadow-sm"
                                        title="Eliminasi"
                                    >
                                        <TrashIcon className="h-6 w-6" />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-6 relative">
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-1 tracking-widest uppercase font-mono">
                                        {promo.code}
                                    </h3>
                                    <p className="text-3xl font-black text-emerald-600">
                                        {promo.discount_type === 'percentage' ? `${promo.discount_value}% OFF` : `IDR ${promo.discount_value.toLocaleString()} OFF`}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                        <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Penggunaan</p>
                                        <div className="flex items-center gap-2">
                                            <UserGroupIcon className="h-4 w-4 text-blue-500" />
                                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{promo.usage_count} / {promo.usage_limit || '∞'}</span>
                                        </div>
                                    </div>
                                    <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                        <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Masa Berlaku</p>
                                        <div className="flex items-center gap-2">
                                            <CalendarIcon className="h-4 w-4 text-purple-500" />
                                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{promo.expires_at ? new Date(promo.expires_at).toLocaleDateString() : 'Abadi'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <span className={clsx(
                                        "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm",
                                        promo.is_active
                                            ? "bg-emerald-500 text-white"
                                            : "bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400"
                                    )}>
                                        {promo.is_active ? 'Status: Operasional' : 'Status: Terhenti'}
                                    </span>
                                    {promo.expires_at && new Date(promo.expires_at) < new Date() && (
                                        <span className="px-4 py-2 bg-red-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm animate-pulse">
                                            Kadaluarsa
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
