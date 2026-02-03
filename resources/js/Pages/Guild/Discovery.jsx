import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { UserGroupIcon, PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/solid';

export default function Discovery({ auth, publicGuilds }) {
    const { data: createData, setData: setCreateData, post: postCreate, processing: creating, errors: createErrors } = useForm({
        name: '',
        description: '',
        is_private: false
    });

    const { data: joinData, setData: setJoinData, post: postJoin, processing: joining, errors: joinErrors } = useForm({
        invite_code: ''
    });

    const handleCreate = (e) => {
        e.preventDefault();
        postCreate(route('guild.store'));
    };

    const handleJoin = (e) => {
        e.preventDefault();
        postJoin(route('guild.join'));
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-extrabold text-2xl text-slate-900 dark:text-white">Guild Discovery</h2>}
        >
            <Head title="Guilds" />

            <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Join via Code */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                                <MagnifyingGlassIcon className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold dark:text-white">Gabung dengan Kode</h3>
                        </div>
                        <p className="text-slate-500 mb-6">Punya kode undangan dari teman? Masukkan di sini.</p>

                        <form onSubmit={handleJoin} className="space-y-4">
                            <div>
                                <input
                                    type="text"
                                    value={joinData.invite_code}
                                    onChange={e => setJoinData('invite_code', e.target.value)}
                                    placeholder="Enter 6-digit code ex: A1B2C3"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:bg-slate-900 dark:border-slate-600 dark:text-white font-mono uppercase tracking-widest text-center text-lg focus:ring-2 focus:ring-indigo-500"
                                    maxLength={6}
                                />
                                {joinErrors.invite_code && <p className="text-red-500 text-sm mt-1">{joinErrors.invite_code}</p>}
                            </div>
                            <button
                                disabled={joining}
                                type="submit"
                                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all disabled:opacity-50"
                            >
                                Gabung Guild
                            </button>
                        </form>
                    </div>

                    {/* Create Guild */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                                <PlusIcon className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold dark:text-white">Buat Guild Baru</h3>
                        </div>
                        <p className="text-slate-500 mb-6">Mulai komunitas belajarmu sendiri. Jadilah pemimpin!</p>

                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Guild</label>
                                <input
                                    type="text"
                                    value={createData.name}
                                    onChange={e => setCreateData('name', e.target.value)}
                                    className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:bg-slate-900 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-emerald-500"
                                    placeholder="e.g. Pejuang Skripsi"
                                />
                                {createErrors.name && <p className="text-red-500 text-sm mt-1">{createErrors.name}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Deskripsi</label>
                                <textarea
                                    value={createData.description}
                                    onChange={e => setCreateData('description', e.target.value)}
                                    className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:bg-slate-900 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-emerald-500 resize-none"
                                    rows="2"
                                    placeholder="Visi misi guild..."
                                />
                            </div>
                            <button
                                disabled={creating}
                                type="submit"
                                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-all disabled:opacity-50"
                            >
                                Buat Guild (+500 XP)
                            </button>
                        </form>
                    </div>
                </div>

                {/* Public Guilds List */}
                <div className="mt-12">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Guild Populer</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {publicGuilds.map(guild => (
                            <div key={guild.id} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm hover:shadow-md transition border border-slate-200 dark:border-slate-700 flex flex-col">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-bold text-lg dark:text-white truncate">{guild.name}</h4>
                                    <span className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-slate-600 dark:text-slate-400">Lvl {guild.level}</span>
                                </div>
                                <p className="text-slate-500 text-sm mb-4 line-clamp-2 flex-1">{guild.description || "No description."}</p>
                                <div className="flex items-center justify-between mt-auto">
                                    <span className="text-xs text-slate-400">{guild.total_xp.toLocaleString()} XP</span>
                                    {/* Copy Code Button or Join Button logic would go here */}
                                    <div className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs font-mono select-all">
                                        {guild.invite_code}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
