import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router } from '@inertiajs/react';
import { Switch } from '@headlessui/react';
import { Cog6ToothIcon, GlobeAltIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

export default function FeatureAccess({ auth, settings }) {
    const isGoogleCalendarEnabled = settings.google_calendar_enabled === 'true';

    const toggleGoogleCalendar = (enabled) => {
        router.post(route('admin.settings.update'), {
            key: 'google_calendar_enabled',
            value: enabled ? 'true' : 'false',
            type: 'boolean'
        }, {
            preserveScroll: true
        });
    };

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
                        {/* Google Calendar Toggle */}
                        <div className="flex items-center justify-between p-6 rounded-3xl bg-white/50 dark:bg-slate-900/50 border border-white dark:border-white/5 transition-all hover:shadow-lg hover:shadow-slate-200/20 dark:hover:shadow-black/20">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-2xl text-blue-600 dark:text-blue-400">
                                    <GlobeAltIcon className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-slate-900 dark:text-white">Google Calendar Integration</h4>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
                                        Saat dimatikan, seluruh akses ke Google Calendar akan diblokir, tombol hubungkan disembunyikan, dan API Smart Schedule akan mengembalikan error 403.
                                    </p>
                                </div>
                            </div>

                            <Switch
                                checked={isGoogleCalendarEnabled}
                                onChange={toggleGoogleCalendar}
                                className={`${isGoogleCalendarEnabled ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'
                                    } relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 shadow-inner`}
                            >
                                <span className="sr-only">Toggle Google Calendar</span>
                                <span
                                    className={`${isGoogleCalendarEnabled ? 'translate-x-6' : 'translate-x-1'
                                        } inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-md`}
                                />
                            </Switch>
                        </div>

                        {/* Additional global settings can be added here following the same pattern */}
                        <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/30 border border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center">
                            <p className="text-sm text-slate-400 dark:text-slate-600">Fitur global lainnya akan segera menyusul.</p>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
