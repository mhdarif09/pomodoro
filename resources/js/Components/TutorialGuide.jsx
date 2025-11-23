import { useEffect } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { usePage, router } from '@inertiajs/react';

export default function TutorialGuide() {
    const user = usePage().props.auth.user;

    useEffect(() => {
        if (!user.has_seen_tutorial) {
            const driverObj = driver({
                showProgress: true,
                animate: true,
                doneBtnText: 'Selesai',
                nextBtnText: 'Lanjut',
                prevBtnText: 'Kembali',
                steps: [
                    {
                        element: '#dashboard-nav',
                        popover: {
                            title: 'Selamat Datang di SarangTumbuh! 🌱',
                            description: 'Ini adalah Dashboard Anda. Di sini Anda bisa melihat ringkasan aktivitas dan tugas harian Anda.',
                            side: "right",
                            align: 'start'
                        }
                    },
                    {
                        element: '#learning-nav',
                        popover: {
                            title: 'Learning Hub 📚',
                            description: 'Akses Pomodoro Timer untuk fokus belajar dan Learning Center untuk materi pembelajaran.',
                            side: "right",
                            align: 'start'
                        }
                    },
                    {
                        element: '#documents-nav',
                        popover: {
                            title: 'Documents & Kanban 🗂️',
                            description: 'Kelola dokumen Anda dan atur tugas menggunakan Kanban Board yang interaktif.',
                            side: "right",
                            align: 'start'
                        }
                    },
                    {
                        element: '#profile-nav',
                        popover: {
                            title: 'Profile & Settings ⚙️',
                            description: 'Atur profil Anda, termasuk nomor WhatsApp untuk notifikasi reminder tugas.',
                            side: "right",
                            align: 'start'
                        }
                    }
                ],
                onDestroyStarted: () => {
                    if (!driverObj.hasNextStep() || confirm("Apakah Anda yakin ingin melewati tutorial?")) {
                        driverObj.destroy();
                        // Mark tutorial as seen via API
                        router.post(route('profile.tutorial-seen'), {}, {
                            preserveScroll: true,
                            preserveState: true,
                        });
                    }
                },
            });

            driverObj.drive();
        }
    }, [user.has_seen_tutorial]);

    return null;
}
