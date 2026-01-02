// Service Worker for Background Pomodoro Timer
const CACHE_NAME = 'pomodoro-v1';
let activeTimer = null;
let timerInterval = null;

// Install event
self.addEventListener('install', (event) => {
    console.log('SW: Installing...');
    self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
    console.log('SW: Activating...');
    event.waitUntil(clients.claim());
});

// Listen for messages from client
self.addEventListener('message', (event) => {
    const { type, data } = event.data;

    switch (type) {
        case 'START_TIMER':
            startTimer(data);
            break;
        case 'STOP_TIMER':
            stopTimer();
            break;
        case 'GET_TIMER_STATE':
            event.ports[0].postMessage({
                type: 'TIMER_STATE',
                data: activeTimer
            });
            break;
    }
});

function startTimer(timerData) {
    // Clear existing timer if any
    stopTimer();

    activeTimer = {
        taskId: timerData.taskId,
        taskTitle: timerData.taskTitle,
        totalSeconds: timerData.totalSeconds,
        remainingSeconds: timerData.remainingSeconds,
        startedAt: Date.now()
    };

    console.log('SW: Timer started', activeTimer);

    // Update timer every second
    timerInterval = setInterval(() => {
        if (activeTimer) {
            activeTimer.remainingSeconds--;

            // Show notification at 5 min, 1 min, and completion
            if (activeTimer.remainingSeconds === 300) {
                showNotification('⏰ 5 Menit Lagi!', `${activeTimer.taskTitle} - Tetap fokus ya!`);
            } else if (activeTimer.remainingSeconds === 60) {
                showNotification('⏰ 1 Menit Lagi!', `${activeTimer.taskTitle} - Hampir selesai!`);
            } else if (activeTimer.remainingSeconds <= 0) {
                showCompletionNotification();
                stopTimer();
            }
        }
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    activeTimer = null;
    console.log('SW: Timer stopped');
}

function showNotification(title, body) {
    self.registration.showNotification(title, {
        body: body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        vibrate: [200, 100, 200],
        tag: 'pomodoro-timer',
        requireInteraction: false,
        // iOS-style appearance
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        }
    });
}

function showCompletionNotification() {
    self.registration.showNotification('🎉 Waktu Fokus Selesai!', {
        body: activeTimer ? `${activeTimer.taskTitle} - Waktunya istirahat!` : 'Sesi fokus kamu sudah selesai!',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        vibrate: [300, 100, 300, 100, 300],
        tag: 'pomodoro-complete',
        requireInteraction: true,
        actions: [
            { action: 'break', title: '☕ Istirahat' },
            { action: 'continue', title: '🚀 Lanjut Fokus' }
        ],
        data: {
            url: '/dashboard'
        }
    });

    // Play completion sound (if supported)
    if ('AudioContext' in self) {
        playCompletionSound();
    }
}

function playCompletionSound() {
    // Simple beep using Web Audio API
    try {
        const context = new AudioContext();
        const oscillator = context.createOscillator();
        const gainNode = context.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(context.destination);

        oscillator.frequency.value = 800;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.5);

        oscillator.start(context.currentTime);
        oscillator.stop(context.currentTime + 0.5);
    } catch (err) {
        console.log('SW: Audio not supported');
    }
}

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // If app is already open, focus it
                for (let client of clientList) {
                    if (client.url.includes('dashboard') && 'focus' in client) {
                        return client.focus();
                    }
                }
                // Otherwise open new window
                if (clients.openWindow) {
                    return clients.openWindow('/dashboard');
                }
            })
    );
});
