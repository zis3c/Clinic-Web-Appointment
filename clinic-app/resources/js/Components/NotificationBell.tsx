import { useState, useRef, useEffect, useCallback } from 'react';
import { usePage, router } from '@inertiajs/react';
import { createPortal } from 'react-dom';

type NotificationBellProps = {
    compact?: boolean;
    className?: string;
};

export default function NotificationBell({ compact = false, className = '' }: NotificationBellProps) {
    const { auth } = usePage().props as any;
    
    // State to hold notifications and unread count for real-time updates
    const [notifications, setNotifications] = useState<any[]>(auth?.notifications || []);
    const [unreadCount, setUnreadCount] = useState<number>(auth?.unread_notifications_count || 0);
    
    const [isOpen, setIsOpen] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });

    // Sync with inertia props when they change (e.g. after full page navigation)
    useEffect(() => {
        if (auth) {
            setNotifications(auth.notifications || []);
            setUnreadCount(auth.unread_notifications_count || 0);
        }
    }, [auth]);

    // Setup Laravel Echo listener for real-time broadcasting
    useEffect(() => {
        if (auth?.user && window.Echo) {
            const channel = window.Echo.private(`App.Models.User.${auth.user.id}`);
            
            channel.notification((notification: any) => {
                // Add the new notification to the top of the list
                setNotifications(prev => [notification, ...prev]);
                // Increment unread count
                setUnreadCount(prev => prev + 1);
            });

            return () => {
                window.Echo.leave(`App.Models.User.${auth.user.id}`);
            };
        }
    }, [auth?.user]);

    // Calculate dropdown position relative to the bell button
    const updatePosition = useCallback(() => {
        if (buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            const isMobile = window.innerWidth < 640;
            // Position dropdown above the bell button, aligned to the left edge or centered on mobile
            setDropdownPos({
                top: rect.top - 8, // 8px gap above the button
                left: isMobile ? 16 : rect.left,
            });
        }
    }, []);

    // Recalculate on open and on scroll/resize
    useEffect(() => {
        if (isOpen) {
            updatePosition();
            window.addEventListener('scroll', updatePosition, true);
            window.addEventListener('resize', updatePosition);
            return () => {
                window.removeEventListener('scroll', updatePosition, true);
                window.removeEventListener('resize', updatePosition);
            };
        }
    }, [isOpen, updatePosition]);

    // Close dropdown on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            const target = event.target as Node;
            if (
                dropdownRef.current && !dropdownRef.current.contains(target) &&
                buttonRef.current && !buttonRef.current.contains(target)
            ) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAsRead = (id: string) => {
        // Optimistic UI update
        setNotifications(prev => prev.filter(n => n.id !== id));
        setUnreadCount(prev => Math.max(0, prev - 1));

        router.patch(route('notifications.read', id), {}, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                // Keep dropdown open if they have more notifications
                if (unreadCount <= 1) {
                    setIsOpen(false);
                }
            }
        });
    };

    const markAllAsRead = () => {
        // Optimistic UI update
        setNotifications([]);
        setUnreadCount(0);
        
        router.post(route('notifications.read-all'), {}, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setIsOpen(false);
            }
        });
    };

    const getIconColorClass = (type: string) => {
        switch (type) {
            case 'success': return 'bg-emerald-500';
            case 'warning': return 'bg-amber-500';
            case 'danger': return 'bg-rose-500';
            default: return 'bg-blue-500';
        }
    };

    const dropdownContent = isOpen ? createPortal(
        <div 
            ref={dropdownRef}
            className={`fixed w-[calc(100vw-32px)] ${notifications.length === 0 ? 'sm:w-72' : 'sm:w-96'} bg-white dark:bg-slate-900 rounded-2xl shadow-2xl dark:shadow-black/40 border border-gray-100 dark:border-slate-700 overflow-hidden z-[9999] transform sm:origin-bottom-left`}
            style={{
                top: `${dropdownPos.top}px`,
                left: `${dropdownPos.left}px`,
                transform: 'translate(0, -100%)',
            }}
        >
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-50 dark:border-slate-800 flex justify-between items-center bg-gradient-to-r from-gray-50 to-white dark:from-slate-800 dark:to-slate-900">
                <div>
                    <h3 className="font-bold text-gray-800 dark:text-white text-sm">Notifications</h3>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold capitalize mt-0.5">Clinic Updates</p>
                </div>
                {unreadCount > 0 && (
                    <button
                        onClick={markAllAsRead}
                        className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-all"
                    >
                        Mark all as read
                    </button>
                )}
            </div>

            {/* Notification list */}
            <div className="max-h-[350px] overflow-y-auto divide-y divide-gray-50 dark:divide-slate-800 custom-scrollbar">
                {notifications.length === 0 ? (
                    <div className="p-8 min-h-[220px] text-center flex flex-col items-center justify-center">
                        <div className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-3 bg-gray-50 dark:bg-slate-800 rounded-full flex items-center justify-center border border-gray-100 dark:border-slate-700">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0V9a2 2 0 00-2-2H6a2 2 0 00-2 2v2" />
                            </svg>
                        </div>
                        <h4 className="font-bold text-gray-700 dark:text-gray-300 text-xs">All caught up!</h4>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">No new notifications at this time.</p>
                    </div>
                ) : (
                    notifications.map((n: any) => (
                        <div
                            key={n.id}
                            onClick={() => markAsRead(n.id)}
                            className="p-4 flex items-start gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 cursor-pointer transition-all group relative"
                            title="Click to mark as read"
                        >
                            {/* Type indicator dot */}
                            <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1.5 ${getIconColorClass(n.type)} shadow-[0_0_8px_currentColor] opacity-80`} />
                            
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start gap-2">
                                    <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-all truncate">
                                        {n.title || n.data?.title}
                                    </h4>
                                    <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500 whitespace-nowrap bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-full flex-shrink-0 border border-gray-200 dark:border-slate-700">
                                        {n.created_at || 'Just now'}
                                    </span>
                                </div>
                                <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium leading-relaxed mt-1">
                                    {n.message || n.data?.message}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>,
        document.body
    ) : null;

    return (
        <div className="relative">
            {/* Bell Button */}
            <button
                ref={buttonRef}
                onClick={() => setIsOpen(!isOpen)}
                className={`relative ${compact ? 'p-2 rounded-xl border-0' : 'p-2 rounded-xl border border-gray-100 dark:border-slate-700'} transition-all outline-none ${isOpen ? (compact ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'bg-slate-50 dark:bg-slate-800 border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400') : (compact ? 'bg-transparent text-gray-400 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30' : 'bg-white dark:bg-slate-900 text-gray-500 dark:text-gray-400')} ${className}`}
                aria-label="View notifications"
            >
                <svg className={compact ? 'w-5 h-5' : 'w-6 h-6'} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>

                {unreadCount > 0 && (
                    <span className={`absolute ${compact ? '-top-1 -right-1' : '-top-1.5 -right-1.5'} flex h-5 w-5`}>
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-5 w-5 bg-rose-500 text-[10px] font-black text-white items-center justify-center border-2 border-white dark:border-slate-900 shadow-sm">
                            {unreadCount}
                        </span>
                    </span>
                )}
            </button>

            {/* Portal-rendered dropdown */}
            {dropdownContent}
        </div>
    );
}
