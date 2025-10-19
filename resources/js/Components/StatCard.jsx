import React from 'react';


export default function StatCard({ title, value, icon: Icon, color }) {
    return (
        <div className="bg-white dark:bg-slate-800 shadow-sm rounded-lg p-5">
            <div className="flex items-center">
                <div className={`flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-md text-white ${color}`}>
                    <Icon className="h-6 w-6" />
                </div>
                <div className="ml-5 w-0 flex-1">
                    <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                            {title}
                        </dt>
                        <dd className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {value}
                        </dd>
                    </dl>
                </div>
            </div>
        </div>
    );
}