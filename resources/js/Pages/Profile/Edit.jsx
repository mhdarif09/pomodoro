import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    UserIcon,
    KeyIcon,
    ExclamationTriangleIcon,
    ArrowLeftIcon
} from '@heroicons/react/24/outline';

export default function Edit({ auth, mustVerifyEmail, status }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center gap-4">
                    <button onClick={() => window.history.back()} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <ArrowLeftIcon className="h-5 w-5 text-slate-500" />
                    </button>
                    <h2 className="font-black text-2xl text-slate-800 dark:text-neutral-200 tracking-tight">Pengaturan</h2>
                </div>
            }
        >
            <Head title="Pengaturan - Sarang Tumbuh" />

            <div className="py-10 bg-[#F2F2F7] dark:bg-black min-h-[calc(100vh-64px)] overflow-x-hidden">
                <div className="max-w-3xl mx-auto px-6 space-y-12">

                    {/* Profile Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="space-y-3"
                    >
                        <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-4">Identitas & Kontak</h3>
                        <div className="bg-white dark:bg-[#1C1C1E] rounded-[1.5rem] shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] overflow-hidden border border-slate-100 dark:border-white/5">
                            <div className="p-6 sm:p-8">
                                <UpdateProfileInformationForm
                                    mustVerifyEmail={mustVerifyEmail}
                                    status={status}
                                />
                            </div>
                        </div>
                    </motion.div>

                    {/* Security Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="space-y-3"
                    >
                        <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-4">Keamanan Akun</h3>
                        <div className="bg-white dark:bg-[#1C1C1E] rounded-[1.5rem] shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] overflow-hidden border border-slate-100 dark:border-white/5">
                            <div className="p-6 sm:p-8">
                                <UpdatePasswordForm />
                            </div>
                        </div>
                    </motion.div>

                    {/* Danger Zone */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="space-y-3 pb-12"
                    >
                        <h3 className="text-xs font-black text-red-400 dark:text-red-500/70 uppercase tracking-widest pl-4">Zona Berbahaya</h3>
                        <div className="bg-white dark:bg-[#1C1C1E] rounded-[1.5rem] shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] overflow-hidden border border-red-50 dark:border-red-500/10">
                            <div className="p-6 sm:p-8">
                                <DeleteUserForm />
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
