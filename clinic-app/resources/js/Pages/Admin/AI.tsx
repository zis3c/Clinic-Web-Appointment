import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import SidebarLayout from '@/Layouts/SidebarLayout';
import { Save, ShieldAlert, Cpu, Eye, EyeOff, Loader2, Terminal, Trash2 } from 'lucide-react';
import axios from 'axios';

type LogMessage = { id: number; time: string; message: string; type: 'info' | 'success' | 'error' };

export default function AI({ auth, aiProviderApiKey }: any) {
    const [showKey, setShowKey] = useState(false);
    const [isTesting, setIsTesting] = useState(false);
    const [consoleLogs, setConsoleLogs] = useState<LogMessage[]>([]);
    const [aiStatus, setAiStatus] = useState<'unknown' | 'online' | 'offline'>('unknown');

    const addLog = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
        const time = new Date().toLocaleTimeString('en-US', { hour12: false });
        setConsoleLogs(prev => [...prev, { id: Date.now() + Math.random(), time, message, type }]);
    };

    const { data, setData, post, processing, errors } = useForm({
        ai_provider_api_key: aiProviderApiKey || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.ai.update'));
    };

    return (
        <SidebarLayout 
            user={auth.user}
            header={<h2 className="font-semibold text-2xl text-gray-800 dark:text-slate-100 leading-tight">AI Configuration</h2>}
        >
            <Head title="AI Configuration" />

            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white dark:bg-slate-800 p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 transition-all gap-4 md:gap-0">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 dark:text-slate-100">AI Configuration</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Configure global AI features and API keys for the JanjiCare assistant.</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden transition-all">
                    <div className="p-4 sm:p-5">
                        <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-700 pb-4 mb-5">
                            <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/40 rounded-xl flex items-center justify-center border border-teal-200 dark:border-teal-700/50 shadow-inner">
                                <Cpu className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">API Settings</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Manage connections to external AI models.</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="max-w-3xl space-y-4">
                            {/* Hidden username field to prevent browser DOM warnings for password forms */}
                            <input type="text" name="username" autoComplete="username" className="hidden" aria-hidden="true" />
                            
                            <div>
                                <label htmlFor="ai_provider_api_key" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                    AI Provider API Key
                                </label>
                                <div className="relative group/input mt-2">
                                    <style>{`
                                        @keyframes slide-gradient {
                                            0% { background-position: 0% 50%; }
                                            50% { background-position: 100% 50%; }
                                            100% { background-position: 0% 50%; }
                                        }
                                        .ai-gradient-ring {
                                            background: linear-gradient(90deg, #14b8a6, #0ea5e9, #14b8a6);
                                            background-size: 200% 200%;
                                            animation: slide-gradient 3s ease infinite;
                                        }
                                    `}</style>
                                    <div className="absolute -inset-[2px] rounded-xl opacity-0 group-focus-within/input:opacity-100 blur-[2px] transition-opacity duration-500 ai-gradient-ring"></div>
                                    <div className="relative z-10">
                                        <input
                                            type={showKey ? "text" : "password"}
                                            id="ai_provider_api_key"
                                            value={data.ai_provider_api_key}
                                            onChange={(e) => setData('ai_provider_api_key', e.target.value)}
                                            autoComplete="new-password"
                                            className="px-3 pr-10 block w-full rounded-xl border-slate-300 dark:border-slate-600 bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-white focus:border-transparent focus:ring-0 sm:text-sm py-2 shadow-sm backdrop-blur-sm transition-colors"
                                            placeholder="Enter your API key..."
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowKey(!showKey)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none transition-colors"
                                        >
                                            {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                                {errors.ai_provider_api_key && <p className="mt-1.5 text-sm text-rose-500">{errors.ai_provider_api_key}</p>}
                                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-start gap-1.5">
                                    <ShieldAlert className="w-3.5 h-3.5 mt-0.5 text-amber-500 shrink-0" />
                                    This key allows the chatbot on the landing page and patient dashboard to generate medical triage responses. Keep this key secure and never share it.
                                </p>
                            </div>

                            <div className="pt-4 border-t border-slate-100 dark:border-slate-700/50 flex flex-col sm:flex-row gap-3 items-center">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-gradient-to-r from-teal-500 to-blue-600 hover:shadow-lg hover:shadow-teal-500/20 hover:scale-[1.02] outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                                >
                                    <Save className="w-4 h-4" />
                                    {processing ? 'Saving...' : 'Save Settings'}
                                </button>
                                
                                <button
                                    type="button"
                                    disabled={isTesting || !data.ai_provider_api_key}
                                    onClick={async () => {
                                        if(!data.ai_provider_api_key) {
                                            window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: "Please enter an API key first.", type: 'error' } }));
                                            return;
                                        }
                                        setIsTesting(true);
                                        addLog('Initiating connection test...', 'info');
                                        addLog('Pinging AI provider endpoint...', 'info');
                                        try {
                                            const response = await axios.post(route('admin.ai.test'), { 
                                                api_key: data.ai_provider_api_key
                                            });
                                            addLog(response.data.message, 'success');
                                            setAiStatus('online');
                                            window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: response.data.message, type: 'success' } }));
                                        } catch (error: any) {
                                            const msg = error.response?.data?.message || "Failed to connect to the AI provider.";
                                            addLog(msg, 'error');
                                            setAiStatus('offline');
                                            window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: msg, type: 'error' } }));
                                        } finally {
                                            setIsTesting(false);
                                        }
                                    }}
                                    className="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg shadow-sm text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 hover:scale-[1.02] outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                                >
                                    {isTesting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Cpu className="w-4 h-4" />}
                                    {isTesting ? 'Testing...' : 'Test Connection'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Terminal UI (Separated from Settings Box) */}
                <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800 shadow-sm flex flex-col transition-all">
                    <div className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700 px-3 py-2 flex items-center justify-between select-none">
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                            <Terminal className="w-4 h-4" />
                            <span className="text-xs font-semibold tracking-wider uppercase">Connection Logs</span>
                        </div>
                        <div className="flex items-center gap-4">
                            {/* AI Status Indicator */}
                            <div className="flex items-center justify-center gap-2 px-3 py-1 bg-white dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 shadow-sm">
                                <div className={`w-2 h-2 rounded-full shrink-0 -translate-y-[0.5px] ${
                                    aiStatus === 'online' ? 'bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.8)] animate-pulse' : 
                                    aiStatus === 'offline' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]' : 
                                    'bg-slate-300 dark:bg-slate-600'
                                }`}></div>
                                <span className="text-[10px] font-bold tracking-widest uppercase text-slate-600 dark:text-slate-300 relative top-[0.5px]">
                                    {aiStatus === 'online' ? 'AI Online' : aiStatus === 'offline' ? 'AI Offline' : 'AI Unknown'}
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setConsoleLogs([])}
                                className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
                                title="Clear logs"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                            <div className="p-3 h-32 overflow-y-auto font-mono text-xs space-y-1.5">
                                {consoleLogs.length === 0 ? (
                                    <div className="text-slate-400 dark:text-slate-600 italic">No logs available. Click 'Test Connection' to begin.</div>
                                ) : (
                                    consoleLogs.map(log => (
                                        <div key={log.id} className="flex gap-3">
                                            <span className="text-slate-400 dark:text-slate-500 shrink-0">[{log.time}]</span>
                                            <span className={`${
                                                log.type === 'success' ? 'text-teal-600 dark:text-teal-400' :
                                                log.type === 'error' ? 'text-rose-600 dark:text-rose-400' :
                                                'text-slate-700 dark:text-slate-300'
                                            }`}>
                                                {log.message}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
            </div>
        </SidebarLayout>
    );
}
