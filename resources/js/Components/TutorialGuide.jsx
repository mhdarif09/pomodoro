import { useEffect } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { usePage } from '@inertiajs/react';
import axios from 'axios';

export default function TutorialGuide() {
    const user = usePage().props.auth.user;

    useEffect(() => {
        // Check if tutorial already seen in DB or LocalStorage
        const localSeen = localStorage.getItem('tutorial_seen');

        if (!user.has_seen_tutorial && !localSeen) {
            const driverObj = driver({
                showProgress: true,
                animate: true,
                allowClose: false,
                doneBtnText: 'Selesai',
                nextBtnText: 'Lanjut',
                prevBtnText: 'Kembali',
                progressText: '{{current}} dari {{total}}',
                popoverClass: 'driver-theme-green',
                steps: [
                    {
                        element: '#dashboard-nav',
                        popover: {
                            title: '👋 Selamat Datang!',
                            description: 'Ini adalah Dashboard Anda. Pusat kendali untuk melihat ringkasan aktivitas dan tugas harian.',
                            side: "right",
                            align: 'start'
                        }
                    },
                    {
                        element: '#learning-nav',
                        popover: {
                            title: '📚 Learning Hub',
                            description: 'Fokus belajar dengan Pomodoro Timer dan akses materi pembelajaran dalam satu tempat.',
                            side: "right",
                            align: 'start'
                        }
                    },
                    {
                        element: '#documents-nav',
                        popover: {
                            title: '🗂️ Documents & Kanban',
                            description: 'Kelola dokumen penting dan atur tugas-tugas Anda menggunakan Kanban Board yang interaktif.',
                            side: "right",
                            align: 'start'
                        }
                    },
                    {
                        element: '#profile-nav',
                        popover: {
                            title: '⚙️ Profile & Settings',
                            description: 'Atur profil dan notifikasi. Jangan lupa isi nomor WhatsApp untuk fitur reminder!',
                            side: "right",
                            align: 'start'
                        }
                    }
                ],
                onDestroyStarted: () => {
                    if (!driverObj.hasNextStep() || confirm("Lewati tutorial?")) {
                        driverObj.destroy();

                        // Optimistic update: set local storage immediately
                        localStorage.setItem('tutorial_seen', 'true');

                        // Background update to server
                        axios.post(route('profile.tutorial-seen'))
                            .catch(err => console.error('Failed to mark tutorial seen:', err));
                    }
                },
            });

            // Add custom CSS for green theme
            const style = document.createElement('style');
            style.innerHTML = `
                .driver-theme-green .driver-popover-next-btn,
                .driver-theme-green .driver-popover-prev-btn {
                    background-color: #10b981 !important; /* Emerald 500 */
                    color: white !important;
                    border: none !important;
                    text-shadow: none !important;
                    border-radius: 6px !important;
                }
                .driver-theme-green .driver-popover-next-btn:hover,
                .driver-theme-green .driver-popover-prev-btn:hover {
                    background-color: #059669 !important; /* Emerald 600 */
                }
                .driver-theme-green .driver-popover-progress-text {
                    color: #10b981 !important;
                }
            `;
            document.head.appendChild(style);

            driverObj.drive();

            return () => {
                document.head.removeChild(style);
            };
        }
    }, [user.has_seen_tutorial]);

    return null;
}
