import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Link, usePage } from '@inertiajs/react';

export default function WhatsAppWarningModal() {
    const user = usePage().props.auth.user;
    const [open, setOpen] = useState(false);

    useEffect(() => {
        // Check if user has phone
        if (user.phone) return;

        // Check if tutorial is completed (either in DB or local storage)
        // We want to show this ONLY after tutorial is done
        const localSeen = localStorage.getItem('tutorial_seen');
        const isTutorialDone = user.has_seen_tutorial || localSeen === 'true';

        if (!isTutorialDone) return;

        // Check if permanently dismissed
        if (localStorage.getItem('whatsapp_warning_seen') === 'true') return;

        // Show modal after a small delay for better UX
        const timer = setTimeout(() => setOpen(true), 1500);
        return () => clearTimeout(timer);
    }, [user.phone, user.has_seen_tutorial]);

    const handleDismiss = () => {
        setOpen(false);
        localStorage.setItem('whatsapp_warning_seen', 'true');
    };

    if (user.phone) return null;

    return (
        <Transition.Root show={open} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={setOpen}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" />
                </Transition.Child>

                <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            <Dialog.Panel className="relative transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 px-4 pb-4 pt-5 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-md sm:p-6 border border-gray-100 dark:border-gray-700">
                                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                                    <button
                                        type="button"
                                        className="rounded-md bg-white dark:bg-gray-800 text-gray-400 hover:text-gray-500 focus:outline-none"
                                        onClick={handleDismiss}
                                    >
                                        <span className="sr-only">Close</span>
                                        <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                                    </button>
                                </div>
                                <div className="sm:flex sm:items-start">
                                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 sm:mx-0 sm:h-10 sm:w-10">
                                        <ExclamationTriangleIcon className="h-6 w-6 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                                    </div>
                                    <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                                        <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900 dark:text-white">
                                            Aktifkan Reminder WhatsApp
                                        </Dialog.Title>
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                Agar tidak lupa deadline tugas, mohon lengkapi nomor WhatsApp Anda. Kami akan mengirimkan reminder otomatis H-1 deadline.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-6 sm:mt-4 sm:flex sm:flex-row-reverse gap-2">
                                    <Link
                                        href={route('profile.edit')}
                                        className="inline-flex w-full justify-center rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 sm:w-auto transition-all"
                                        onClick={() => setOpen(false)}
                                    >
                                        Setup Sekarang
                                    </Link>
                                    <button
                                        type="button"
                                        className="mt-3 inline-flex w-full justify-center rounded-xl bg-white dark:bg-gray-700 px-4 py-2.5 text-sm font-semibold text-gray-900 dark:text-gray-200 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 sm:mt-0 sm:w-auto transition-all"
                                        onClick={handleDismiss}
                                    >
                                        Nanti Saja
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    );
}
