import { useState, useEffect, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
import {
    LiveKitRoom,
    RoomAudioRenderer,
    ControlBar,
    GridLayout,
    ParticipantTile,
    useTracks,
    DisconnectButton,
    useParticipants,
    useRoomContext,
    Chat,
    useChat,
} from '@livekit/components-react';
import { Track, RoomEvent } from 'livekit-client';
import '@livekit/components-styles';

// ── Room Sound Notifiers ───────────────────────────────────────────────────────
// Plays sounds for participant join, leave, and chat messages.
function RoomSoundNotifiers() {
    const room = useRoomContext();

    useEffect(() => {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtx) return;
        
        let ctx: AudioContext | null = null;
        const getCtx = () => {
            if (!ctx) ctx = new AudioCtx();
            if (ctx.state === 'suspended') ctx.resume();
            return ctx;
        };

        const playNote = (freq: number, startTime: number, duration: number, type: OscillatorType = 'sine') => {
            const context = getCtx();
            const osc = context.createOscillator();
            const gain = context.createGain();
            osc.connect(gain);
            gain.connect(context.destination);
            osc.type = type;
            osc.frequency.setValueAtTime(freq, startTime);
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(0.2, startTime + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
            osc.start(startTime);
            osc.stop(startTime + duration);
        };

        const playJoinChime = () => {
            try {
                const now = getCtx().currentTime;
                playNote(523.25, now, 0.5);         // C5
                playNote(659.25, now + 0.15, 0.6);  // E5
                playNote(783.99, now + 0.3, 0.8);   // G5
            } catch {
                // Ignore audio play errors
            }
        };

        const playLeaveChime = () => {
            try {
                const now = getCtx().currentTime;
                playNote(783.99, now, 0.5);         // G5
                playNote(659.25, now + 0.15, 0.6);  // E5
                playNote(523.25, now + 0.3, 0.8);   // C5
            } catch {
                // Ignore audio play errors
            }
        };



        room.on(RoomEvent.ParticipantConnected, playJoinChime);
        room.on(RoomEvent.ParticipantDisconnected, playLeaveChime);

        return () => {
            room.off(RoomEvent.ParticipantConnected, playJoinChime);
            room.off(RoomEvent.ParticipantDisconnected, playLeaveChime);
        };
    }, [room]);

    // Chat notifier
    const { chatMessages } = useChat();
    const prevChatCount = useRef(0);
    const isFirstRender = useRef(true);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            if (chatMessages) prevChatCount.current = chatMessages.length;
            return;
        }

        if (chatMessages && chatMessages.length > prevChatCount.current) {
            // A new message arrived or was sent
            try {
                const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
                if (AudioCtx) {
                    const ctx = new AudioCtx();
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(600, ctx.currentTime);
                    osc.frequency.setValueAtTime(800, ctx.currentTime + 0.1);
                    gain.gain.setValueAtTime(0, ctx.currentTime);
                    gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.01);
                    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
                    osc.start(ctx.currentTime);
                    osc.stop(ctx.currentTime + 0.25);
                }
            } catch {
                // Ignore audio play errors
            }
            prevChatCount.current = chatMessages.length;
        }
    }, [chatMessages]);

    return null;
}

