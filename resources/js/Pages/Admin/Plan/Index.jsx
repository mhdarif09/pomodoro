import React, { useState } from 'react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { Head, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AdminLayout';
import {
    PlusIcon,
    CheckIcon,
    XMarkIcon,
    PencilSquareIcon,
    TrashIcon,
    CircleStackIcon,
    EyeIcon,
    EyeSlashIcon,
    SparklesIcon,
    ChartBarIcon,
    BookOpenIcon,
    TrophyIcon
} from '@heroicons/react/24/solid';

// --- Helper UI Components ---
const Input = ({ className = '', ...props }) => (
    <input
        {...props}
        className={`block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-white/5 dark:text-white dark:ring-white/10 dark:focus:ring-blue-500 transition-all duration-150 ${className}`}
    />
);

const Textarea = ({ className = '', ...props }) => (
    <textarea
        {...props}
        className={`block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-white/5 dark:text-white dark:ring-white/10 dark:focus:ring-blue-500 transition-all duration-150 ${className}`}
    />
);

const Select = ({ className = '', children, ...props }) => (
    <select
        {...props}
        className={`block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-white/5 dark:text-white dark:ring-white/10 dark:focus:ring-blue-500 transition-all duration-150 ${className}`}
    >
        {children}
    </select>
);

const Button = ({ className = '', disabled, children, ...props }) => (
    <button
        {...props}
        disabled={disabled}
        className={`inline-flex items-center justify-center gap-x-1.5 rounded-md px-3.5 py-2 text-sm font-semibold shadow-sm transition-all duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${disabled ? 'opacity-60 cursor-not-allowed' : ''} ${className}`}
    >
        {children}
    </button>
);

