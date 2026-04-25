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
    const { props } = usePage();
    const user = props.auth.user;
    const flashSuccess = props.flash?.success;

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        timezone: user.timezone || 'WIB',
        default_reminder_enabled: user.default_reminder_enabled ?? true,
        default_reminder_time: user.default_reminder_time || '09:00',
        default_reminder_days_before: user.default_reminder_days_before ?? 1,
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
                {flashSuccess && (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-300">
                        {flashSuccess}
                    </div>
                )}

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

                    <InputGroup
                        label="Jam Reminder Default"
                        icon={ClockIcon}
                        error={errors.default_reminder_time}
                        description="Dipakai untuk task baru yang punya deadline."
                    >
                        <input
                            type="time"
                            value={data.default_reminder_time}
                            onChange={(e) => setData('default_reminder_time', e.target.value)}
                            className={inputClasses}
                            required
                        />
                    </InputGroup>

                    <InputGroup
                        label="Hari Sebelum Deadline"
                        icon={ClockIcon}
                        error={errors.default_reminder_days_before}
                        description="0 = di hari deadline, 1 = H-1, dst."
                    >
                        <select
                            value={data.default_reminder_days_before}
                            onChange={(e) => setData('default_reminder_days_before', parseInt(e.target.value, 10))}
                            className={clsx(inputClasses, "appearance-none")}
                        >
                            <option value={0}>H-0 (hari deadline)</option>
                            <option value={1}>H-1</option>
                            <option value={2}>H-2</option>
                            <option value={3}>H-3</option>
                            <option value={7}>H-7</option>
                        </select>
                    </InputGroup>

                </div>

                <div className="rounded-2xl bg-slate-50 dark:bg-black/20 p-4 border border-slate-100 dark:border-white/5">
                    <label className="flex items-start gap-3">
                        <input
                            type="checkbox"
                            checked={data.default_reminder_enabled}
                            onChange={(e) => setData('default_reminder_enabled', e.target.checked)}
                            className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                            Aktifkan reminder default untuk task baru
                            <span className="block text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
                                Task lama tetap pakai pola reminder sebelumnya, task baru akan mengikuti pengaturan ini.
                            </span>
                        </span>
                    </label>
                    <InputError message={errors.default_reminder_enabled} className="mt-2" />
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
