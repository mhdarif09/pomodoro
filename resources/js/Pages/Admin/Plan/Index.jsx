import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { 
    PlusIcon, 
    CheckIcon, 
    XMarkIcon, 
    PencilSquareIcon, 
    TrashIcon,
    CircleStackIcon
} from '@heroicons/react/24/solid';

// --- Helper UI Components (didefinisikan dalam file yang sama) ---

// Input Field yang sudah di-styling
const Input = ({ className = '', ...props }) => (
    <input
        {...props}
        className={`block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-white/5 dark:text-white dark:ring-white/10 dark:focus:ring-blue-500 transition-all duration-150 ${className}`}
    />
);

// Select Field yang sudah di-styling
const Select = ({ className = '', children, ...props }) => (
     <select
        {...props}
        className={`block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-white/5 dark:text-white dark:ring-white/10 dark:focus:ring-blue-500 transition-all duration-150 ${className}`}
    >
        {children}
    </select>
);

// Base Button
const Button = ({ className = '', disabled, children, ...props }) => (
    <button
        {...props}
        disabled={disabled}
        className={`inline-flex items-center justify-center gap-x-1.5 rounded-md px-3.5 py-2 text-sm font-semibold shadow-sm transition-all duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${disabled ? 'opacity-60 cursor-not-allowed' : ''} ${className}`}
    >
        {children}
    </button>
);