const IconButton = ({ className = '', disabled, children, ...props }) => (
    <button
        {...props}
        type="button"
        disabled={disabled}
        className={`inline-flex items-center justify-center p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-all duration-150 ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
        {children}
    </button>
);

// --- Features Input Component ---
const FeaturesInput = ({ features = [], onChange }) => {
    const [newFeature, setNewFeature] = useState('');

    const addFeature = () => {
        if (newFeature.trim() && !features.includes(newFeature.trim())) {
            onChange([...features, newFeature.trim()]);
            setNewFeature('');
        }
    };

    const removeFeature = (index) => {
        const updatedFeatures = features.filter((_, i) => i !== index);
        onChange(updatedFeatures);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addFeature();
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <CheckIcon className="h-4 w-4 text-emerald-500" />
                    </div>
                    <Input
                        type="text"
                        value={newFeature}
                        onChange={(e) => setNewFeature(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Contoh: Akses Video Eksklusif"
                        className="pl-9"
                    />
                </div>
                <Button
                    type="button"
                    onClick={addFeature}
                    className="bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-500/20"
                >
                    <PlusIcon className="h-4 w-4" />
                </Button>
            </div>

            <div className="flex flex-wrap gap-2 min-h-[40px] p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                {features.length === 0 && <p className="text-xs text-slate-400 italic mx-auto">Belum ada fitur marketing yang ditambahkan.</p>}
                {features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-1.5 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm animate-in fade-in zoom-in-95">
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{feature}</span>
                        <button
                            type="button"
                            onClick={() => removeFeature(index)}
                            className="text-slate-400 hover:text-red-500 transition-colors"
                        >
                            <XMarkIcon className="h-3 w-3" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};
// --- Plan Item Component ---
const PlanItem = ({ plan }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const { data, setData, put, patch, delete: destroy, processing, errors, reset } = useForm({
        name: plan.name || '',
        price: plan.price || '',
        duration: plan.duration || 'monthly',
        description: plan.description || '',
        features: plan.features || [],
        is_active: plan.is_active ?? true,
        max_subtasks: plan.max_subtasks || 3,
        has_ai_assistant: plan.has_ai_assistant ?? false,
        ai_chat_limit: plan.ai_chat_limit ?? 0,
        has_productivity_report: plan.has_productivity_report ?? false,
        has_auto_open_url: plan.has_auto_open_url ?? false,
        has_quick_notes: plan.has_quick_notes ?? false,
        max_guild_members: plan.max_guild_members || 10,
        has_ai_guild_features: plan.has_ai_guild_features ?? false,
        has_journal_access: plan.has_journal_access ?? true,
        has_learning_hub_access: plan.has_learning_hub_access ?? true,
        has_gamification_access: plan.has_gamification_access ?? true,
        has_ai_genius_access: plan.has_ai_genius_access ?? false,
    });

    // Update form data when plan prop changes (e.g. after toggle status)
    React.useEffect(() => {
        setData({
            name: plan.name || '',
            price: plan.price || '',
            duration: plan.duration || 'monthly',
            description: plan.description || '',
            features: plan.features || [],
            is_active: plan.is_active ?? true,
            max_subtasks: plan.max_subtasks || 3,
            has_ai_assistant: plan.has_ai_assistant ?? false,
            ai_chat_limit: plan.ai_chat_limit ?? 0,
            has_productivity_report: plan.has_productivity_report ?? false,
            has_auto_open_url: plan.has_auto_open_url ?? false,
            has_quick_notes: plan.has_quick_notes ?? false,
            max_guild_members: plan.max_guild_members || 10,
            has_ai_guild_features: plan.has_ai_guild_features ?? false,
            has_journal_access: plan.has_journal_access ?? true,
            has_learning_hub_access: plan.has_learning_hub_access ?? true,
            has_gamification_access: plan.has_gamification_access ?? true,
            has_ai_genius_access: plan.has_ai_genius_access ?? false,
        });
    }, [plan]);

    const handleUpdate = (e) => {
        e.preventDefault();
        put(route('admin.plans.update', plan.id), {
            onSuccess: () => setIsEditing(false),
            preserveScroll: true,
        });
    };

    const handleDelete = () => {
        if (confirm(`Yakin ingin menghapus plan "${plan.name}"?`)) {
            setIsLoading(true);
            router.delete(route('admin.plans.destroy', plan.id), {
                preserveScroll: true,
                onFinish: () => setIsLoading(false),
                onError: (errors) => {
                    console.error('Delete error:', errors);
                    setIsLoading(false);
                }
            });
        }
    };

    const handleToggleStatus = () => {
        const action = plan.is_active ? 'menonaktifkan' : 'mengaktifkan';
        if (confirm(`Yakin ingin ${action} plan "${plan.name}"?`)) {
            setIsLoading(true);
            router.patch(route('admin.plans.toggle-status', plan.id), {}, {
                preserveScroll: true,
                onFinish: () => setIsLoading(false),
            });
        }
    };

    const handleCancel = () => {
        reset();
        setIsEditing(false);
    };

    const handleFeaturesChange = (newFeatures) => {
        setData('features', newFeatures);
    };

    if (isEditing) {
        return (
            <form onSubmit={handleUpdate} className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] space-y-8 shadow-2xl border border-blue-500/20 animate-in fade-in slide-in-from-top-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Basic Info */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
                            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Data Utama</h3>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                                    Identitas Plan
                                </label>
                                <Input
                                    type="text"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    placeholder="Contoh: Premium Monthly"
                                    className="rounded-xl"
                                    required
                                />
                                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                                        Harga (IDR)
                                    </label>
                                    <Input
                                        type="number"
                                        value={data.price}
                                        onChange={e => setData('price', e.target.value)}
                                        placeholder="Contoh: 99000"
                                        className="rounded-xl"
                                        min="0"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                                        Siklus Tagihan
                                    </label>
                                    <Select value={data.duration} onChange={e => setData('duration', e.target.value)} className="rounded-xl">
                                        <option value="monthly">Bulanan</option>
                                        <option value="yearly">Tahunan</option>
                                    </Select>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight">Status Aktif</span>
                                <button
                                    type="button"
                                    onClick={() => setData('is_active', !data.is_active)}
                                    className={clsx(
                                        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ring-offset-2 ring-2 ring-transparent",
                                        data.is_active ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                                    )}
                                >
                                    <span className={clsx(
                                        "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                                        data.is_active ? 'translate-x-5' : 'translate-x-0'
                                    )} />
                                </button>
                            </div>

                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                                    Limit Subtasks per Tugas
                                </label>
                                <Input
                                    type="number"
                                    value={data.max_subtasks}
                                    onChange={e => setData('max_subtasks', e.target.value)}
                                    className="rounded-xl"
                                    min="0"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Premium Features Checklist */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Hak Akses Premium</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-1 gap-3">
                                {[
                                    { key: 'has_ai_assistant', label: 'AI Assistant', icon: SparklesIcon, desc: 'Akses ke chat AI cerdas' },
                                    { key: 'has_productivity_report', label: 'Productivity Report', icon: ChartBarIcon, desc: 'Laporan perkembangan mingguan' },
                                    { key: 'has_auto_open_url', label: 'Auto-open URL', icon: EyeIcon, desc: 'Otomatis buka link saat fokus' },
                                    { key: 'has_quick_notes', label: 'Quick Notes', icon: PencilSquareIcon, desc: 'Catatan cepat di panel fokus' },
                                ].map((feat) => (
                                    <div
                                        key={feat.key}
                                        onClick={() => setData(feat.key, !data[feat.key])}
                                        className={clsx(
                                            "flex items-start gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer",
                                            data[feat.key]
                                                ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/20"
                                                : "border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700"
                                        )}
                                    >
                                        <div className={clsx(
                                            "p-2 rounded-xl shrink-0",
                                            data[feat.key] ? "bg-emerald-500 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-400"
                                        )}>
                                            <feat.icon className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between">
                                                <span className="font-bold text-slate-900 dark:text-white">{feat.label}</span>
                                                {data[feat.key] && <CheckIcon className="h-5 w-5 text-emerald-500" />}
                                            </div>
                                            <p className="text-xs text-slate-500 mt-0.5">{feat.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {data.has_ai_assistant && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800">
                                    <label className="block text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1.5 ml-1">
                                        Kuota Chat Harian (-1: Unlimited)
                                    </label>
                                    <Input
                                        type="number"
                                        value={data.ai_chat_limit}
                                        onChange={e => setData('ai_chat_limit', e.target.value)}
                                        className="h-9 text-sm rounded-xl"
                                        min="-1"
                                    />
                                </motion.div>
                            )}
                        </div>

                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Guild & Personal Features</h3>
                            </div>

                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                                    Max Guild Members
                                </label>
                                <Input
                                    type="number"
                                    value={data.max_guild_members}
                                    onChange={e => setData('max_guild_members', e.target.value)}
                                    className="rounded-xl"
                                    min="0"
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                                {[
                                    { key: 'has_ai_guild_features', label: 'AI Guild Features', icon: SparklesIcon, desc: 'Akses fitur AI untuk Guild' },
                                    { key: 'has_journal_access', label: 'Journal Access', icon: PencilSquareIcon, desc: 'Akses menu Journal' },
                                    { key: 'has_learning_hub_access', label: 'Learning Hub', icon: BookOpenIcon, desc: 'Akses menu Learning Hub' },
                                    { key: 'has_gamification_access', label: 'Gamification', icon: TrophyIcon, desc: 'Akses fitur Gamification' },
                                    { key: 'has_ai_genius_access', label: 'AI Genius Access', icon: SparklesIcon, desc: 'Akses fitur AI Genius' },
                                ].map((feat) => (
                                    <div
                                        key={feat.key}
                                        onClick={() => setData(feat.key, !data[feat.key])}
                                        className={clsx(
                                            "flex items-start gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer",
                                            data[feat.key]
                                                ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/20"
                                                : "border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700"
                                        )}
                                    >
                                        <div className={clsx(
                                            "p-2 rounded-xl shrink-0",
                                            data[feat.key] ? "bg-emerald-500 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-400"
                                        )}>
                                            <feat.icon className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between">
                                                <span className="font-bold text-slate-900 dark:text-white">{feat.label}</span>
                                                {data[feat.key] && <CheckIcon className="h-5 w-5 text-emerald-500" />}
                                            </div>
                                            <p className="text-xs text-slate-500 mt-0.5">{feat.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">
                                Marketing Features (Informasi List)
                            </label>
                            <FeaturesInput
                                features={data.features}
                                onChange={handleFeaturesChange}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-end items-center gap-4 pt-8 border-t border-slate-100 dark:border-slate-800">
                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={processing || isLoading}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 text-red-600 font-bold hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all"
                    >
                        <TrashIcon className="h-5 w-5" /> Hapus Plan Selamanya
                    </button>
                    <div className="flex w-full sm:w-auto gap-3">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="flex-1 sm:flex-none px-8 py-3 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white rounded-2xl font-bold active:scale-95 transition-all"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex-1 sm:flex-none px-12 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black shadow-xl shadow-blue-500/20 active:scale-95 transition-all"
                        >
                            {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </button>
                    </div>
                </div>
            </form>
        );
    }

    return (
        <div className="flex items-center justify-between p-6 rounded-lg bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150 shadow-sm ring-1 ring-gray-900/5 dark:ring-white/10">
            <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                    <p className="font-semibold text-gray-900 dark:text-white">{plan.name}</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${plan.is_active
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                        }`}>
                        {plan.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Rp {plan.price?.toLocaleString('id-ID')} / {plan.duration === 'monthly' ? 'bulan' : 'tahun'}
                </p>

                {plan.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-500 mb-2">{plan.description}</p>
                )}

                {plan.features && plan.features.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                        {plan.features.slice(0, 3).map((feature, index) => (
                            <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                            >
                                {feature}
                            </span>
                        ))}
                        {plan.features.length > 3 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                                +{plan.features.length - 3} lebih
                            </span>
                        )}
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                            Limit: {plan.max_subtasks} Subtasks
                        </span>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-1">
                <IconButton
                    onClick={handleToggleStatus}
                    disabled={isLoading}
                    className={plan.is_active ? 'hover:text-orange-600 dark:hover:text-orange-400' : 'hover:text-green-600 dark:hover:text-green-400'}
                    title={plan.is_active ? 'Nonaktifkan plan' : 'Aktifkan plan'}
                >
                    {plan.is_active ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </IconButton>
                <IconButton
                    onClick={() => setIsEditing(true)}
                    disabled={isLoading}
                    className="hover:text-blue-600 dark:hover:text-blue-400"
                    title="Edit plan"
                >
                    <PencilSquareIcon className="h-5 w-5" />
                </IconButton>
                <IconButton
                    onClick={handleDelete}
                    disabled={isLoading}
                    className="hover:text-red-600 dark:hover:text-red-400"
                    title="Hapus plan"
                >
                    <TrashIcon className="h-5 w-5" />
                </IconButton>
            </div>
        </div>
    );
};

