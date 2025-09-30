import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { 
    PlusIcon, 
    CheckIcon, 
    XMarkIcon, 
    PencilSquareIcon, 
    TrashIcon,
    CircleStackIcon,
    EyeIcon,
    EyeSlashIcon
} from '@heroicons/react/24/solid';

// --- Helper UI Components ---
const Input = ({ className = '', ...props }) => (
    <input
        {...props}
        className={`block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-white/5 dark:text-white dark:ring-white/10 dark:focus:ring-blue-500 transition-all duration-150 ${className}`}
    />
);

const Textarea = ({ className = '', ...props }) => (
    <textarea
        {...props}
        className={`block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-white/5 dark:text-white dark:ring-white/10 dark:focus:ring-blue-500 transition-all duration-150 ${className}`}
    />
);

const Select = ({ className = '', children, ...props }) => (
    <select
        {...props}
        className={`block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-white/5 dark:text-white dark:ring-white/10 dark:focus:ring-blue-500 transition-all duration-150 ${className}`}
    >
        {children}
    </select>
);

const Button = ({ className = '', disabled, children, ...props }) => (
    <button
        {...props}
        disabled={disabled}
        className={`inline-flex items-center justify-center gap-x-1.5 rounded-md px-3.5 py-2 text-sm font-semibold shadow-sm transition-all duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${disabled ? 'opacity-60 cursor-not-allowed' : ''} ${className}`}
    >
        {children}
    </button>
);

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

