import { useEffect, useState } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { usePage } from '@inertiajs/react';
import axios from 'axios';

export default function TutorialGuide({ setSidebarOpen, setCompanionMessage, setCompanionState }) {
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
                        description: 'Aku akan menemanimu di sini. Ini adalah <b>Markas Pusat</b> kita. Semua misi harian dimonitor dari sini.',
                        side: "right",
                        align: 'start',
                        onPopoverRender: () => {
                            if (setCompanionMessage) setCompanionMessage("Halo! Salam kenal ya! 👋");
                        }
                    }
                },
                {
                    element: '#smart-focus-section', // Need to add ID to Smart Focus section in TaskFocusPanel or Dashboard
                    popover: {
                        title: '🧠 Smart Focus 3',
                        description: 'Ini senjata rahasia kita! Aku akan pilihkan 3 tugas terbaik buatmu setiap hari. Tapi kamu bosnya, bebas pilih sendiri juga kok!',
                        side: "bottom",
                        align: 'center',
                        onPopoverRender: () => {
                            if (setCompanionMessage) setCompanionMessage("Aku bantu pilihkan tugas ya! 🤖");
                            if (setCompanionState) setCompanionState('focusing');
                        }
                    }
                },
                {
                    element: '#learning-nav',
                    popover: {
                        title: '📚 Ruang Belajar',
                        description: 'Kalau butuh fokus penuh, kita ke sini. Ada timer Pomodoro dan materi belajar biar makin jago.',
                        side: "right",
                        align: 'start'
                    }
                },
                {
                    element: '#documents-nav',
                    popover: {
                        title: '🗂️ Gudang Data',
                        description: 'Tempat simpan dokumen penting dan papan strategi (Kanban). Rapi pangkal produktif!',
                        side: "right",
                        align: 'start',
                        onPopoverRender: () => {
                            if (setCompanionState) setCompanionState('idle');
                        }
                    }
                }
            ];

            const mobileSteps = [
                {
                    element: 'body',
                    popover: {
                        title: '👋 Halo, Teman Baru!',
                        description: 'Aku teman kerjamu di SarangTumbuh. Yuk keliling sebentar!',
                        side: "bottom",
                        align: 'center',
                        onPopoverRender: () => {
                            if (setCompanionMessage) setCompanionMessage("Halo! Salam kenal ya! 👋");
                        }
                    }
                },
                {
                    element: '#mobile-menu-button',
                    popover: {
                        title: '🍔 Petu Navigasi',
                        description: 'Lewat sini kita bisa ke mana saja. Coba intip sebentar...',
                        side: "bottom",
                        align: 'start'
                    },
                    onNext: () => {
                        if (setSidebarOpen) {
                            setSidebarOpen(true);
                            return new Promise((resolve) => setTimeout(resolve, 300));
                        }
                    }
                },
                // ... (standard mobile steps kept simple)
                {
                    element: '#mobile-dashboard-nav',
                    popover: {
                        title: '📊 Markas Pusat',
                        description: 'Tempat kita atur strategi harian.',
                        side: "bottom",
                        align: 'start'
                    }
                }
            ];

            const driverObj = driver({
                showProgress: true,
                animate: true,
                allowClose: false,
                doneBtnText: 'Siap Kerja! 🚀',
                nextBtnText: 'Lanjut',
                prevBtnText: 'Mundur',
                progressText: '{{current}} / {{total}}',
                popoverClass: 'driver-theme-green',
                steps: isMobile ? mobileSteps : desktopSteps,
                onDestroyStarted: () => {
                    if (!driverObj.hasNextStep() || confirm("Sudah paham jalannya?")) {
                        driverObj.destroy();
                        if (isMobile && setSidebarOpen) setSidebarOpen(false);
                        localStorage.setItem('tutorial_seen', 'true');
                        axios.post(route('profile.tutorial-seen')).catch(err => console.error(err));

                        if (setCompanionMessage) setCompanionMessage("Oke, ayo mulai kerja! Semangat! 🔥");
                        if (setCompanionState) setCompanionState('celebrating');
                        setTimeout(() => { if (setCompanionState) setCompanionState('idle'); }, 3000);
                    }
                },
            });

            // Keep custom styles
            const style = document.createElement('style');
            style.innerHTML = `
                .driver-theme-green .driver-popover-next-btn,
                .driver-theme-green .driver-popover-done-btn {
                    background-color: #6366f1 !important; /* Indigo 500 for Companion vibe */
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
    }, [user.has_seen_tutorial]);

    return null;
}
