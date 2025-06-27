import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Index({ auth, plans }) {
    const { data, setData, put, delete: destroy } = useForm();
    const [editingPlan, setEditingPlan] = useState(null);
    const [form, setForm] = useState({ name: '', price: '', duration: 'monthly' });

    const handleCreate = (e) => {
        e.preventDefault();
        router.post(route('admin.plans.store'), form, {
            onSuccess: () => setForm({ name: '', price: '', duration: 'monthly' }),
        });
    };

    const handleUpdate = (e) => {
        e.preventDefault();
        if (!editingPlan) return;
        put(route('admin.plans.update', editingPlan.id), editingPlan, {
            onSuccess: () => setEditingPlan(null),
        });
    };

    const handleDelete = (id) => {
        if (confirm('Yakin ingin menghapus plan ini?')) {
            destroy(route('admin.plans.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Kelola Plan Premium" />

            <div className="p-6 max-w-4xl mx-auto text-white">
                <h1 className="text-2xl font-bold mb-6">Paket Premium</h1>

                {/* Form Tambah Plan */}
                <form onSubmit={handleCreate} className="bg-gray-800 p-4 rounded-lg mb-6 space-y-3">
                    <h2 className="text-lg font-semibold">Tambah Plan Baru</h2>
                    <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Nama Plan"
                        className="w-full rounded p-2 text-black"
                        required
                    />
                    <input
                        type="number"
                        value={form.price}
                        onChange={(e) => setForm({ ...form, price: e.target.value })}
                        placeholder="Harga (Rp)"
                        className="w-full rounded p-2 text-black"
                        required
                    />
                    <select
                        value={form.duration}
                        onChange={(e) => setForm({ ...form, duration: e.target.value })}
                        className="w-full rounded p-2 text-black"
                    >
                        <option value="monthly">Bulanan</option>
                        <option value="yearly">Tahunan</option>
                    </select>
                    <button className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded">Tambah</button>
                </form>

                {/* List Plan */}
                <div className="space-y-4">
                    {plans.map((plan) => (
                        <div key={plan.id} className="bg-gray-700 p-4 rounded-lg flex flex-col sm:flex-row sm:items-center gap-3">
                            {editingPlan?.id === plan.id ? (
                                <form onSubmit={handleUpdate} className="w-full flex flex-col sm:flex-row sm:items-center gap-3">
                                    <input
                                        type="text"
                                        value={editingPlan.name}
                                        onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                                        className="rounded p-2 text-black w-full sm:w-1/3"
                                    />
                                    <input
                                        type="number"
                                        value={editingPlan.price}
                                        onChange={(e) => setEditingPlan({ ...editingPlan, price: e.target.value })}
                                        className="rounded p-2 text-black w-full sm:w-1/4"
                                    />
                                    <select
                                        value={editingPlan.duration}
                                        onChange={(e) => setEditingPlan({ ...editingPlan, duration: e.target.value })}
                                        className="rounded p-2 text-black w-full sm:w-1/4"
                                    >
                                        <option value="monthly">Bulanan</option>
                                        <option value="yearly">Tahunan</option>
                                    </select>
                                    <div className="flex gap-2">
                                        <button className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded">Simpan</button>
                                        <button type="button" onClick={() => setEditingPlan(null)} className="bg-gray-500 hover:bg-gray-600 px-3 py-2 rounded">Batal</button>
                                    </div>
                                </form>
                            ) : (
                                <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between">
                                    <div>
                                        <div className="font-semibold">{plan.name}</div>
                                        <div className="text-sm text-gray-300">Rp {plan.price.toLocaleString()} / {plan.duration === 'monthly' ? 'bulan' : 'tahun'}</div>
                                    </div>
                                    <div className="flex gap-2 mt-2 sm:mt-0">
                                        <button onClick={() => setEditingPlan(plan)} className="bg-yellow-500 hover:bg-yellow-600 px-3 py-2 rounded">Edit</button>
                                        <button onClick={() => handleDelete(plan.id)} className="bg-red-600 hover:bg-red-700 px-3 py-2 rounded">Hapus</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
