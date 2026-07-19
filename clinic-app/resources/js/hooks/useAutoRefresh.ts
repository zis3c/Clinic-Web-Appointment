import { useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';

interface AutoRefreshOptions {
    /** The public broadcast channel to listen on. Default: 'queue' */
    channel?: string;
    /** Polling interval in ms as a fallback. 0 = disabled. Default: 30000 */
    pollingInterval?: number;
    /** Whether to skip the Echo listener (only use polling). Default: false */
    pollingOnly?: boolean;
}

/**
 * useAutoRefresh — attaches to the existing Laravel Echo 'queue' channel
 * and calls router.reload({ only: dataKeys }) whenever an AppointmentUpdated
 * event fires. Also sets up an optional polling fallback.
 *
 * Usage:
 *   useAutoRefresh(['appointments', 'stats']);
 *   useAutoRefresh(['doctors'], { pollingOnly: true });
 */
export function useAutoRefresh(
    dataKeys: string[],
    options: AutoRefreshOptions = {},
): void {
    const {
        channel = 'queue',
        pollingInterval = 30_000,
        pollingOnly = false,
    } = options;

    // Keep stable references so the effects don't re-run on every render
    const dataKeysRef = useRef(dataKeys);
    dataKeysRef.current = dataKeys;

    // Track whether a reload is already in-flight to avoid overlapping requests
    const reloadingRef = useRef(false);

    const doReload = () => {
        if (reloadingRef.current) return;
        reloadingRef.current = true;
        router.reload({
            only: dataKeysRef.current,
            onFinish: () => {
                reloadingRef.current = false;
            },
        });
    };

    // ── WebSocket listener ────────────────────────────────────────────────────
    useEffect(() => {
        if (pollingOnly || !window.Echo) return;

        const echoChannel = window.Echo.channel(channel);

        // Listen to the AppointmentUpdated broadcast event name
        echoChannel.listen('.App\\Events\\AppointmentUpdated', doReload);

        // Also handle the generic 'queue.updated' shape that some pages use
        echoChannel.listen('AppointmentUpdated', doReload);

        return () => {
            try {
                echoChannel.stopListening('.App\\Events\\AppointmentUpdated');
                echoChannel.stopListening('AppointmentUpdated');
                // Don't leave the channel — other components may still need it
            } catch {
                // Silently ignore cleanup errors
            }
        };
     
    }, [channel, pollingOnly]);

    // ── Polling fallback ──────────────────────────────────────────────────────
    useEffect(() => {
        if (!pollingInterval || pollingInterval <= 0) return;

        const timer = setInterval(doReload, pollingInterval);

        return () => clearInterval(timer);
     
    }, [pollingInterval]);
}
