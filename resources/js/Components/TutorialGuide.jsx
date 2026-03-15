import { useEffect, useState } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { usePage } from '@inertiajs/react';
import axios from 'axios';

export default function TutorialGuide({ setSidebarOpen }) {
    const user = usePage().props.auth.user;

    useEffect(() => {
        // Check if tutorial already seen in DB or LocalStorage
        const localSeen = localStorage.getItem('tutorial_seen');

        if (!user.has_seen_tutorial && !localSeen) {
            const isMobile = window.innerWidth < 640;

            const desktopSteps = [
                {
                    element: '#dashboard-nav',
                    popover: {
                        title: '👋 Halo, Teman Baru!',
                        description: 'Selamat datang di Markas Pusat! Di sini kita atur semua strategi dan pantau misi harianmu.',
                        side: "right",
                        align: 'start',
                    }
                },
                {
                    element: '#smart-focus-section',
                    popover: {
                        title: '🧠 Smart Focus',
                        description: 'Bingung mau mulai dari mana? Aku akan pilihkan 3 tugas prioritas buatmu. Fokus selesaikan ini dulu ya!',
                        side: "bottom",
                        align: 'center',
                    }
                },
                {
                    element: '#ai-genius-nav',
                    popover: {
                        title: '✨ AI Genius',
                        description: 'Butuh teman brainstorming atau bantuan nulis? Asisten AI kita siap bantu kapan saja.',
                        side: "right",
                        align: 'start'
                    }
                },
                {
                    element: '#gamification-nav',
                    popover: {
                        title: '🏆 Rewards & XP',
                        description: 'Setiap tugas yang selesai memberimu XP! Naikkan levelmu dan kumpulkan badge keren.',
                        side: "right",
                        align: 'start'
                    }
                },
                {
                    element: '#guilds-nav',
                    popover: {
                        title: '🛡️ Guilds',
                        description: 'Gabung dengan komunitas! Kerjakan misi bareng teman-teman biar makin semangat.',
                        side: "right",
                        align: 'start'
                    }
                },
                {
                    element: '#learning-nav',
                    popover: {
                        title: '📚 Ruang Belajar',
                        description: 'Tempat fokus belajar. Ada timer Pomodoro khusus dan materi pengembangan diri.',
                        side: "right",
                        align: 'start'
                    }
                },
                {
                    element: '#documents-nav',
                    popover: {
                        title: '🗂️ Arsip & Dokumen',
                        description: 'Simpan catatan, dokumen, dan template di sini. Semuanya terorganisir rapi.',
                        side: "right",
                        align: 'start',
                    }
                }
            ];

            const mobileSteps = [
                {
                    element: 'body', // Fallback if no specific element
                    popover: {
                        title: '👋 Halo, Teman Baru!',
                        description: 'Selamat datang di SarangTumbuh! Yuk, aku ajak keliling sebentar.',
                        side: "bottom",
                        align: 'center',
                    }
                },
                {
                    element: '#mobile-dashboard-nav',
                    popover: {
                        title: '🏠 Markas Pusat',
                        description: 'Ini layar utamamu. Pantau semua progres harian dari sini.',
                        side: "top",
                        align: 'center'
                    }
                },
                {
                    element: '#mobile-tasks-nav',
                    popover: {
                        title: '📝 Misi Saya',
                        description: 'Daftar semua tugasmu ada di sini. Atur jadwal dan deadline dengan mudah.',
                        side: "top",
                        align: 'center'
                    }
                },
                {
                    element: '#mobile-rewards-nav',
                    popover: {
                        title: '🏆 Rewards',
                        description: 'Cek level, XP, dan pencapaianmu di sini. Jadikan produktivitas seperti main game!',
                        side: "top",
                        align: 'center'
                    }
                },
                {
                    element: '#mobile-guilds-nav',
                    popover: {
                        title: '🛡️ Komunitas',
                        description: 'Cari teman seperjuangan dan gabung Guild untuk misi bareng.',
                        side: "top",
                        align: 'center'
                    }
                },
                {
                    element: '#mobile-profile-nav',
                    popover: {
                        title: '👤 Profil',
                        description: 'Atur akun dan langgananmu di sini. Selamat produktif!',
                        side: "top",
                        align: 'center'
                    }
                }
            ];

            // Filter steps to only include those where the element exists
            const availableSteps = (isMobile ? mobileSteps : desktopSteps).filter(step => {
                const el = document.querySelector(step.element);
                return !!el;
            });

            if (availableSteps.length > 0) {
                const driverObj = driver({
                    showProgress: true,
                    animate: true,
                    allowClose: false,
                    doneBtnText: 'Siap Kerja! 🚀',
                    nextBtnText: 'Lanjut',
                    prevBtnText: 'Mundur',
                    progressText: '{{current}} / {{total}}',
                    popoverClass: 'driver-theme-green',
                    steps: availableSteps,
                    onDestroyStarted: () => {
                        if (!driverObj.hasNextStep() || confirm("Sudah paham jalannya?")) {
                            driverObj.destroy();
                            if (isMobile && setSidebarOpen) setSidebarOpen(false);
                            localStorage.setItem('tutorial_seen', 'true');
                            axios.post(route('profile.tutorial-seen')).catch(err => console.error(err));
                        }
                    },
                });

                // Keep custom styles
                const style = document.createElement('style');
                style.innerHTML = `
                .driver-theme-green .driver-popover-next-btn,
                .driver-theme-green .driver-popover-done-btn {
                    background-color: #6366f1 !important; /* Indigo 500 */
                    color: white !important;
                    border: none !important;
                    border-radius: 12px !important;
                    padding: 8px 16px !important;
                    font-weight: bold !important;
                }
                .driver-theme-green .driver-popover-title {
                    font-family: 'Inter', sans-serif;
                    font-weight: 800;
                    color: #1e293b;
                }
            `;
                document.head.appendChild(style);

                // Small delay to let page load before starting tour
                setTimeout(() => driverObj.drive(), 1000);

                return () => {
                    document.head.removeChild(style);
                };
            }
        }
    }, [user.has_seen_tutorial]);

    return null;
}
