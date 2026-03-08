import { useRef, useState } from 'react';
import InputError from '@/Components/InputError';
import Modal from '@/Components/Modal';
import { useForm } from '@inertiajs/react';
import {
    ExclamationTriangleIcon,
    ShieldExclamationIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';

export default function DeleteUserForm({ className = '' }) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef();

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
    } = useForm({
        password: '',
    });

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    const deleteUser = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);
        reset();
    };

    return (
        <section className={`space-y-6 ${className}`}>
            <div className="flex items-start gap-4">
                <div className="p-3 bg-red-500/10 rounded-2xl">
                    <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />
                </div>
                <div className="space-y-1">
                    <h3 className="text-lg font-black text-slate-800 dark:text-neutral-200">Hapus Akun</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-lg">
                        Setelah akun Anda dihapus, semua sumber daya dan datanya akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.
                    </p>
                </div>
            </div>

            <button
                onClick={confirmUserDeletion}
                className="px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-600 font-black rounded-2xl transition-all active:scale-95"
            >
                Hapus Akun Saya
            </button>

            <Modal show={confirmingUserDeletion} onClose={closeModal}>
                <form onSubmit={deleteUser} className="p-8 space-y-6 bg-white dark:bg-[#1C1C1E] border border-slate-100 dark:border-white/5 rounded-3xl overflow-hidden relative">
                    <div className="absolute top-4 right-4">
                        <button type="button" onClick={closeModal} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                            <XMarkIcon className="h-5 w-5 text-slate-400" />
                        </button>
                    </div>

                    <div className="text-center space-y-4">
                        <div className="inline-flex p-4 bg-red-500 text-white rounded-2xl shadow-lg shadow-red-500/20 mb-2">
                            <ShieldExclamationIcon className="h-8 w-8" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Konfirmasi Penghapusan</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                            Silakan masukkan kata sandi Anda untuk mengonfirmasi bahwa Anda ingin menghapus akun secara permanen.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <div className="relative group">
                            <input
                                id="password"
                                type="password"
                                name="password"
                                ref={passwordInput}
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className="w-full px-6 py-4 bg-slate-50 dark:bg-black/40 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 font-semibold text-center text-slate-700 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-700 transition-all"
                                isFocused
                                placeholder="Masukkan Kata Sandi"
                            />
                        </div>
                        <InputError message={errors.password} className="text-center" />
                    </div>

                    <div className="flex flex-col gap-3 pt-4">
                        <button
                            disabled={processing}
                            className="w-full py-4 bg-red-500 hover:bg-red-600 text-white font-black rounded-2xl shadow-xl shadow-red-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
                        >
                            Hapus Akun Secara Permanen
                        </button>
                        <button
                            type="button"
                            onClick={closeModal}
                            className="w-full py-4 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 font-bold rounded-2xl active:scale-[0.98] transition-all"
                        >
                            Batalkan
                        </button>
                    </div>
                </form>
            </Modal>
        </section>
    );
}
