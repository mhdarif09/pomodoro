/**
 * Notification Helper with iOS-style notifications
 */

export const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
        console.log('This browser does not support notifications');
        return false;
    }

    if (Notification.permission === 'granted') {
        return true;
    }

    if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }

    return false;
};

export const registerServiceWorker = async () => {
    if (!('serviceWorker' in navigator)) {
        console.log('Service Worker not supported');
        return null;
    }

    try {
        const registration = await navigator.serviceWorker.register('/service-worker.js', {
            scope: '/'
        });

        console.log('Service Worker registered:', registration);
        return registration;
    } catch (error) {
        console.error('Service Worker registration failed:', error);
        return null;
    }
};

export const startBackgroundTimer = (timerData) => {
    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
            type: 'START_TIMER',
            data: timerData
        });
    }
};

export const stopBackgroundTimer = () => {
    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
            type: 'STOP_TIMER'
        });
    }
};

export const showIOSStyleNotification = (title, options = {}) => {
    if (Notification.permission === 'granted') {
        const notification = new Notification(title, {
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            vibrate: [200, 100, 200],
            ...options,
            // iOS-style options
            tag: options.tag || 'pomodoro',
            requireInteraction: options.requireInteraction || false,
        });

        // Auto-close after 5 seconds if not requiring interaction
        if (!options.requireInteraction) {
            setTimeout(() => notification.close(), 5000);
        }

        return notification;
    }
    return null;
};

export const checkNotificationSupport = () => {
    return {
        notifications: 'Notification' in window,
        serviceWorker: 'serviceWorker' in navigator,
        permission: Notification.permission
    };
};