// Icon-only Button
const IconButton = ({ className = '', disabled, children, ...props }) => (
     <button
        {...props}
        type="button"
        disabled={disabled}
        className={`inline-flex items-center justify-center p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-all duration-150 ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
        {children}
    </button>
);


// --- Sub-Komponen untuk Setiap Item Plan ---
// Dibuat sebagai komponen terpisah di dalam file agar bisa menggunakan hook-nya sendiri (useForm)
const PlanItem = ({ plan }) => {
    const [isEditing, setIsEditing] = useState(false);
    
    // Form hook ini HANYA untuk update dan delete item ini.
    // Ini membuat state-nya terisolasi dari form "create" dan plan lainnya.
    const { data, setData, put, delete: destroy, processing, errors, reset, wasSuccessful } = useForm({ ...plan });

    const handleUpdate = (e) => {
        e.preventDefault();
        put(route('admin.plans.update', plan.id), {
            onSuccess: () => setIsEditing(false),
            preserveScroll: true,
        });
    };

    const handleDelete = () => {
        if (confirm(`Yakin ingin menghapus plan "${plan.name}"?`)) {
            destroy(route('admin.plans.destroy', plan.id), {
                preserveScroll: true,
            });
        }
    };
    
    const handleCancel = () => {
        reset(); // Kembalikan form ke state awal (data plan asli)
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <form onSubmit={handleUpdate} className="bg-white dark:bg-gray-800/50 p-4 rounded-lg space-y-4 shadow-sm ring-1 ring-gray-900/5 dark:ring-white/10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                    <div className="md:col-span-2">
                        <Input type="text" value={data.name} onChange={e => setData('name', e.target.value)} placeholder="Nama Plan" />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>
                    <div>
                        <Input type="number" value={data.price} onChange={e => setData('price', e.target.value)} placeholder="Harga" />
                        {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
                    </div>
                    <div>
                        <Select value={data.duration} onChange={e => setData('duration', e.target.value)}>
                            <option value="monthly">Bulanan</option>
                            <option value="yearly">Tahunan</option>
                        </Select>
                        {errors.duration && <p className="text-red-500 text-xs mt-1">{errors.duration}</p>}
                    </div>
                </div>
                 <div className="flex justify-end items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                    <Button type="button" onClick={handleCancel} className="bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500 focus-visible:outline-gray-400">
                        <XMarkIcon className="h-5 w-5" /> Batal
                    </Button>
                    <Button type="submit" disabled={processing} className="bg-blue-600 text-white hover:bg-blue-700 focus-visible:outline-blue-600">
                        <CheckIcon className="h-5 w-5" /> {processing ? 'Menyimpan...' : 'Simpan'}
                    </Button>
                </div>
            </form>
        );
    }
    
    return (
        <div className="flex items-center justify-between p-4 rounded-lg bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150 shadow-sm ring-1 ring-gray-900/5 dark:ring-white/10">
            <div>
                <p className="font-semibold text-gray-900 dark:text-white">{plan.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Rp {plan.price.toLocaleString('id-ID')} / {plan.duration === 'monthly' ? 'bulan' : 'tahun'}
                </p>
            </div>
            <div className="flex items-center gap-1">
                <IconButton onClick={() => setIsEditing(true)} className="hover:text-blue-600 dark:hover:text-blue-400">
                    <PencilSquareIcon className="h-5 w-5" />
                </IconButton>
                <IconButton onClick={handleDelete} disabled={processing} className="hover:text-red-600 dark:hover:text-red-400">
                    <TrashIcon className="h-5 w-5" />
                </IconButton>
            </div>
        </div>
    );
};


// --- Komponen Utama Halaman ---
export default function Index({ auth, plans }) {
    // Form hook ini HANYA untuk membuat plan baru
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        price: '',
        duration: 'monthly',
    });

    const handleCreate = (e) => {
        e.preventDefault();
        post(route('admin.plans.store'), {
            onSuccess: () => reset(), // Reset form setelah sukses
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Kelola Plan Premium" />

            <main className="p-4 sm:p-6 lg:p-8 bg-gray-100 dark:bg-gray-900 min-h-screen">
                <div className="max-w-4xl mx-auto">
                    {/* Header Halaman */}
                    <header className="mb-8">
                         <div className="flex items-center gap-x-3">
                            <CircleStackIcon className="h-8 w-8 text-blue-500" aria-hidden="true" />
                            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Kelola Paket Premium</h1>
                        </div>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Tambah, edit, atau hapus paket langganan yang tersedia untuk pengguna.</p>
                    </header>

                    {/* Form Tambah Plan */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8 ring-1 ring-gray-900/5 dark:ring-white/10">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tambah Plan Baru</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-300 mb-1">Nama Plan</label>
                                    <Input id="name" type="text" value={data.name} onChange={(e) => setData('name', e.target.value)} required />
                                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                </div>
                                <div>
                                    <label htmlFor="price" className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-300 mb-1">Harga (Rp)</label>
                                    <Input id="price" type="number" value={data.price} onChange={(e) => setData('price', e.target.value)} placeholder="Contoh: 50000" required />
                                    {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
                                </div>
                                <div className="md:col-span-2">
                                     <label htmlFor="duration" className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-300 mb-1">Durasi</label>
                                    <Select id="duration" value={data.duration} onChange={(e) => setData('duration', e.target.value)}>
                                        <option value="monthly">Bulanan</option>
                                        <option value="yearly">Tahunan</option>
                                    </Select>
                                     {errors.duration && <p className="text-red-500 text-xs mt-1">{errors.duration}</p>}
                                </div>
                            </div>
                            <div className="flex justify-end pt-2">
                                <Button type="submit" disabled={processing} className="bg-blue-600 text-white hover:bg-blue-500 focus-visible:outline-blue-600">
                                    <PlusIcon className="h-5 w-5" /> {processing ? 'Menambahkan...' : 'Tambah Plan'}
                                </Button>
                            </div>
                        </form>
                    </div>

                    {/* Daftar Plan */}
                    <div className="space-y-4">
                        {plans.length > 0 ? (
                            plans.map((plan) => <PlanItem key={plan.id} plan={plan} />)
                        ) : (
                             <div className="text-center py-16 px-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                                <p className="text-gray-500 dark:text-gray-400">Belum ada plan yang dibuat.</p>
                                <p className="text-sm mt-2 text-gray-400 dark:text-gray-500">Gunakan form di atas untuk menambahkan plan pertama Anda.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </AuthenticatedLayout>
    );
}