import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';

export default function FeatureAccess({ auth, settings }) {
    return (
        <AdminLayout user={auth.user} header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Feature Access</h2>}>
            <Head title="Feature Access - Admin" />

            <div className="max-w-4xl mx-auto py-10">
                <div className="mb-8">
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white">Feature Access</h2>
                    <p className="mt-2 text-slate-600 dark:text-slate-400">Kontrol akses fitur global untuk seluruh pengguna aplikasi.</p>
                </div>

                <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-8 shadow-xl shadow-slate-200/50 dark:shadow-black/20 rounded-[2.5rem] border border-white/20 dark:border-white/5">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-purple-500 rounded-xl text-white">
                            <ShieldCheckIcon className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white">Global Integration Settings</h3>
                    </div>

                    <div className="space-y-6">
                        {/* Additional global settings can be added here */}
                        <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/30 border border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center">
                            <p className="text-sm text-slate-400 dark:text-slate-600">Fitur global lainnya akan segera menyusul.</p>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
