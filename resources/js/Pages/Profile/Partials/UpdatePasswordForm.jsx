import { useRef } from 'react';
import InputError from '@/Components/InputError';
import { useForm } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    KeyIcon,
    ShieldCheckIcon,
    CheckIcon
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

export default function UpdatePasswordForm({ className = '' }) {
    const passwordInput = useRef();
    const currentPasswordInput = useRef();

    const { data, setData, errors, put, reset, processing, recentlySuccessful } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword = (e) => {
        e.preventDefault();
        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current.focus();
                }
                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current.focus();
                }
            },
        });
    };

    const InputGroup = ({ label, icon: Icon, children, error }) => (
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
            <InputError message={error} className="mt-1 ml-4" />
        </div>
    );

    const inputClasses = "w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-black/20 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 font-semibold text-slate-700 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-700 transition-all";

    return (
        <section className={className}>
            <form onSubmit={updatePassword} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <InputGroup
                            label="Kata Sandi Saat Ini"
                            icon={ShieldCheckIcon}
                            error={errors.current_password}
                        >
                            <input
                                type="password"
                                ref={currentPasswordInput}
                                value={data.current_password}
                                onChange={(e) => setData('current_password', e.target.value)}
                                className={inputClasses}
                                placeholder="••••••••"
                                autoComplete="current-password"
                            />
                        </InputGroup>
                    </div>

                    <InputGroup
                        label="Kata Sandi Baru"
                        icon={KeyIcon}
                        error={errors.password}
                    >
                        <input
                            type="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            className={inputClasses}
                            placeholder="••••••••"
                            autoComplete="new-password"
                        />
                    </InputGroup>

                    <InputGroup
                        label="Konfirmasi Kata Sandi"
                        icon={KeyIcon}
                        error={errors.password_confirmation}
                    >
                        <input
                            type="password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            className={inputClasses}
                            placeholder="••••••••"
                            autoComplete="new-password"
                        />
                    </InputGroup>
                </div>

                <div className="flex items-center gap-6 pt-4">
                    <button
                        type="submit"
                        disabled={processing}
                        className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-black rounded-2xl font-black transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 shadow-xl"
                    >
                        {processing ? 'Menyimpan...' : 'Perbarui Kata Sandi'}
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