// --- Main Component ---
export default function Index({ auth, plans }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        price: '',
        duration: 'monthly',
        description: '',
        features: [],
        is_active: true,
        max_subtasks: 3,
        has_ai_assistant: false,
        ai_chat_limit: 0,
        has_productivity_report: false,
        has_auto_open_url: false,
        has_quick_notes: false,
        max_guild_members: 10,
        has_ai_guild_features: false,
        has_journal_access: true,
        has_learning_hub_access: true,
        has_gamification_access: true,
        has_ai_genius_access: false,
    });

    const handleFeaturesChange = (newFeatures) => {
        setData('features', newFeatures);
    };

    const handleCreate = (e) => {
        e.preventDefault();
        post(route('admin.plans.store'), {
            onSuccess: () => reset(),
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Kelola Plan Premium" />

            <main className="p-4 sm:p-6 lg:p-8 bg-gray-100 dark:bg-gray-900 min-h-screen">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <header className="mb-8">
                        <div className="flex items-center gap-x-3">
                            <CircleStackIcon className="h-8 w-8 text-blue-500" aria-hidden="true" />
                            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Kelola Paket Premium</h1>
                        </div>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            Kelola paket langganan premium untuk aplikasi. User akan melihat plan yang berstatus "Aktif".
                        </p>
                    </header>

                    {/* Create Form */}
                    <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl p-10 mb-12 border border-slate-200 dark:border-slate-700 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <PlusIcon className="h-32 w-32 text-blue-500" />
                        </div>

                        <div className="relative">
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">Tambah Plan Baru</h2>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">Definisikan paket premium baru untuk ekosistem Sarang Tumbuh.</p>

                            <form onSubmit={handleCreate} className="space-y-10">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                    {/* Basic Info */}
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
                                            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Data Utama</h3>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Nama Plan *</label>
                                                <Input
                                                    id="name"
                                                    type="text"
                                                    value={data.name}
                                                    onChange={(e) => setData('name', e.target.value)}
                                                    placeholder="Contoh: Premium Monthly"
                                                    className="rounded-xl"
                                                    required
                                                />
                                                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Harga (IDR) *</label>
                                                    <Input
                                                        id="price"
                                                        type="number"
                                                        value={data.price}
                                                        onChange={(e) => setData('price', e.target.value)}
                                                        placeholder="Contoh: 99000"
                                                        className="rounded-xl"
                                                        min="0"
                                                        required
                                                    />
                                                    {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Siklus *</label>
                                                    <Select
                                                        id="duration"
                                                        value={data.duration}
                                                        onChange={(e) => setData('duration', e.target.value)}
                                                        className="rounded-xl"
                                                    >
                                                        <option value="monthly">Bulanan</option>
                                                        <option value="yearly">Tahunan</option>
                                                    </Select>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight">Aktifkan Sekarang</span>
                                                <button
                                                    type="button"
                                                    onClick={() => setData('is_active', !data.is_active)}
                                                    className={clsx(
                                                        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ring-offset-2 ring-2 ring-transparent",
                                                        data.is_active ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                                                    )}
                                                >
                                                    <span className={clsx(
                                                        "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                                                        data.is_active ? 'translate-x-5' : 'translate-x-0'
                                                    )} />
                                                </button>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Limit Subtasks *</label>
                                                <Input
                                                    id="max_subtasks"
                                                    type="number"
                                                    value={data.max_subtasks}
                                                    onChange={(e) => setData('max_subtasks', e.target.value)}
                                                    placeholder="Contoh: 10"
                                                    className="rounded-xl"
                                                    min="0"
                                                    required
                                                />
                                                {errors.max_subtasks && <p className="text-red-500 text-xs mt-1">{errors.max_subtasks}</p>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Premium Features */}
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                                            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Hak Akses Premium</h3>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="grid grid-cols-1 gap-3">
                                                {[
                                                    { key: 'has_ai_assistant', label: 'AI Assistant', icon: SparklesIcon, desc: 'Akses ke chat AI cerdas' },
                                                    { key: 'has_productivity_report', label: 'Productivity Report', icon: ChartBarIcon, desc: 'Laporan perkembangan mingguan' },
                                                    { key: 'has_auto_open_url', label: 'Auto-open URL', icon: EyeIcon, desc: 'Otomatis buka link saat fokus' },
                                                    { key: 'has_quick_notes', label: 'Quick Notes', icon: PencilSquareIcon, desc: 'Catatan cepat di panel fokus' },
                                                ].map((feat) => (
                                                    <div
                                                        key={feat.key}
                                                        onClick={() => setData(feat.key, !data[feat.key])}
                                                        className={clsx(
                                                            "flex items-start gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer",
                                                            data[feat.key]
                                                                ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/20"
                                                                : "border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700"
                                                        )}
                                                    >
                                                        <div className={clsx(
                                                            "p-2 rounded-xl shrink-0",
                                                            data[feat.key] ? "bg-emerald-500 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-400"
                                                        )}>
                                                            <feat.icon className="h-5 w-5" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex justify-between">
                                                                <span className="font-bold text-slate-900 dark:text-white">{feat.label}</span>
                                                                {data[feat.key] && <CheckIcon className="h-5 w-5 text-emerald-500" />}
                                                            </div>
                                                            <p className="text-xs text-slate-500 mt-0.5">{feat.desc}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {data.has_ai_assistant && (
                                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800">
                                                    <label className="block text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1.5 ml-1">Kuota Chat Harian (-1: Unlimited)</label>
                                                    <Input
                                                        type="number"
                                                        value={data.ai_chat_limit}
                                                        onChange={e => setData('ai_chat_limit', e.target.value)}
                                                        className="h-9 text-sm rounded-xl"
                                                        min="-1"
                                                    />
                                                </motion.div>
                                            )}
                                        </div>

                                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                                                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Guild & Personal Features</h3>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                                                    Max Guild Members
                                                </label>
                                                <Input
                                                    type="number"
                                                    value={data.max_guild_members}
                                                    onChange={e => setData('max_guild_members', e.target.value)}
                                                    className="rounded-xl"
                                                    min="0"
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 gap-3">
                                                {[
                                                    { key: 'has_ai_guild_features', label: 'AI Guild Features', icon: SparklesIcon, desc: 'Akses fitur AI untuk Guild' },
                                                    { key: 'has_journal_access', label: 'Journal Access', icon: PencilSquareIcon, desc: 'Akses menu Journal' },
                                                    { key: 'has_learning_hub_access', label: 'Learning Hub', icon: BookOpenIcon, desc: 'Akses menu Learning Hub' },
                                                    { key: 'has_gamification_access', label: 'Gamification', icon: TrophyIcon, desc: 'Akses fitur Gamification' },
                                                    { key: 'has_ai_genius_access', label: 'AI Genius Access', icon: SparklesIcon, desc: 'Akses fitur AI Genius' },
                                                ].map((feat) => (
                                                    <div
                                                        key={feat.key}
                                                        onClick={() => setData(feat.key, !data[feat.key])}
                                                        className={clsx(
                                                            "flex items-start gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer",
                                                            data[feat.key]
                                                                ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/20"
                                                                : "border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700"
                                                        )}
                                                    >
                                                        <div className={clsx(
                                                            "p-2 rounded-xl shrink-0",
                                                            data[feat.key] ? "bg-emerald-500 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-400"
                                                        )}>
                                                            <feat.icon className="h-5 w-5" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex justify-between">
                                                                <span className="font-bold text-slate-900 dark:text-white">{feat.label}</span>
                                                                {data[feat.key] && <CheckIcon className="h-5 w-5 text-emerald-500" />}
                                                            </div>
                                                            <p className="text-xs text-slate-500 mt-0.5">{feat.desc}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Marketing Features (Informasi List)</label>
                                            <FeaturesInput
                                                features={data.features}
                                                onChange={handleFeaturesChange}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-8 border-t border-slate-100 dark:border-slate-800">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full sm:w-auto px-12 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black shadow-2xl shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-3"
                                    >
                                        <PlusIcon className="h-6 w-6" />
                                        {processing ? 'Menambahkan...' : 'Simpan Plan Premium'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Plans List */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Daftar Plan ({plans.length})
                            </h2>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                {plans.filter(p => p.is_active).length} aktif, {plans.filter(p => !p.is_active).length} nonaktif
                            </div>
                        </div>

                        {plans.length > 0 ? (
                            plans.map((plan) => <PlanItem key={plan.id} plan={plan} />)
                        ) : (
                            <div className="text-center py-16 px-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                                <p className="text-gray-500 dark:text-gray-400">Belum ada plan yang dibuat.</p>
                                <p className="text-sm mt-2 text-gray-400 dark:text-gray-500">
                                    Gunakan form di atas untuk menambahkan plan pertama Anda.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </AuthenticatedLayout>
    );
}