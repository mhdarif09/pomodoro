import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { ClockIcon, AcademicCapIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';

export default function Index({ auth, activeTab = 'pomodoro' }) {
    const [currentTab, setCurrentTab] = useState(activeTab);

    const tabs = [
        { id: 'pomodoro', name: 'Pomodoro Timer', icon: ClockIcon, route: 'pomodoro.index' },
        { id: 'learning', name: 'Learning Center', icon: AcademicCapIcon, route: 'mini-moduls.index' },
    ];

    const handleTabClick = (tab) => {
        window.location.href = route(tab.route);
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h2 className="font-bold text-2xl text-gray-900 dark:text-white">
                        📚 Learning Hub
                    </h2>
                </div>
            }
        >
            <Head title="Learning Hub" />

            <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                {/* Tabs */}
                <div className="mb-8">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = currentTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => handleTabClick(tab)}
                                        className={`
                                            group inline-flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200
                                            ${isActive
                                                ? 'border-emerald-500 text-emerald-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            }
                                        `}
                                    >
                                        <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-500' : 'text-gray-400 group-hover:text-gray-500'}`} />
                                        {tab.name}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>
                </div>

                {/* Content Area */}
                <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
                    <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100">
                        {currentTab === 'pomodoro' ? (
                            <ClockIcon className="w-8 h-8 text-emerald-600" />
                        ) : (
                            <AcademicCapIcon className="w-8 h-8 text-emerald-600" />
                        )}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {currentTab === 'pomodoro' ? 'Pomodoro Timer' : 'Learning Center'}
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                        {currentTab === 'pomodoro'
                            ? 'Tingkatkan produktivitas dengan teknik Pomodoro. Fokus 25 menit, istirahat 5 menit.'
                            : 'Jelajahi koleksi modul pembelajaran interaktif untuk meningkatkan pengetahuan Anda.'
                        }
                    </p>
                    <Link
                        href={route(tabs.find(t => t.id === currentTab).route)}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/30 transition-all duration-200 transform hover:scale-105"
                    >
                        {currentTab === 'pomodoro' ? 'Mulai Pomodoro' : 'Lihat Modul'}
                    </Link>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
