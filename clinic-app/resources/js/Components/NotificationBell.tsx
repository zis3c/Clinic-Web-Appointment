import { useState, useRef, useEffect } from 'react';
import { usePage, router } from '@inertiajs/react';

type NotificationBellProps = {
    compact?: boolean;
    className?: string;
};

export default function NotificationBell({ compact = false, className = '' }: NotificationBellProps) {
    const { auth } = usePage().props as any;
    const notifications = auth?.notifications || [];
    const unreadCount = auth?.unread_notifications_count || 0;
    
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAsRead = (id: string) => {
        router.patch(route('notifications.read', id), {}, {
            preserveScroll: true,
            onSuccess: () => {
                // Keep dropdown open if they have more notifications
                if (unreadCount <= 1) {
                    setIsOpen(false);
                }
            }
        });
    };

    const markAllAsRead = () => {
        router.post(route('notifications.read-all'), {}, {
            preserveScroll: true,
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

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`relative ${compact ? 'p-0 h-full w-full rounded-2xl border-0 bg-transparent text-inherit' : 'p-2 rounded-xl border border-gray-100'} transition-all hover:bg-slate-50 hover:scale-105 active:scale-95 focus:outline-none ${isOpen ? (compact ? 'text-blue-600' : 'bg-slate-50 border-blue-200 text-blue-600') : (compact ? 'text-blue-600' : 'bg-white text-gray-500')} ${className}`}
                aria-label="View notifications"
            >
                <svg className={compact ? 'w-6 h-6' : 'w-6 h-6'} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>

                {unreadCount > 0 && (
                    <span className={`absolute ${compact ? '-top-1 -right-1' : '-top-1.5 -right-1.5'} flex h-5 w-5`}>
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-5 w-5 bg-rose-500 text-[10px] font-black text-white items-center justify-center border-2 border-white shadow-sm">
                            {unreadCount}
                        </span>
                    </span>
                )}
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 transform origin-top-right transition-all">
                    {/* Header */}
                    <div className="px-5 py-4 border-b border-gray-50 flex justify-between items-center bg-gradient-to-r from-gray-50 to-white">
                        <div>
                            <h3 className="font-bold text-gray-800 text-sm">Notifications</h3>
                            <p className="text-[10px] text-gray-400 font-semibold uppercase mt-0.5">Clinic Updates</p>
                        </div>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>

                    {/* Notification list */}
                    <div className="max-h-[350px] overflow-y-auto divide-y divide-gray-50 custom-scrollbar">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center flex flex-col items-center justify-center">
                                <div className="h-12 w-12 text-gray-300 mb-3 bg-gray-50 rounded-full flex items-center justify-center">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0V9a2 2 0 00-2-2H6a2 2 0 00-2 2v2" />
                                    </svg>
                                </div>
                                <h4 className="font-bold text-gray-700 text-xs">All caught up!</h4>
                                <p className="text-[10px] text-gray-400 mt-0.5">No new notifications at this time.</p>
                            </div>
                        ) : (
                            notifications.map((n: any) => (
                                <div
                                    key={n.id}
                                    onClick={() => markAsRead(n.id)}
                                    className="p-4 flex items-start gap-3 hover:bg-slate-50/50 cursor-pointer transition-colors group relative"
                                    title="Click to mark as read"
                                >
                                    {/* Type indicator dot */}
                                    <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1.5 ${getIconColorClass(n.type)} shadow-sm`} />
                                    
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start gap-2">
                                            <h4 className="text-xs font-bold text-gray-800 group-hover:text-blue-600 transition-colors truncate">
                                                {n.title}
                                            </h4>
                                            <span className="text-[9px] font-bold text-gray-400 whitespace-nowrap bg-gray-100 px-1.5 py-0.5 rounded-full flex-shrink-0">
                                                {n.created_at}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-gray-500 font-medium leading-relaxed mt-1">
                                            {n.message}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
