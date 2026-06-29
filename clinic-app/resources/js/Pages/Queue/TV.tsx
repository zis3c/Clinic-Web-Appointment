import React, { useEffect, useState, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';

export default function QueueTV({ queueData }: any) {
    const [hasStarted, setHasStarted] = useState(false);
    const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
    const [flashingDoctorId, setFlashingDoctorId] = useState<number | null>(null);
    const [isDarkMode, setIsDarkMode] = useState(true);
    const previousQueueDataRef = useRef<any>(queueData);

    const playDing = (ctx: AudioContext) => {
        try {
            if (ctx.state === 'suspended') {
                ctx.resume();
            }
            // First Ding
            const osc1 = ctx.createOscillator();
            const gain1 = ctx.createGain();
            osc1.type = 'sine';
            osc1.frequency.setValueAtTime(880, ctx.currentTime);
            osc1.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3);
            gain1.gain.setValueAtTime(0.8, ctx.currentTime);
            gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
            osc1.connect(gain1);
            gain1.connect(ctx.destination);
            osc1.start(ctx.currentTime);
            osc1.stop(ctx.currentTime + 0.3);

            // Second Dong
            const osc2 = ctx.createOscillator();
            const gain2 = ctx.createGain();
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(659.25, ctx.currentTime + 0.3); // E5
            osc2.frequency.exponentialRampToValueAtTime(329.63, ctx.currentTime + 0.8);
            gain2.gain.setValueAtTime(0.8, ctx.currentTime + 0.3);
            gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
            osc2.connect(gain2);
            gain2.connect(ctx.destination);
            osc2.start(ctx.currentTime + 0.3);
            osc2.stop(ctx.currentTime + 0.8);
        } catch (e) {
            console.error("Audio playback failed", e);
        }
    };

    useEffect(() => {
        if (window.Echo) {
            window.Echo.channel('queue')
                .listen('AppointmentUpdated', (e: any) => {
                    console.log('Queue update received:', e);
                    router.reload({ only: ['queueData'] });
                });
        }
        
        const interval = setInterval(() => {
            router.reload({ only: ['queueData'] });
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (!hasStarted || !audioContext) return;

        let newPatientCalled = false;
        let newlyCalledDoctorId: number | null = null;

        queueData.forEach((currentDoc: any) => {
            const prevDoc = previousQueueDataRef.current?.find((d: any) => d.doctor.id === currentDoc.doctor.id);
            const currentServingId = currentDoc.currently_serving?.id;
            const prevServingId = prevDoc?.currently_serving?.id;

            if (currentServingId && currentServingId !== prevServingId) {
                newPatientCalled = true;
                newlyCalledDoctorId = currentDoc.doctor.id;
            }
        });

        if (newPatientCalled && newlyCalledDoctorId) {
            playDing(audioContext);
            setFlashingDoctorId(newlyCalledDoctorId);
            
            setTimeout(() => {
                setFlashingDoctorId((prev) => (prev === newlyCalledDoctorId ? null : prev));
            }, 5000);
        }

        previousQueueDataRef.current = queueData;
    }, [queueData, hasStarted, audioContext]);

    const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    if (!hasStarted) {
        return (
            <div className={`min-h-screen ${isDarkMode ? 'dark bg-slate-900' : 'bg-gray-50'} flex flex-col items-center justify-center transition-colors duration-500 p-8 relative`}>
                <Head title="Start TV Display" />
                
                {/* Hidden Theme Toggle (Top Right Corner) */}
                <button 
                    onClick={() => setIsDarkMode(!isDarkMode)} 
                    className="absolute top-0 right-0 w-24 h-24 opacity-0 cursor-pointer z-50"
                    title="Toggle Theme"
                />

                <h1 className={`text-5xl font-extrabold mb-6 text-center tracking-tight drop-shadow-md ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Live Queue Display</h1>
                <p className={`text-xl mb-12 text-center max-w-lg leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    Browser security policies require a manual click to initialize the audio system.
                </p>
                <button 
                    onClick={() => {
                        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
                        setAudioContext(ctx);
                        setHasStarted(true);
                    }}
                    className="px-10 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-black text-2xl shadow-[0_0_30px_rgba(37,99,235,0.4)] transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(37,99,235,0.6)] z-10"
                >
                    Start TV Display Mode
                </button>
            </div>
        );
    }

    return (
        <div className={`min-h-screen font-sans overflow-hidden flex flex-col transition-colors duration-500 ${isDarkMode ? 'dark bg-slate-900 text-white' : 'bg-gray-100 text-slate-900'} relative`}>
            <Head title="Live Waiting Room" />
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
            `}} />

            {/* Hidden Theme Toggle (Top Right Corner of the Header) */}
            <button 
                onClick={() => setIsDarkMode(!isDarkMode)} 
                className="absolute top-0 right-0 w-32 h-32 opacity-0 cursor-pointer z-50"
                title="Toggle Theme"
            />

            {/* Header */}
            <div className={`backdrop-blur-md border-b p-6 flex justify-between items-center shadow-lg transition-colors duration-500 ${isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-white/80 border-gray-200'}`}>
                <div className="flex items-center gap-6 ml-4">
                    <div className="w-16 h-16 bg-gradient-to-tr from-teal-400 to-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-4xl shadow-md border border-blue-400/20">
                        +
                    </div>
                    <div>
                        <h1 className={`text-4xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Clinic Live Queue</h1>
                        <p className={`text-lg mt-1 flex items-center gap-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                            <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.7)]"></span>
                            Live Updates Active
                        </p>
                    </div>
                </div>
                <div className={`text-5xl font-bold tracking-tighter tabular-nums px-6 py-4 mr-4 z-10 pointer-events-none ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                    {currentTime}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-8 flex flex-col relative z-10">
                {queueData.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center">
                        <h2 className={`text-4xl font-bold ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Waiting Room is Empty</h2>
                        <p className={`text-xl mt-4 ${isDarkMode ? 'text-slate-600' : 'text-slate-500'}`}>No patients are currently checked in.</p>
                    </div>
                ) : (
                    <div className="w-full h-full flex flex-col gap-4">
                        <div className="flex-1 flex flex-col gap-4 content-start overflow-hidden pb-4 px-2 pt-2">
                            <AnimatePresence mode="popLayout">
                                {queueData.map((data: any) => {
                                    if (!data.currently_serving && (!data.waiting || data.waiting.length === 0)) return null;
                                    
                                    const currentNumber = data.currently_serving 
                                        ? data.currently_serving.appointment_number 
                                        : data.waiting[0]?.appointment_number;
                                    
                                    const isWaiting = !data.currently_serving;
                                    const isFlashing = flashingDoctorId === data.doctor.id;

                                    return (
                                        <motion.div
                                            key={data.doctor.id}
                                            layout
                                            initial={{ opacity: 0, x: -100, scale: 0.9 }}
                                            animate={{ opacity: 1, x: 0, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8, x: 100 }}
                                            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                                            className={`flex rounded-2xl border shadow-lg overflow-hidden transition-colors duration-300 h-24 ${
                                                isFlashing 
                                                    ? 'bg-emerald-100 border-emerald-400 dark:bg-emerald-900 dark:border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.5)] animate-[pulse_1s_infinite]' 
                                                    : (isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200')
                                            }`}
                                        >
                                            {/* Number Side */}
                                            <div className={`w-1/4 border-r flex flex-col items-center justify-center p-2 relative transition-colors duration-300 ${
                                                isFlashing 
                                                    ? 'bg-emerald-200/50 border-emerald-300/50 dark:bg-emerald-800/50 dark:border-emerald-500/50' 
                                                    : (isDarkMode ? 'bg-slate-900/50 border-slate-700' : 'bg-gray-50 border-gray-200')
                                            }`}>
                                                <span className={`text-[10px] uppercase font-bold tracking-widest absolute top-1 transition-colors duration-300 ${
                                                    isFlashing 
                                                        ? 'text-emerald-700 dark:text-emerald-200' 
                                                        : (isDarkMode ? 'text-slate-500' : 'text-gray-400')
                                                }`}>Ticket</span>
                                                <span className={`text-5xl mt-2 font-black tracking-tighter tabular-nums drop-shadow-md transition-colors duration-300 ${
                                                    isFlashing 
                                                        ? 'text-emerald-900 dark:text-white' 
                                                        : (isWaiting ? 'text-amber-500 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400')
                                                }`}>
                                                    #{currentNumber}
                                                </span>
                                            </div>
                                            
                                            {/* Room / Doctor Side */}
                                            <div className="w-3/4 flex items-center justify-between px-6">
                                                <h2 className={`text-3xl font-extrabold truncate drop-shadow-sm transition-colors duration-300 ${
                                                    isFlashing
                                                        ? 'text-emerald-900 dark:text-white'
                                                        : (isDarkMode ? 'text-white' : 'text-slate-800')
                                                }`}>Dr. {data.doctor.user.name}</h2>
                                                <p className={`text-sm font-bold uppercase tracking-widest px-4 py-1.5 rounded-lg border truncate transition-colors duration-300 ${
                                                    isFlashing 
                                                        ? 'bg-emerald-500/20 text-emerald-800 border-emerald-400/50 dark:text-emerald-100 dark:border-emerald-400/30' 
                                                        : 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400'
                                                }`}>
                                                    {data.doctor.specialty.name}
                                                </p>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Ticker / Marquee footer */}
            <div className="bg-blue-600 text-white py-3 overflow-hidden whitespace-nowrap shadow-xl mt-auto border-t border-blue-700 z-10 relative">
                <div className="inline-block animate-[marquee_40s_linear_infinite]">
                    <span className="text-xl font-medium tracking-wide mx-10">Welcome to JanjiCare Clinic! Please wait for your number to be called.</span>
                    <span className="text-xl font-medium tracking-wide mx-10">Ensure your mobile phones are on silent mode.</span>
                    <span className="text-xl font-medium tracking-wide mx-10">Please prepare your medical card or ID for verification.</span>
                    <span className="text-xl font-medium tracking-wide mx-10">If you experience severe symptoms, please notify the reception immediately.</span>
                    <span className="text-xl font-medium tracking-wide mx-10">Walk-in patients are accepted based on doctor availability.</span>
                    <span className="text-xl font-medium tracking-wide mx-10">Face masks are highly recommended inside the clinic premises.</span>
                    
                    {/* Duplicate the text to make the loop seamless */}
                    <span className="text-xl font-medium tracking-wide mx-10">Welcome to JanjiCare Clinic! Please wait for your number to be called.</span>
                    <span className="text-xl font-medium tracking-wide mx-10">Ensure your mobile phones are on silent mode.</span>
                    <span className="text-xl font-medium tracking-wide mx-10">Please prepare your medical card or ID for verification.</span>
                    <span className="text-xl font-medium tracking-wide mx-10">If you experience severe symptoms, please notify the reception immediately.</span>
                    <span className="text-xl font-medium tracking-wide mx-10">Walk-in patients are accepted based on doctor availability.</span>
                    <span className="text-xl font-medium tracking-wide mx-10">Face masks are highly recommended inside the clinic premises.</span>
                </div>
            </div>
        </div>
    );
}
