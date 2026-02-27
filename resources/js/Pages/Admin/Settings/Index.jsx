import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm } from '@inertiajs/react';
import { Cog6ToothIcon, CheckIcon } from '@heroicons/react/24/outline';

const SETTING_LABELS = {
    free_journal_limit: { label: 'Batas Jurnal (Free User)', unit: 'halaman', icon: '📓' },
    free_wa_reminder_limit: { label: 'Batas WA Reminder / Bulan (Free User)', unit: 'reminder', icon: '💬' },
};

export default function Index({ auth, settings }) {
    const { data, setData, post, processing, recentlySuccessful } = useForm({
        settings: settings.map(s => ({ key: s.key, value: s.value })),
    });

    const updateValue = (key, value) => {
        setData('settings', data.settings.map(s =>
            s.key === key ? { ...s, value } : s
        ));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.settings.update'));
    };

    return (
        <AdminLayout user={auth.user} header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Pengaturan Limit</h2>}>
            <Head title="Pengaturan Limit" />

            <div>
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Pengaturan Limit Aplikasi</h2>
                    <p className="mt-1 text-gray-600 dark:text-gray-400">Atur batasan fitur untuk user gratis di sini.</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-[2rem] border border-white/20 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-black/20 overflow-hidden">
                        {/* Free Limits Section */}
                        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-900/30">
                                    <Cog6ToothIcon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Batasan User Gratis</h3>
                                    <p className="text-sm text-slate-500">Fitur yang dibatasi untuk user dengan plan Free</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {settings.filter(s => s.group === 'free_limits').map((setting) => {
                                    const meta = SETTING_LABELS[setting.key] || { label: setting.key, unit: '', icon: '⚙️' };
                                    const currentValue = data.settings.find(s => s.key === setting.key)?.value || setting.value;

                                    return (
                                        <div key={setting.key} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-700/50">
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">{meta.icon}</span>
                                                <div>
                                                    <p className="font-semibold text-slate-800 dark:text-slate-200">{meta.label}</p>
                                                    <p className="text-xs text-slate-500">{setting.description}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={currentValue}
                                                    onChange={(e) => updateValue(setting.key, e.target.value)}
                                                    className="w-24 text-center rounded-xl border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-lg shadow-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                                />
                                                <span className="text-sm text-slate-500 font-medium">{meta.unit}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Save Button */}
                        <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-900/30 flex items-center justify-end gap-3">
                            {recentlySuccessful && (
                                <div className="flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400 font-medium">
                                    <CheckIcon className="h-4 w-4" />
                                    <span>Tersimpan!</span>
                                </div>
                            )}
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl shadow-lg shadow-amber-500/25 transition-all hover:shadow-xl hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {processing ? 'Menyimpan...' : 'Simpan Pengaturan'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
