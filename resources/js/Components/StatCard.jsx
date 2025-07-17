import React from 'react';

export default function StatCard({ title, value, icon }) {
    return (
        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 flex items-center">
                <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                    {icon}
                </div>
                <div className="ml-4">
                    <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
                    <dd className="mt-1 text-2xl font-semibold text-gray-900">{value}</dd>
                </div>
            </div>
        </div>
    );
}