import { useEffect } from 'react';
import { usePage, router } from '@inertiajs/react';

export default function SessionTimeout() {
    const { auth } = usePage().props as any;
    
    useEffect(() => {
        // Only run if user is authenticated
        if (!auth.user) return;

        let timeoutId: NodeJS.Timeout;

        // 15 minutes inactivity timeout
        const TIMEOUT_DURATION = 15 * 60 * 1000;

        const handleIdle = () => {
            // Automatically log out due to inactivity
            router.post(route('logout'), {}, {
                onSuccess: () => {
                    // Optional: could redirect to login with a specific query string
                    window.location.href = route('login') + '?inactivity=1';
                }
            });
        };

        const resetTimer = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(handleIdle, TIMEOUT_DURATION);
        };

        // Events that qualify as activity
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];

        events.forEach(event => {
            document.addEventListener(event, resetTimer, { passive: true });
        });

        // Initialize the first timer
        resetTimer();

        return () => {
            clearTimeout(timeoutId);
            events.forEach(event => {
                document.removeEventListener(event, resetTimer);
            });
        };
    }, [auth.user]);

    return null;
}