// --- Features Input Component ---
const FeaturesInput = ({ features = [], onChange }) => {
    const [newFeature, setNewFeature] = useState('');

    const addFeature = () => {
        if (newFeature.trim() && !features.includes(newFeature.trim())) {
            onChange([...features, newFeature.trim()]);
            setNewFeature('');
        }
    };

    const removeFeature = (index) => {
        const updatedFeatures = features.filter((_, i) => i !== index);
        onChange(updatedFeatures);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addFeature();
        }
    };

    return (
        <div className="space-y-3">
            <div className="flex gap-2">
                <Input
                    type="text"
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Tambah fitur..."
                    className="flex-1"
                />
                <Button
                    type="button"
                    onClick={addFeature}
                    className="bg-green-600 text-white hover:bg-green-500"
                >
                    <PlusIcon className="h-4 w-4" />
                </Button>
            </div>
            
            {features.length > 0 && (
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Fitur yang ditambahkan:
                    </label>
                    <div className="space-y-2">
                        {features.map((feature, index) => (
                            <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 px-3 py-2 rounded-md">
                                <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                                <IconButton
                                    onClick={() => removeFeature(index)}
                                    className="hover:text-red-600 dark:hover:text-red-400"
                                >
                                    <XMarkIcon className="h-4 w-4" />
                                </IconButton>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
// --- Plan Item Component ---
const PlanItem = ({ plan }) => {
    const [isEditing, setIsEditing] = useState(false);
    
    const { data, setData, put, patch, delete: destroy, processing, errors, reset } = useForm({
        name: plan.name || '',
        price: plan.price || '',
        duration: plan.duration || 'monthly',
        description: plan.description || '',
        features: plan.features || [],
        is_active: plan.is_active ?? true,
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

    const handleToggleStatus = () => {
        // GUNAKAN PATCH bukan put
        patch(route('admin.plans.toggle-status', plan.id), {
            preserveScroll: true,
        });
    };
    
    const handleCancel = () => {
        reset();
        setIsEditing(false);
    };

    const handleFeaturesChange = (newFeatures) => {
        setData('features', newFeatures);
    };

    if (isEditing) {
        return (
            <form onSubmit={handleUpdate} className="bg-white dark:bg-gray-800/50 p-6 rounded-lg space-y-6 shadow-sm ring-1 ring-gray-900/5 dark:ring-white/10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Informasi Dasar</h3>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Nama Plan *
                            </label>
                            <Input 
                                type="text" 
                                value={data.name} 
                                onChange={e => setData('name', e.target.value)} 
                                placeholder="Contoh: Premium Monthly" 
                                required 
                            />
                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Harga (Rp) *
                            </label>
                            <Input 
                                type="number" 
                                value={data.price} 
                                onChange={e => setData('price', e.target.value)} 
                                placeholder="Contoh: 99000" 
                                min="1000"
                                required 
                            />
                            {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Durasi *
                            </label>
                            <Select value={data.duration} onChange={e => setData('duration', e.target.value)}>
                                <option value="monthly">Bulanan</option>
                                <option value="yearly">Tahunan</option>
                            </Select>
                            {errors.duration && <p className="text-red-500 text-xs mt-1">{errors.duration}</p>}
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id={`active-${plan.id}`}
                                checked={data.is_active}
                                onChange={e => setData('is_active', e.target.checked)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                            />
                            <label htmlFor={`active-${plan.id}`} className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Plan Aktif
                            </label>
                        </div>
                    </div>

                    {/* Description & Features */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Detail & Fitur</h3>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Deskripsi
                            </label>
                            <Textarea
                                value={data.description}
                                onChange={e => setData('description', e.target.value)}
                                placeholder="Deskripsi plan untuk ditampilkan ke user..."
                                rows={3}
                            />
                            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Fitur Plan
                            </label>
                            <FeaturesInput 
                                features={data.features} 
                                onChange={handleFeaturesChange} 
                            />
                            {errors.features && <p className="text-red-500 text-xs mt-1">{errors.features}</p>}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button 
                        type="button" 
                        onClick={handleCancel} 
                        className="bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500 focus-visible:outline-gray-400"
                    >
                        <XMarkIcon className="h-5 w-5" /> Batal
                    </Button>
                    <Button 
                        type="submit" 
                        disabled={processing} 
                        className="bg-blue-600 text-white hover:bg-blue-700 focus-visible:outline-blue-600"
                    >
                        <CheckIcon className="h-5 w-5" /> {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </Button>
                </div>
            </form>
        );
    }
    
    return (
        <div className="flex items-center justify-between p-6 rounded-lg bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150 shadow-sm ring-1 ring-gray-900/5 dark:ring-white/10">
            <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                    <p className="font-semibold text-gray-900 dark:text-white">{plan.name}</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        plan.is_active 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                    }`}>
                        {plan.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Rp {plan.price?.toLocaleString('id-ID')} / {plan.duration === 'monthly' ? 'bulan' : 'tahun'}
                </p>

                {plan.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-500 mb-2">{plan.description}</p>
                )}

                {plan.features && plan.features.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                        {plan.features.slice(0, 3).map((feature, index) => (
                            <span 
                                key={index}
                                className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                            >
                                {feature}
                            </span>
                        ))}
                        {plan.features.length > 3 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                                +{plan.features.length - 3} lebih
                            </span>
                        )}
                    </div>
                )}
            </div>
            
            <div className="flex items-center gap-1">
                <IconButton 
                    onClick={handleToggleStatus} 
                    disabled={processing}
                    className={plan.is_active ? 'hover:text-orange-600 dark:hover:text-orange-400' : 'hover:text-green-600 dark:hover:text-green-400'}
                    title={plan.is_active ? 'Nonaktifkan plan' : 'Aktifkan plan'}
                >
                    {plan.is_active ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </IconButton>
                <IconButton 
                    onClick={() => setIsEditing(true)} 
                    className="hover:text-blue-600 dark:hover:text-blue-400"
                    title="Edit plan"
                >
                    <PencilSquareIcon className="h-5 w-5" />
                </IconButton>
                <IconButton 
                    onClick={handleDelete} 
                    disabled={processing} 
                    className="hover:text-red-600 dark:hover:text-red-400"
                    title="Hapus plan"
                >
                    <TrashIcon className="h-5 w-5" />
                </IconButton>
            </div>
        </div>
    );
};

// --- Main Component ---
export default function Index({ auth, plans }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        price: '',
        duration: 'monthly',
        description: '',
        features: [],
        is_active: true,
    });

    const handleFeaturesChange = (newFeatures) => {
        setData('features', newFeatures);
    };

    const handleCreate = (e) => {
        e.preventDefault();
        post(route('admin.plans.store'), {
            onSuccess: () => reset(),
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Kelola Plan Premium" />

            <main className="p-4 sm:p-6 lg:p-8 bg-gray-100 dark:bg-gray-900 min-h-screen">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <header className="mb-8">
                        <div className="flex items-center gap-x-3">
                            <CircleStackIcon className="h-8 w-8 text-blue-500" aria-hidden="true" />
                            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Kelola Paket Premium</h1>
                        </div>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            Kelola paket langganan premium untuk aplikasi. User akan melihat plan yang berstatus "Aktif".
                        </p>
                    </header>

                    {/* Create Form */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8 ring-1 ring-gray-900/5 dark:ring-white/10">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Tambah Plan Baru</h2>
                        <form onSubmit={handleCreate} className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Basic Info */}
                                <div className="space-y-4">
                                    <h3 className="text-md font-medium text-gray-900 dark:text-white">Informasi Dasar</h3>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Nama Plan *
                                        </label>
                                        <Input 
                                            id="name" 
                                            type="text" 
                                            value={data.name} 
                                            onChange={(e) => setData('name', e.target.value)} 
                                            placeholder="Contoh: Premium Monthly" 
                                            required 
                                        />
                                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Harga (Rp) *
                                        </label>
                                        <Input 
                                            id="price" 
                                            type="number" 
                                            value={data.price} 
                                            onChange={(e) => setData('price', e.target.value)} 
                                            placeholder="Contoh: 99000" 
                                            min="1000"
                                            required 
                                        />
                                        {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Durasi *
                                        </label>
                                        <Select 
                                            id="duration" 
                                            value={data.duration} 
                                            onChange={(e) => setData('duration', e.target.value)}
                                        >
                                            <option value="monthly">Bulanan</option>
                                            <option value="yearly">Tahunan</option>
                                        </Select>
                                        {errors.duration && <p className="text-red-500 text-xs mt-1">{errors.duration}</p>}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="is_active"
                                            checked={data.is_active}
                                            onChange={(e) => setData('is_active', e.target.checked)}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                                        />
                                        <label htmlFor="is_active" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Aktifkan plan langsung
                                        </label>
                                    </div>
                                </div>

                                {/* Description & Features */}
                                <div className="space-y-4">
                                    <h3 className="text-md font-medium text-gray-900 dark:text-white">Detail & Fitur</h3>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Deskripsi
                                        </label>
                                        <Textarea
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            placeholder="Deskripsi plan untuk ditampilkan ke user..."
                                            rows={3}
                                        />
                                        {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Fitur Plan
                                        </label>
                                        <FeaturesInput 
                                            features={data.features} 
                                            onChange={handleFeaturesChange} 
                                        />
                                        {errors.features && <p className="text-red-500 text-xs mt-1">{errors.features}</p>}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                                <Button 
                                    type="submit" 
                                    disabled={processing} 
                                    className="bg-blue-600 text-white hover:bg-blue-500 focus-visible:outline-blue-600"
                                >
                                    <PlusIcon className="h-5 w-5" /> 
                                    {processing ? 'Menambahkan...' : 'Tambah Plan'}
                                </Button>
                            </div>
                        </form>
                    </div>

                    {/* Plans List */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Daftar Plan ({plans.length})
                            </h2>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                {plans.filter(p => p.is_active).length} aktif, {plans.filter(p => !p.is_active).length} nonaktif
                            </div>
                        </div>

                        {plans.length > 0 ? (
                            plans.map((plan) => <PlanItem key={plan.id} plan={plan} />)
                        ) : (
                            <div className="text-center py-16 px-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                                <p className="text-gray-500 dark:text-gray-400">Belum ada plan yang dibuat.</p>
                                <p className="text-sm mt-2 text-gray-400 dark:text-gray-500">
                                    Gunakan form di atas untuk menambahkan plan pertama Anda.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </AuthenticatedLayout>
    );
}