import { useRef, useState, FormEventHandler } from 'react';
import DangerButton from '@/Components/DangerButton';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { useForm } from '@inertiajs/react';

export default function LogoutOtherBrowserSessionsForm({ sessions, className = '' }: any) {
    const [confirmingLogout, setConfirmingLogout] = useState(false);
    const [targetSessionId, setTargetSessionId] = useState<string | null>(null);
    const passwordInput = useRef<HTMLInputElement>(null);

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        password: '',
    });

    const confirmLogout = (sessionId: string | null = null) => {
        setTargetSessionId(sessionId);
        setConfirmingLogout(true);
    };

    const logoutBrowserSessions: FormEventHandler = (e) => {
        e.preventDefault();

        const logoutRoute = targetSessionId 
            ? route('profile.sessions.destroySpecific', { id: targetSessionId })
            : route('profile.sessions.destroy');

        destroy(logoutRoute, {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current?.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingLogout(false);
        setTargetSessionId(null);
        clearErrors();
        reset();
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Browser Sessions</h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Manage and log out your active sessions on other browsers and devices.
                </p>
            </header>

            <div className="max-w-xl mt-6 text-sm text-gray-600 dark:text-gray-400">
                If necessary, you may log out of all of your other browser sessions across all of your devices. Some of your recent sessions are listed below; however, this list may not be exhaustive. If you feel your account has been compromised, you should also update your password.
            </div>

            {sessions.length > 0 && (
                <div className="mt-5 space-y-6">
                    {sessions.map((session: any, i: number) => (
                        <div key={i} className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div>
                                    {session.agent.is_desktop ? (
                                        <svg fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8 text-gray-500">
                                            <path d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                                        </svg>
                                    ) : (
                                        <svg fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8 text-gray-500">
                                            <path d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                                        </svg>
                                    )}
                                </div>

                                <div className="ml-3">
                                    <div className="text-sm text-gray-600 dark:text-gray-300">
                                        {session.agent.platform ? session.agent.platform : 'Unknown'} - {session.agent.browser ? session.agent.browser : 'Unknown'}
                                    </div>

                                    <div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            {session.ip_address},

                                            {session.is_current_device ? (
                                                <span className="text-green-500 font-semibold ml-1">This device</span>
                                            ) : (
                                                <span className="ml-1">Last active {session.last_active}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {!session.is_current_device && (
                                <button
                                    className="text-sm text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 font-medium"
                                    onClick={() => confirmLogout(session.id)}
                                >
                                    Log Out
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <div className="flex items-center mt-5">
                <DangerButton onClick={() => confirmLogout()}>
                    Log Out Other Browser Sessions
                </DangerButton>
            </div>

            <Modal show={confirmingLogout} onClose={closeModal}>
                <form onSubmit={logoutBrowserSessions} className="p-6 dark:bg-slate-800">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                        {targetSessionId 
                            ? 'Are you sure you want to log out of this specific session?'
                            : 'Are you sure you want to log out of your other browser sessions?'}
                    </h2>

                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        {targetSessionId 
                            ? 'Please enter your password to confirm you would like to log out of this specific session.'
                            : 'Please enter your password to confirm you would like to log out of your other browser sessions across all of your devices.'}
                    </p>

                    <div className="mt-6">
                        <InputLabel htmlFor="password" value="Password" className="sr-only" />

                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            className="mt-1 block w-3/4"
                            isFocused
                            placeholder="Password"
                        />

                        <InputError message={errors.password} className="mt-2" />
                    </div>

                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={closeModal}>Cancel</SecondaryButton>

                        <DangerButton className="ms-3" disabled={processing}>
                            {targetSessionId ? 'Log Out Session' : 'Log Out Other Browser Sessions'}
                        </DangerButton>
                    </div>
                </form>
            </Modal>
        </section>
    );
}
