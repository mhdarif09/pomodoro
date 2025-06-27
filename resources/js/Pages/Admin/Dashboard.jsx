import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function Dashboard({ auth }) {
    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Admin Dashboard" />

            <div className="py-12 px-6">
                <h2 className="text-2xl font-bold">Admin Dashboard</h2>
                <p className="mt-2 text-gray-600">Selamat datang, Admin {auth.user.name}</p>
            </div>
        </AuthenticatedLayout>
    );
}
