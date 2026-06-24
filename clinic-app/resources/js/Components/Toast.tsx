import { Transition } from '@headlessui/react';
import { usePage } from '@inertiajs/react';
import { useState, useEffect, Fragment } from 'react';

export default function Toast() {
    const { flash } = usePage<any>().props;
    const [show, setShow] = useState(false);
    const [message, setMessage] = useState('');
    const [type, setType] = useState('success');

    useEffect(() => {
        if (flash?.success) {
            setMessage(flash.success);
            setType('success');
            setShow(true);
            const timer = setTimeout(() => setShow(false), 4000);
            return () => clearTimeout(timer);
        }
        if (flash?.error) {
            setMessage(flash.error);
            setType('error');
            setShow(true);
            const timer = setTimeout(() => setShow(false), 4000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

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
                <div className="pointer-events-auto w-[380px] max-w-[calc(100vw-3rem)] overflow-hidden rounded-2xl bg-white shadow-2xl border border-gray-100 ring-1 ring-black ring-opacity-5">
                    <div className="p-4">
                        <div className="flex items-start">
                            <div className="flex-shrink-0 mt-0.5">
                                {type === 'success' ? (
                                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                                        <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center">
                                        <svg className="h-5 w-5 text-rose-600" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                            <div className="ml-3 flex-1 min-w-0 pt-0.5">
                                <p className={`text-sm font-extrabold ${type === 'success' ? 'text-gray-900' : 'text-gray-900'}`}>
                                    {type === 'success' ? 'Success!' : 'Action Failed'}
                                </p>
                                <p className="mt-1 text-sm text-gray-500 font-medium break-words whitespace-normal">{message}</p>
                            </div>
                            <div className="ml-4 flex flex-shrink-0">
                                <button
                                    type="button"
                                    className="inline-flex rounded-full bg-gray-50 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none transition-colors"
                                    onClick={() => setShow(false)}
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
