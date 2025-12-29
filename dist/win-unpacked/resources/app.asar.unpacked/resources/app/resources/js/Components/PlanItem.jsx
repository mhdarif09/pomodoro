// Di dalam file yang sama dengan Index, atau impor jika dipisah

import { useForm } from '@inertiajs/react';
import React, { useState } from 'react';
import { Input, Select, Button, IconButton } from './FormControls'; // Sesuaikan path jika perlu
import { PencilSquareIcon, TrashIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/solid';

const PlanItem = ({ plan }) => {
    const [isEditing, setIsEditing] = useState(false);
    
    // Form hook untuk update dan delete
    const { data, setData, put, delete: destroy, processing, errors, reset } = useForm({
        ...plan, // Inisialisasi form dengan data plan
    });

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
        reset(); // Buang perubahan
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <form onSubmit={handleUpdate} className="bg-gray-200/50 dark:bg-white/5 p-4 rounded-lg space-y-4">
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
                 <div className="flex justify-end items-center gap-2">
                    <Button type="button" onClick={handleCancel} className="bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500">
                        <XMarkIcon className="h-4 w-4" /> Batal
                    </Button>
                    <Button type="submit" disabled={processing} className="bg-blue-600 text-white hover:bg-blue-700 focus-visible:outline-blue-600">
                        {processing ? 'Menyimpan...' : <><CheckIcon className="h-4 w-4" /> Simpan</>}
                    </Button>
                </div>
            </form>
        );
    }
    
    return (
        <div className="flex items-center justify-between p-4 rounded-lg bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800 transition shadow-sm">
            <div>
                <p className="font-semibold text-gray-900 dark:text-white">{plan.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Rp {plan.price.toLocaleString('id-ID')} / {plan.duration === 'monthly' ? 'bulan' : 'tahun'}
                </p>
            </div>
            <div className="flex items-center gap-2">
                <IconButton onClick={() => setIsEditing(true)} className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                    <PencilSquareIcon className="h-5 w-5" />
                </IconButton>
                <IconButton onClick={handleDelete} disabled={processing} className="text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400">
                    <TrashIcon className="h-5 w-5" />
                </IconButton>
            </div>
        </div>
    );
};