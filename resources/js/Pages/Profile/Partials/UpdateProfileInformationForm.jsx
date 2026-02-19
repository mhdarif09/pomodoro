import InputError from '@/Components/InputError';
import { useForm, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    UserIcon,
    EnvelopeIcon,
    ChatBubbleLeftRightIcon,
    ClockIcon,
    CheckIcon
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

export default function UpdateProfileInformation({ mustVerifyEmail, status, className = '' }) {
    const user = usePage().props.auth.user;

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        timezone: user.timezone || 'WIB',
    });

    const submit = (e) => {
        e.preventDefault();
        patch(route('profile.update'), {
            preserveScroll: true
        });
    };

    const InputGroup = ({ label, icon: Icon, children, error, description }) => (
        <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-4">
                {label}
            </label>
            <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <Icon className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                {children}
            </div>
            {description && (
                <p className="text-[10px] text-slate-400 dark:text-slate-500 ml-4 font-medium leading-relaxed">
                    {description}
                </p>
            )}
            <InputError message={error} className="mt-1 ml-4" />
        </div>
    );

    const inputClasses = "w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-black/20 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 font-semibold text-slate-700 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-700 transition-all";

    return (
        <section className={className}>
            <form onSubmit={submit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputGroup
                        label="Nama Lengkap"
                        icon={UserIcon}
                        error={errors.name}
                    >
                        <input
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className={inputClasses}
                            placeholder="Contoh: John Doe"
                            required
                        />
                    </InputGroup>

                    <InputGroup
                        label="Alamat Email"
                        icon={EnvelopeIcon}
                        error={errors.email}
                    >
                        <input
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            className={inputClasses}
                            placeholder="john@example.com"
                            required
                        />
                    </InputGroup>

                    <InputGroup
                        label="Nomor WhatsApp"
                        icon={ChatBubbleLeftRightIcon}
                        error={errors.phone}
                        description="Wajib unik. Gunakan kode negara (misal: 628123...). Digunakan untuk notifikasi pengingat tugas."
                    >
                        <input
                            type="text"
                            value={data.phone}
                            onChange={(e) => setData('phone', e.target.value)}
                            className={clsx(inputClasses, "font-mono")}
                            placeholder="628XXXXXXXXX"
                        />
                    </InputGroup>

                    <InputGroup
                        label="Zona Waktu"
                        icon={ClockIcon}
                        error={errors.timezone}
                        description="Menentukan kapan notifikasi harian Anda dikirimkan."
                    >
                        <select
                            value={data.timezone}
                            onChange={(e) => setData('timezone', e.target.value)}
                            className={clsx(inputClasses, "appearance-none")}
                        >
                            <option value="WIB">WIB (Jakarta / Sumatra)</option>
                            <option value="WITA">WITA (Bali / Makassar)</option>
                            <option value="WIT">WIT (Papua / Maluku)</option>
                        </select>
                    </InputGroup>

                    <div className="col-span-1 md:col-span-2 pt-2">
                        <div className="bg-slate-50 dark:bg-black/20 rounded-2xl p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-white dark:bg-white/10 rounded-full flex items-center justify-center shadow-sm">
                                    <span className="text-lg">📅</span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm text-slate-800 dark:text-white">Google Calendar Sync</h4>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Sinkronisasi tugas ke kalender otomatis.</p>
                                </div>
                            </div>

                            <div>
                                {user.is_google_connected ? (
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] uppercase font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-md">Connected</span>
                                        {/* Optional: Add disconnect button later if needed, user just wanted 'check' */}
                                    </div>
                                ) : (
                                    <a href={route('login.google.redirect')} className="apple-switch-label cursor-pointer flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-2">OFF</span>
                                        <div className="w-12 h-7 bg-slate-200 dark:bg-slate-700 rounded-full relative transition-colors hover:bg-slate-300">
                                            <div className="absolute left-1 top-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform" />
                                        </div>
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-6 pt-4">
                    <button
                        type="submit"
                        disabled={processing}
                        className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-black rounded-2xl font-black transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 shadow-xl"
                    >
                        {processing ? 'Menyimpan...' : 'Perbarui Profil'}
                    </button>

                    <AnimatePresence>
                        {recentlySuccessful && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0 }}
                                className="flex items-center gap-2 text-emerald-500 font-bold"
                            >
                                <div className="p-1 rounded-full bg-emerald-500/10">
                                    <CheckIcon className="h-4 w-4" />
                                </div>
                                <span className="text-sm">Tersimpan</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </form>
        </section>
    );
}
