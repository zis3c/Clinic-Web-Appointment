import { Transition } from '@headlessui/react';
import { usePage } from '@inertiajs/react';
import { useState, useEffect, Fragment, useRef } from 'react';

export default function Toast() {
    const { flash } = usePage<any>().props;
    const [show, setShow] = useState(false);
    const [message, setMessage] = useState('');
    const [type, setType] = useState('success');

    // Undo feature states
    const [undoData, setUndoData] = useState<{ onConfirm: () => void; onUndo: () => void } | null>(null);
    const [progress, setProgress] = useState(100);

    const timerRef = useRef<any>(null);
    const intervalRef = useRef<any>(null);

    const clearTimers = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        if (intervalRef.current) clearInterval(intervalRef.current);
    };

    useEffect(() => {
        if (flash?.success) {
            clearTimers();
            setUndoData(null);
            setMessage(flash.success);
            setType('success');
            setShow(true);
            timerRef.current = setTimeout(() => setShow(false), 4000);
        } else if (flash?.error) {
            clearTimers();
            setUndoData(null);
            setMessage(flash.error);
            setType('error');
            setShow(true);
            timerRef.current = setTimeout(() => setShow(false), 4000);
        }

        return () => clearTimers();
    }, [flash]);

    useEffect(() => {
        const handleUndoToast = (e: CustomEvent) => {
            const { message: msg, onConfirm, onUndo, duration = 6000 } = e.detail;
            clearTimers();
            setMessage(msg);
            setType('undo');
            setUndoData({ onConfirm, onUndo });
            setProgress(100);
            setShow(true);

            const startTime = Date.now();

            // Progress tick
            intervalRef.current = setInterval(() => {
                const elapsed = Date.now() - startTime;
                const pct = Math.max(0, 100 - (elapsed / duration) * 100);
                setProgress(pct);
                if (pct <= 0) {
                    if (intervalRef.current) clearInterval(intervalRef.current);
                }
            }, 30);

            // Auto-confirm execution
            timerRef.current = setTimeout(() => {
                setShow(false);
                onConfirm();
                setUndoData(null);
            }, duration);
        };

        const handleGenericToast = (e: CustomEvent) => {
            const { message: msg, type: t = 'success' } = e.detail;
            clearTimers();
            setUndoData(null);
            setMessage(msg);
            setType(t);
            setShow(true);
            timerRef.current = setTimeout(() => setShow(false), 4000);
        };

        window.addEventListener('show-undo-toast' as any, handleUndoToast);
        window.addEventListener('show-toast' as any, handleGenericToast);
        return () => {
            window.removeEventListener('show-undo-toast' as any, handleUndoToast);
            window.removeEventListener('show-toast' as any, handleGenericToast);
            clearTimers();
        };
    }, []);

    const handleUndoClick = () => {
        if (undoData) {
            clearTimers();
            setShow(false);
            undoData.onUndo();
            setUndoData(null);
        }
    };

    const handleCloseClick = () => {
        clearTimers();
        setShow(false);
        if (undoData) {
            undoData.onConfirm();
            setUndoData(null);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none">
            <Transition
                show={show}
                as={Fragment}
                enter="transform ease-out duration-300 transition"
                enterFrom="translate-y-4 opacity-0 sm:translate-y-0 sm:translate-x-4"
                enterTo="translate-y-0 opacity-100 sm:translate-x-0"
                leave="transition ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
            >
                <div className="pointer-events-auto w-[400px] max-w-[calc(100vw-3rem)] overflow-hidden rounded-2xl bg-gray-100 dark:bg-slate-800 shadow-2xl border border-gray-200 dark:border-slate-700 ring-1 ring-black ring-opacity-5 dark:ring-white/10">
                    <div className="p-5">
                        <div className="flex items-start">
                            <div className="flex-shrink-0 mt-0.5">
                                {type === 'success' ? (
                                    <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shadow-sm">
                                        <svg className="h-5.5 w-5.5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                ) : type === 'error' ? (
                                    <div className="w-9 h-9 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center shadow-sm">
                                        <svg className="h-5.5 w-5.5 text-rose-600 dark:text-rose-400" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </div>
                                ) : (
                                    <div className="w-9 h-9 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center shadow-sm relative overflow-hidden">
                                        <svg className="h-5 w-5 text-rose-600 dark:text-rose-400 animate-pulse" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                            <div className="ml-3.5 flex-1 min-w-0 pt-0.5">
                                <p className="text-sm font-extrabold text-gray-900 dark:text-white">
                                    {type === 'success' ? 'Success!' : type === 'error' ? 'Action Failed' : 'Item Deleted'}
                                </p>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 font-semibold break-words whitespace-normal leading-relaxed">{message}</p>

                                {type === 'undo' && (
                                    <div className="mt-4 space-y-3.5">
                                        {/* Cylindrical / 3D capsule gauge UI */}
                                        <div className="relative w-full h-3 bg-gray-150 dark:bg-slate-800 rounded-full border border-gray-200/50 dark:border-slate-700 shadow-[inner_0_2px_4px_rgba(0,0,0,0.06)] overflow-hidden flex items-center">
                                            {/* Reflective light glaze on the glass cylinder */}
                                            <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent pointer-events-none z-10"></div>
                                            {/* Dynamic color changing 3D cylinder gauge */}
                                            <div
                                                className="h-full rounded-full bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500 shadow-[inset_0_2px_4px_rgba(255,255,255,0.4),_0_0_10px_rgba(244,63,94,0.3)] transition-all duration-75 ease-linear"
                                                style={{ width: `${progress}%` }}
                                            ></div>
                                        </div>

                                        <div className="flex justify-between items-center">
                                            <span className="text-[11px] font-bold text-gray-400 dark:text-gray-500 capitalize tracking-wider">
                                                Auto-saving in {Math.ceil((progress / 100) * 6)}s...
                                            </span>
                                            <button
                                                onClick={handleUndoClick}
                                                className="px-4 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-black rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all cursor-pointer"
                                            >
                                                Undo Action
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="ml-4 flex flex-shrink-0">
                                <button
                                    type="button"
                                    className="inline-flex rounded-full bg-gray-50 dark:bg-slate-800 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 outline-none transition-all cursor-pointer"
                                    onClick={handleCloseClick}
                                >
                                    <span className="sr-only">Close</span>
                                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </Transition>
        </div>
    );
}