// ── Network Latency Indicator ─────────────────────────────────────────────────
function NetworkIndicator() {
    const [ping, setPing] = useState<number | null>(null);

    useEffect(() => {
        let mounted = true;
        
        const checkPing = async () => {
            const start = performance.now();
            try {
                // Fetch a tiny static file with cache-busting to measure true round-trip time
                await fetch('/favicon.ico?_cb=' + Date.now(), { method: 'HEAD', cache: 'no-store' });
                if (mounted) {
                    setPing(Math.round(performance.now() - start));
                }
            } catch {
                // Fail silently
            }
        };

        checkPing();
        // Ping every 1 second for a true real-time feel
        const interval = setInterval(checkPing, 1000);
        
        return () => {
            mounted = false;
            clearInterval(interval);
        };
    }, []);

    if (ping === null) return null;

    let color = "text-emerald-500";
    if (ping > 150) color = "text-amber-500";
    if (ping > 300) color = "text-rose-500";

    return (
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-100/80 dark:bg-slate-800/80 rounded-lg border border-gray-200 dark:border-slate-700/50 backdrop-blur-md transition-colors" title="Network Latency">
            <svg className={`w-3.5 h-3.5 ${color} transition-colors duration-300`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.142 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
            </svg>
            <span className="text-[10px] font-bold text-gray-700 dark:text-slate-300 w-9 text-right tabular-nums">
                {ping}
            </span>
            <span className="text-[10px] text-gray-400 dark:text-slate-500 font-medium">ms</span>
        </div>
    );
}

// ── Participant Presence Banner ───────────────────────────────────────────────
// Shows a waiting banner when the counterpart has not yet joined the room.
function ParticipantPresence({ isDoctor, counterpartName }: { isDoctor: boolean; counterpartName: string }) {
    const participants = useParticipants();
    const hasCounterpart = participants.length >= 2;
    const [notification, setNotification] = useState<'joined' | 'left' | null>(null);
    const prevCount = useRef(participants.length);

    useEffect(() => {
        // If someone joins (and it's not the initial load of the local user alone)
        if (participants.length > prevCount.current && participants.length >= 2) {
            setNotification('joined');
            const timer = setTimeout(() => setNotification(null), 3500);
            prevCount.current = participants.length;
            return () => clearTimeout(timer);
        } 
        // If someone leaves
        else if (participants.length < prevCount.current && prevCount.current >= 2) {
            setNotification('left');
            const timer = setTimeout(() => setNotification(null), 3500);
            prevCount.current = participants.length;
            return () => clearTimeout(timer);
        }
        
        prevCount.current = participants.length;
    }, [participants.length]);

    const glassClasses = "flex items-center gap-3 bg-white/70 sm:bg-white/10 dark:bg-slate-950/20 backdrop-blur-xl text-slate-900 dark:text-white px-5 py-3 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.1)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] text-sm font-medium";

    const isJoined = notification === 'joined';
    const isLeft = notification === 'left';
    const isWaiting = !hasCounterpart && !isLeft;

    return (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex justify-center pointer-events-none">
            
            {/* Joined Banner */}
            <div className={`transition-all duration-500 ease-in-out absolute ${isJoined ? 'opacity-100' : 'opacity-0'}`}>
                <div className={glassClasses}>
                    <span className="relative flex h-2.5 w-2.5 shrink-0">
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                    </span>
                    <span className="text-slate-700 dark:text-slate-200 whitespace-nowrap">
                        {isDoctor
                            ? <><span className="font-bold text-slate-900 dark:text-white">{counterpartName}</span> has joined the call</>
                            : <><span className="font-bold text-slate-900 dark:text-white">Dr. {counterpartName}</span> is ready</>}
                    </span>
                </div>
            </div>

            {/* Left Banner */}
            <div className={`transition-all duration-500 ease-in-out absolute ${isLeft ? 'opacity-100' : 'opacity-0'}`}>
                <div className={glassClasses}>
                    <span className="relative flex h-2.5 w-2.5 shrink-0">
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
                    </span>
                    <span className="text-slate-700 dark:text-slate-200 whitespace-nowrap">
                        {isDoctor
                            ? <><span className="font-bold text-slate-900 dark:text-white">{counterpartName}</span> has left the call</>
                            : <><span className="font-bold text-slate-900 dark:text-white">Dr. {counterpartName}</span> has left the call</>}
                    </span>
                </div>
            </div>

            {/* Waiting Banner */}
            <div className={`transition-all duration-500 ease-in-out absolute ${isWaiting ? 'opacity-100' : 'opacity-0'}`}>
                <div className={glassClasses}>
                    <span className="relative flex h-2.5 w-2.5 shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400" />
                    </span>
                    <span className="text-slate-700 dark:text-slate-200 whitespace-nowrap">
                        {isDoctor
                            ? <>Waiting for <span className="font-bold text-slate-900 dark:text-white">{counterpartName}</span> to join…</>
                            : <>Waiting for <span className="font-bold text-slate-900 dark:text-white">Dr. {counterpartName}</span> to join…</>}
                    </span>
                </div>
            </div>

        </div>
    );
}

// ── Live Video Layout ─────────────────────────────────────────────────────────
function CustomVideoConference({ isDoctor, counterpartName, onLeave }: { isDoctor: boolean; counterpartName: string; onLeave: () => void }) {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            if (containerRef.current) {
                containerRef.current.requestFullscreen().catch(e => console.error(e));
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    };

    const tracks = useTracks(
        [
            { source: Track.Source.Camera, withPlaceholder: true },
            { source: Track.Source.ScreenShare, withPlaceholder: false },
        ],
        { onlySubscribed: false },
    );

    return (
        <div className="relative w-full h-full bg-black flex flex-col" ref={containerRef}>
            <div className="flex-1 w-full min-h-0 relative overflow-hidden">
                <GridLayout tracks={tracks} style={{ height: '100%', width: '100%' }}>
                    <ParticipantTile />
                </GridLayout>
                {/* Participant presence / join notification banner */}
                <ParticipantPresence isDoctor={isDoctor} counterpartName={counterpartName} />
            </div>

            {/* Controls: Docked on mobile, floating on desktop */}
            <div className="w-full sm:w-auto shrink-0 bg-black/90 sm:bg-transparent pt-2 pb-safe px-2 sm:p-0 sm:absolute sm:bottom-6 sm:left-1/2 sm:-translate-x-1/2 z-50">
                <div className="flex flex-wrap justify-center items-center max-w-full">
                    <div className="bg-transparent sm:bg-slate-900/40 sm:dark:bg-black/10 sm:backdrop-blur-xl px-2 sm:px-3 py-1 sm:py-2 rounded-2xl flex flex-wrap justify-center items-center gap-2 max-w-full sm:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] sm:dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] transition-all duration-300">
                        <ControlBar
                            variation="minimal"
                            controls={{ camera: true, microphone: true, screenShare: true, chat: false, leave: false }}
                            className="!bg-transparent !shadow-none !border-none flex-wrap justify-center"
                        />
                        <div className="hidden sm:block w-px h-8 bg-white/20 mx-1 shrink-0" />
                        <div className="flex items-center gap-2 shrink-0">
                            <div className="lk-control-bar !bg-transparent !shadow-none !border-none !p-0" data-lk-variation="minimal">
                                <div className="lk-button-group">
                                    <button 
                                        onClick={toggleFullscreen}
                                        className="lk-button"
                                        title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                                        aria-pressed={isFullscreen}
                                    >
                                        {isFullscreen ? (
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20V15H4m6 0h10M15 4v5h5m-6 0H4" />
                                            </svg>
                                        ) : (
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>
                            <DisconnectButton className="!bg-red-500/90 hover:!bg-red-500 !text-white !rounded-xl !p-2 !transition-all hover:scale-105 active:scale-95 !shadow-lg" title="Leave" onClick={onLeave}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                            </DisconnectButton>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Room({ appointment, isDoctor, user, livekitUrl, livekitToken }: any) {
    const [_isJoined, setIsJoined] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.innerWidth >= 1024;
        }
        return true;
    });
    const [sidebarTab, setSidebarTab] = useState<'info' | 'chat'>('chat');
    
    // Sidebar resizer state
    const [sidebarWidth, setSidebarWidth] = useState(320);
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging) return;
            const newWidth = document.body.clientWidth - e.clientX;
            if (newWidth > 250 && newWidth < 600) setSidebarWidth(newWidth);
        };
        const handleMouseUp = () => {
            setIsDragging(false);
            document.body.style.userSelect = '';
        };
        if (isDragging) {
            document.body.style.userSelect = 'none';
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            document.body.style.userSelect = '';
        };
    }, [isDragging]);

    const previewMode = !livekitToken;

    const fmt12 = (time: string) => {
        if (!time) return '';
        const [h, m] = time.split(':');
        const hour = parseInt(h);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        return `${hour % 12 || 12}:${m} ${ampm}`;
    };

    const handleLeaveRoom = () => {
        const dashboardRoute = isDoctor ? route('doctor.dashboard') : route('patient.dashboard');
        router.visit(dashboardRoute);
    };

    const fmtDate = (d: string) =>
        new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

    const counterpartName  = isDoctor ? appointment.patient.user.name : `Dr. ${appointment.schedule.doctor.user.name}`;
    const counterpartInit  = counterpartName.charAt(0).toUpperCase();
    const counterpartAvatar = !isDoctor ? appointment.schedule.doctor.user?.avatar : null;

    const MockBtn = ({ path, label }: { path: string; label: string }) => (
        <button title={label} className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700/50 flex items-center justify-center text-slate-300 hover:text-white transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={path} />
            </svg>
        </button>
    );

    const sidebarElement = (
        <aside
            style={{ width: sidebarOpen ? sidebarWidth : 0, height: '100%' }} 
            className={`flex flex-col bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border-l border-gray-200 dark:border-white/5 flex-shrink-0 absolute right-0 top-0 bottom-0 z-50 lg:static max-w-full ${isDragging ? '' : 'transition-all duration-300'} ${sidebarOpen ? 'w-full sm:w-auto shadow-2xl lg:shadow-none' : 'w-0 overflow-hidden border-none'}`}
        >
            <div className="absolute left-0 top-0 bottom-0 w-2 hover:bg-blue-500/20 cursor-col-resize z-50" onMouseDown={() => setIsDragging(true)} />
            {sidebarOpen && (
                <div className="flex flex-col h-full overflow-hidden">
                    <div className="flex border-b border-gray-200 dark:border-white/5 p-2 gap-1 shrink-0">
                        <button onClick={() => setSidebarTab('info')} className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${sidebarTab === 'info' ? 'bg-gray-200 dark:bg-white/10 text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white'}`}>Info</button>
                        <button onClick={() => setSidebarTab('chat')} className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${sidebarTab === 'chat' ? 'bg-gray-200 dark:bg-white/10 text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white'}`}>Chat</button>
                    </div>
                    <div className={`flex-1 flex flex-col min-h-0 ${sidebarTab === 'info' ? 'overflow-y-auto custom-scrollbar' : 'overflow-hidden'}`}>
                        {sidebarTab === 'info' ? (
                            <div className="p-5 flex flex-col gap-5">

                                {/* Counterpart card */}
                                <div className="bg-gray-100 dark:bg-slate-800/50 rounded-2xl border border-gray-200 dark:border-slate-700/40 p-5 flex flex-col items-center text-center">
                                    <div className="relative mb-3">
                                        {counterpartAvatar ? (
                                            <img src={`/storage/${counterpartAvatar}`} alt={counterpartName} className="w-16 h-16 rounded-full object-cover border-2 border-gray-300 dark:border-slate-600" />
                                        ) : (
                                            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-black border-2 border-gray-300 dark:border-slate-700">
                                                {counterpartInit}
                                            </div>
                                        )}
                                        <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
                                    </div>
                                    <p className="text-gray-900 dark:text-white font-bold text-sm">{counterpartName}</p>
                                    <p className="text-gray-500 dark:text-slate-400 text-xs mt-0.5">
                                        {isDoctor ? 'Patient' : (appointment.schedule.doctor.specialty?.name || 'Doctor')}
                                    </p>
                                    {!isDoctor && (
                                        <span className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-600 dark:text-teal-400 text-[10px] font-bold">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                            </svg>
                                            Verified Doctor
                                        </span>
                                    )}
                                </div>

                                {/* Session metadata */}
                                <div className="bg-gray-50 dark:bg-slate-800/30 rounded-2xl border border-gray-200 dark:border-slate-700/30 p-4 space-y-4">
                                    <p className="text-gray-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest">Session Info</p>

                                    {[
                                        {
                                            color: 'text-teal-500 dark:text-teal-400',
                                            icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
                                            label: 'Date',
                                            value: fmtDate(appointment.date),
                                        },
                                        ...(appointment.time_slot ? [{
                                            color: 'text-blue-500 dark:text-blue-400',
                                            icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
                                            label: 'Time Slot',
                                            value: fmt12(appointment.time_slot),
                                        }] : []),
                                        {
                                            color: 'text-purple-500 dark:text-purple-400',
                                            icon: 'M7 20l4-16m2 16l4-16M6 9h14M4 15h14',
                                            label: 'Appointment',
                                            value: `#${appointment.appointment_number}`,
                                        },
                                    ].map(({ color, icon, label, value }) => (
                                        <div key={label} className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700/50 flex items-center justify-center shrink-0 ${color}`}>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icon} />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-gray-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest">{label}</p>
                                                <p className="text-gray-800 dark:text-slate-200 text-xs font-bold mt-0.5">{value}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col overflow-hidden h-full relative">
                                {previewMode ? (
                                    <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-slate-500 text-xs font-medium p-6 text-center">
                                        Chat is unavailable in preview mode
                                    </div>
                                ) : (
                                    <div className="absolute inset-0 flex flex-col">
                                        <Chat />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    {/* Security note only at bottom of info tab */}
                    {sidebarTab === 'info' && (
                        <div className="p-4 border-t border-gray-200 dark:border-white/5 shrink-0 bg-white/50 dark:bg-black/20">
                            <div className="flex items-start gap-2.5 bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-3">
                                <svg className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                <p className="text-emerald-600/80 dark:text-emerald-400/80 text-[10px] font-medium leading-relaxed">
                                    End-to-end encrypted. Only authorized participants can join this room.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </aside>
    );

    return (
        <div className="h-screen bg-gray-50 dark:bg-slate-950 flex flex-col overflow-hidden relative transition-colors duration-300 lk-room-container">
            <style>{`
                .lk-connection-quality { display: none !important; }
                
                /* Adaptive CSS variables for Light / Dark Mode */
                .lk-room-container {
                    --lk-bg-primary: rgba(255, 255, 255, 0.85);
                    --lk-bg-secondary: rgba(0, 0, 0, 0.05);
                    --lk-border-color: rgba(0, 0, 0, 0.1);
                    --lk-text-primary: #1f2937;
                    --lk-text-secondary: #6b7280;
                    --lk-btn-bg: rgba(243, 244, 246, 0.9); /* neutral gray-100 */
                    --lk-btn-bg-hover: rgba(229, 231, 235, 0.9); /* neutral gray-200 */
                    --lk-btn-text: #4b5563; /* neutral gray-600 */
                    --lk-btn-active-bg: #2563eb; 
                    --lk-btn-active-border: #1d4ed8;
                    --lk-btn-active-text: #ffffff;
                    --lk-chat-msg-bg: #ffffff;
                    --lk-chat-msg-shadow: 0 2px 4px rgba(0,0,0,0.05);
                }
                html.dark .lk-room-container {
                    --lk-bg-primary: rgba(0, 0, 0, 0.4);
                    --lk-bg-secondary: rgba(24, 24, 27, 0.6);
                    --lk-border-color: rgba(255, 255, 255, 0.05);
                    --lk-text-primary: #f1f5f9;
                    --lk-text-secondary: #94a3b8;
                    --lk-btn-bg: rgba(39, 39, 42, 0.8); /* zinc-800 */
                    --lk-btn-bg-hover: rgba(63, 63, 70, 0.9); /* zinc-700 */
                    --lk-btn-text: #d4d4d8; /* zinc-300 */
                    --lk-btn-active-bg: #2563eb;
                    --lk-btn-active-border: #1d4ed8;
                    --lk-btn-active-text: #ffffff;
                    --lk-chat-msg-bg: rgba(30, 41, 59, 0.8);
                    --lk-chat-msg-shadow: 0 2px 4px rgba(0,0,0,0.2);
                }

                /* LiveKit grid/tile background overrides */
                .lk-grid-layout {
                    background: transparent !important;
                    height: 100% !important;
                    padding: 0 !important;
                    gap: 0 !important;
                }
                .lk-participant-tile {
                    border-radius: 0 !important;
                    border: none !important;
                    overflow: hidden !important;
                }
                .lk-participant-tile video, .lk-participant-media-video {
                    border-radius: 0 !important;
                    border: none !important;
                }
                .lk-focus-layout {
                    background: transparent !important;
                    height: 100% !important;
                }

                /* Prevent Start Audio button from flashing if autoplay succeeds quickly */
                .lk-start-audio-button {
                    animation: lk-audio-fade-in 0.3s ease 1.5s forwards !important;
                    opacity: 0 !important;
                    visibility: hidden !important;
                    
                    /* Make it look premium if it does show up */
                    background: rgba(37, 99, 235, 0.95) !important;
                    color: white !important;
                    border-radius: 9999px !important;
                    padding: 12px 28px !important;
                    position: absolute !important;
                    top: 50% !important;
                    left: 50% !important;
                    transform: translate(-50%, -50%) !important;
                    z-index: 50 !important;
                    box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.3) !important;
                    font-weight: 600 !important;
                    border: none !important;
                    backdrop-filter: blur(4px) !important;
                }
                @keyframes lk-audio-fade-in {
                    to {
                        opacity: 1 !important;
                        visibility: visible !important;
                    }
                }

                /* Nuclear: force LiveKit room container and ALL its children to fill height */
                [data-lk-theme] {
                    height: 100% !important;
                }
                [data-lk-theme] > * {
                    height: 100% !important;
                }
                .lk-video-conference {
                    height: 100% !important;
                    display: flex !important;
                    flex-direction: column !important;
                }
                .lk-video-conference-inner {
                    flex: 1 !important;
                    height: 100% !important;
                }

                /* Chat component fills sidebar */
                .lk-chat {
                    height: 100% !important;
                    width: 100% !important;
                    max-width: 100% !important;
                    min-width: 0 !important;
                    display: flex !important;
                    flex-direction: column !important;
                    background: transparent !important;
                }
                .lk-chat-messages {
                    flex: 1 !important;
                    overflow-y: auto !important;
                    padding: 12px !important;
                    min-height: 0 !important;
                }
                .lk-chat-entry-name {
                    font-size: 10px !important;
                    color: var(--lk-text-secondary) !important;
                    margin-bottom: 2px !important;
                }
                .lk-chat-entry-message {
                    background: var(--lk-chat-msg-bg) !important;
                    border: 1px solid var(--lk-border-color) !important;
                    padding: 10px 14px !important;
                    border-radius: 16px !important;
                    border-top-left-radius: 4px !important;
                    font-size: 13px !important;
                    color: var(--lk-text-primary) !important;
                    width: fit-content !important;
                    word-break: break-word !important;
                    box-shadow: var(--lk-chat-msg-shadow) !important;
                    line-height: 1.5 !important;
                }
                .lk-control-bar .lk-button {
                    background: var(--lk-btn-bg) !important;
                    border: 1px solid var(--lk-border-color) !important;
                    color: var(--lk-btn-text) !important;
                    transition: all 0.2s !important;
                    border-radius: 12px !important;
                }
                .lk-control-bar .lk-button:hover {
                    background: var(--lk-btn-bg-hover) !important;
                    color: var(--lk-text-primary) !important;
                }
                .lk-control-bar .lk-button[data-lk-enabled="false"], .lk-control-bar .lk-button[aria-pressed="false"] {
                    background: var(--lk-btn-bg) !important;
                }
                .lk-control-bar .lk-button[aria-pressed="true"] {
                    background: var(--lk-btn-active-bg) !important;
                    color: var(--lk-btn-active-text) !important;
                    border-color: var(--lk-btn-active-border) !important;
                }
                .lk-chat-form {
                    width: 100% !important;
                    max-width: 100% !important;
                    min-width: 0 !important;
                    box-sizing: border-box !important;
                    padding: 10px !important;
                    border-top: 1px solid var(--lk-border-color) !important;
                    background: var(--lk-bg-primary) !important;
                    display: flex !important;
                    gap: 8px !important;
                    align-items: center !important;
                    overflow: hidden !important;
                }
                .lk-chat-form-input {
                    min-width: 0 !important;
                    flex: 1 1 0% !important;
                    width: 0 !important;
                    background: transparent !important;
                    border: 1px solid var(--lk-border-color) !important;
                    border-radius: 12px !important;
                    padding: 8px 12px !important;
                    color: var(--lk-text-primary) !important;
                    font-size: 13px !important;
                    transition: all 0.2s !important;
                }
                .lk-chat-form-input::placeholder {
                    color: var(--lk-text-primary) !important;
                    opacity: 0.7 !important;
                }
                .lk-chat-form-input:focus {
                    background: var(--lk-bg-primary) !important;
                    border-color: var(--lk-btn-active-bg) !important;
                    box-shadow: 0 0 0 2px rgba(15, 23, 42, 0.2) !important;
                    outline: none !important;
                }
                .lk-chat-header {
                    display: none !important;
                }
                .lk-chat-form-button {
                    font-size: 0 !important;
                    width: 36px !important;
                    height: 36px !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    padding: 0 !important;
                    border-radius: 50% !important;
                    background: var(--lk-btn-active-bg) !important;
                    color: var(--lk-btn-active-text) !important;
                    position: relative !important;
                    flex-shrink: 0 !important;
                    border: none !important;
                    cursor: pointer !important;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
                    box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.3) !important;
                }
                .lk-chat-form-button:hover {
                    background: var(--lk-btn-active-border) !important;
                    transform: translateY(-1px) !important;
                    box-shadow: 0 6px 8px -1px rgba(15, 23, 42, 0.4) !important;
                }
                .lk-chat-form-button::after {
                    content: "" !important;
                    display: block !important;
                    width: 14px !important;
                    height: 14px !important;
                    background-color: currentColor !important;
                    position: absolute !important;
                    top: 50% !important;
                    left: 50% !important;
                    transform: translate(-50%, -50%) !important;
                    -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor'%3E%3Cpath d='M3.4 22a.8.8 0 0 1-.7-.4.8.8 0 0 1 0-.8L6.5 12 2.7 3.2a.8.8 0 0 1 .7-1.2 1 1 0 0 1 .5.1l17 8a.8.8 0 0 1 0 1.5l-17 8a1 1 0 0 1-.5.1z'/%3E%3C/svg%3E") no-repeat center !important;
                    mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor'%3E%3Cpath d='M3.4 22a.8.8 0 0 1-.7-.4.8.8 0 0 1 0-.8L6.5 12 2.7 3.2a.8.8 0 0 1 .7-1.2 1 1 0 0 1 .5.1l17 8a.8.8 0 0 1 0 1.5l-17 8a1 1 0 0 1-.5.1z'/%3E%3C/svg%3E") no-repeat center !important;
                    -webkit-mask-size: contain !important;
                    mask-size: contain !important;
                }

                /* Combine Mic/Camera split buttons */
                .lk-control-bar .lk-button-group {
                    gap: 0 !important;
                }
                .lk-control-bar .lk-button-group > .lk-button:not(:last-child) {
                    border-top-right-radius: 0 !important;
                    border-bottom-right-radius: 0 !important;
                    border-right: 1px solid rgba(255, 255, 255, 0.05) !important;
                }
                .lk-control-bar .lk-button-group > .lk-button-group-menu > .lk-button {
                    border-top-left-radius: 0 !important;
                    border-bottom-left-radius: 0 !important;
                }

                /* Device Menu Dropdown fixes */
                .lk-device-menu {
                    background: var(--lk-bg-secondary) !important;
                    border: 1px solid var(--lk-border-color) !important;
                    border-radius: 12px !important;
                    padding: 6px !important;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.5) !important;
                    backdrop-filter: blur(16px) !important;
                    -webkit-backdrop-filter: blur(16px) !important;
                }
                .lk-device-menu[style*="visibility: hidden"] {
                    opacity: 0 !important;
                    transition: opacity 0.15s ease, visibility 0s 0.15s !important;
                }
                .lk-device-menu[style*="visibility: visible"] {
                    opacity: 1 !important;
                    transition: opacity 0.15s ease, visibility 0s 0s !important;
                }
                .lk-device-menu * {
                    transition: none !important;
                }
                .lk-device-menu li button {
                    background: transparent !important;
                    border: none !important;
                    color: var(--lk-text-primary) !important;
                    padding: 8px 12px !important;
                    border-radius: 8px !important;
                    font-size: 13px !important;
                    width: 100% !important;
                    text-align: left !important;
                    transition: background 0.15s ease !important;
                }
                .lk-device-menu li button:hover {
                    background: var(--lk-btn-bg-hover) !important;
                }
                
                /* Metadata user name hide background and border */
                .lk-participant-metadata {
                    background: transparent !important;
                    box-shadow: none !important;
                    backdrop-filter: none !important;
                    -webkit-backdrop-filter: none !important;
                    border: none !important;
                }
                .lk-participant-name {
                    color: #ffffff !important;
                    text-shadow: 0 2px 4px rgba(0,0,0,0.8), 0 1px 2px rgba(0,0,0,0.5) !important;
                }

                /* Chat Bubbles Premium UI */
                .lk-chat-entry {
                    display: flex !important;
                    flex-direction: column !important;
                    gap: 6px !important;
                    margin-bottom: 16px !important;
                    padding: 0 !important;
                }
                .lk-chat-entry .lk-meta-data {
                    display: flex !important;
                    align-items: center !important;
                    gap: 8px !important;
                    white-space: nowrap !important;
                }
                .lk-chat-entry .lk-participant-name {
                    font-size: 12px !important;
                    font-weight: 600 !important;
                    color: var(--lk-text-primary) !important;
                    text-shadow: none !important;
                }
                .lk-chat-entry .lk-timestamp {
                    font-size: 10px !important;
                    color: var(--lk-text-secondary) !important;
                }
                .lk-message-body {
                    padding: 10px 14px !important;
                    border-radius: 16px 16px 16px 4px !important;
                    font-size: 13px !important;
                    line-height: 1.5 !important;
                    width: fit-content !important;
                    max-width: 90% !important;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
                    background: var(--lk-bg-secondary) !important;
                    border: 1px solid var(--lk-border-color) !important;
                    color: var(--lk-text-primary) !important;
                    word-break: break-word !important;
                }
                
                /* Local Participant Chat Bubble */
                .lk-chat-entry[data-lk-message-origin="local"] {
                    align-items: flex-end !important;
                }
                .lk-chat-entry[data-lk-message-origin="local"] .lk-meta-data {
                    flex-direction: row-reverse !important;
                }
                .lk-chat-entry[data-lk-message-origin="local"] .lk-message-body {
                    border-radius: 16px 16px 4px 16px !important;
                    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%) !important;
                    border: none !important;
                    color: #ffffff !important;
                    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25) !important;
                }

                /* Custom Scrollbar */
                .custom-scrollbar::-webkit-scrollbar,
                .lk-chat-messages::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track,
                .lk-chat-messages::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb,
                .lk-chat-messages::-webkit-scrollbar-thumb {
                    background: rgba(156, 163, 175, 0.5); /* gray-400 */
                    border-radius: 10px;
                }
                html.dark .custom-scrollbar::-webkit-scrollbar-thumb,
                html.dark .lk-chat-messages::-webkit-scrollbar-thumb {
                    background: rgba(71, 85, 105, 0.5); /* slate-600 */
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover,
                .lk-chat-messages::-webkit-scrollbar-thumb:hover {
                    background: rgba(107, 114, 128, 0.8); /* gray-500 */
                }
                html.dark .custom-scrollbar::-webkit-scrollbar-thumb:hover,
                html.dark .lk-chat-messages::-webkit-scrollbar-thumb:hover {
                    background: rgba(100, 116, 139, 0.8); /* slate-500 */
                }
            `}</style>
            <Head title={`Virtual Consultation · Apt #${appointment.appointment_number}`} />

            {/* Ambient glows */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-teal-600/10 rounded-full blur-[120px]" />
                <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px]" />
            </div>

            {/* ────────────── Top Bar ────────────── */}
            <header className="relative z-40 flex-shrink-0 h-14 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-gray-200 dark:border-white/5 flex items-center justify-between px-4 gap-4 transition-colors">

                {/* Left */}
                <div className="flex items-center gap-3 min-w-0">



                    {/* Session info */}
                    <div className="min-w-0">
                        <p className="text-gray-900 dark:text-white font-bold text-sm leading-tight truncate">{counterpartName}</p>
                        <p className="text-gray-500 dark:text-slate-500 text-[10px] font-medium truncate">
                            Apt #{appointment.appointment_number}
                            {' · '}{fmtDate(appointment.date)}
                            {appointment.time_slot ? ` · ${fmt12(appointment.time_slot)}` : ''}
                        </p>
                    </div>
                </div>

                {/* Right */}
                <div className="flex items-center gap-2 shrink-0">
                    <NetworkIndicator />
                    
                    {/* User chip */}
                    <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5">
                        {user.avatar ? (
                            <img src={user.avatar} alt={user.name} className="w-6 h-6 rounded-full object-cover border border-slate-600 shrink-0" />
                        ) : (
                            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-teal-500 to-blue-600 flex items-center justify-center text-white text-[10px] font-black shrink-0">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div className="leading-none">
                            <p className="text-gray-900 dark:text-white text-xs font-bold">{user.name}</p>
                            <p className="text-gray-500 dark:text-slate-500 text-[9px] font-medium mt-0.5 capitalize">{isDoctor ? 'Doctor' : 'Patient'}</p>
                        </div>
                    </div>

                    {/* Sidebar toggle */}
                    <button
                        onClick={() => setSidebarOpen(o => !o)}
                        title={sidebarOpen ? 'Hide panel' : 'Show panel'}
                        className="flex w-8 h-8 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 border border-transparent dark:hover:border-slate-700 transition-all items-center justify-center"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
                        </svg>
                    </button>
                </div>
            </header>

            {/* ────────────── Body ────────────── */}
            <div className="flex min-h-0 relative z-10" style={{ height: 'calc(100vh - 3.5rem)' }}>

                {previewMode ? (
                    <>
                        <div className="flex-1 min-w-0 relative">
                            {/* ── Preview (no token) ── */}
                            <div className="w-full h-full flex flex-col items-center justify-center relative">
                                <span className="absolute top-4 left-4 bg-amber-500/15 text-amber-400 text-[10px] font-bold px-3 py-1 rounded-lg border border-amber-500/25">
                                    Preview Mode — LiveKit token not configured
                                </span>

                                {/* Mock participant tiles */}
                                <div className="flex flex-col sm:flex-row gap-4 p-8 w-full max-w-xl justify-center items-center">
                                    {/* Self */}
                                    <div className="relative w-52 h-64 bg-white dark:bg-slate-800/70 rounded-2xl border border-gray-200 dark:border-slate-700/60 shadow-xl dark:shadow-2xl flex flex-col items-center justify-center overflow-hidden transition-colors">
                                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center text-white text-2xl font-black mb-3 shadow-lg ring-4 ring-teal-500/20">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <p className="text-gray-900 dark:text-white text-sm font-bold">{user.name}</p>
                                        <p className="text-gray-500 dark:text-slate-400 text-xs mt-1 capitalize">{isDoctor ? 'Doctor' : 'Patient'}</p>
                                        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-gray-100 dark:bg-black/50 backdrop-blur px-2 py-1 rounded-lg text-[10px] text-gray-700 dark:text-white font-bold">
                                            <svg className="w-3 h-3 text-teal-500 dark:text-teal-400" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            You
                                        </div>
                                    </div>

                                    {/* Counterpart */}
                                    <div className="relative w-52 h-64 bg-white dark:bg-slate-800/70 rounded-2xl border border-gray-200 dark:border-slate-700/60 shadow-xl dark:shadow-2xl flex flex-col items-center justify-center overflow-hidden transition-colors">
                                        {counterpartAvatar ? (
                                            <img src={`/storage/${counterpartAvatar}`} alt={counterpartName} className="w-16 h-16 rounded-full object-cover mb-3 ring-4 ring-indigo-500/20" />
                                        ) : (
                                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-black mb-3 shadow-lg ring-4 ring-indigo-500/20">
                                                {counterpartInit}
                                            </div>
                                        )}
                                        <p className="text-gray-900 dark:text-white text-sm font-bold">{counterpartName}</p>
                                        <p className="text-gray-500 dark:text-slate-400 text-xs mt-1">{isDoctor ? 'Patient' : 'Doctor'}</p>
                                        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-gray-100 dark:bg-black/50 backdrop-blur px-2 py-1 rounded-lg text-[10px] text-gray-500 dark:text-slate-400 font-bold">
                                            Waiting...
                                        </div>
                                    </div>
                                </div>

                                {/* Mock controls */}
                                <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
                                    <div className="bg-white/70 sm:bg-white/5 dark:bg-black/10 backdrop-blur-xl px-4 py-2.5 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.1)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] flex items-center gap-2 transition-all duration-300">
                                        <MockBtn label="Mic"   path="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                        <MockBtn label="Cam"   path="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        <MockBtn label="Share" path="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        
                                        <div className="lk-control-bar !bg-transparent !shadow-none !border-none !p-0" data-lk-variation="minimal">
                                            <div className="lk-button-group">
                                                <button className="lk-button">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>

                                        <div className="w-px h-8 bg-white/20 mx-1" />
                                        <button onClick={handleLeaveRoom} className="px-5 py-2 rounded-xl bg-red-500/90 hover:bg-red-500 text-white font-bold text-xs transition-all hover:scale-105 active:scale-95 shadow-lg">
                                            Leave
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {sidebarElement}
                    </>
                ) : (
                    <LiveKitRoom
                        video={true}
                        audio={{
                            echoCancellation: true,
                            noiseSuppression: true,
                            autoGainControl: true,
                        }}
                        token={livekitToken}
                        serverUrl={livekitUrl}
                        data-lk-theme="default"
                        style={{ display: 'flex', flex: 1, minHeight: 0, height: '100%', position: 'relative', width: '100%' }}
                        onConnected={() => setIsJoined(true)}
                        onDisconnected={() => {
                            setIsJoined(false);
                        }}
                        className="bg-transparent"
                    >
                        <div className="flex-1 min-w-0 relative h-full">
                            <CustomVideoConference isDoctor={isDoctor} counterpartName={counterpartName} onLeave={handleLeaveRoom} />
                            <RoomAudioRenderer />
                            <RoomSoundNotifiers />
                        </div>
                        {sidebarElement}
                    </LiveKitRoom>
                )}
            </div>
        </div>
    );
}

