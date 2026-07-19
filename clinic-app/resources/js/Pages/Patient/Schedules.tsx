import { useState, useEffect, Fragment } from 'react';
import SidebarLayout from '@/Layouts/SidebarLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { Dialog, Transition } from '@headlessui/react';
import { formatTime12Hour } from '../../Utils/time';
import DoctorDetailsModal from '@/Components/DoctorDetailsModal';

declare const route: any;

export default function Schedules({ auth, schedules }: any) {
    const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table');
    const [selectedSchedule, setSelectedSchedule] = useState<any>(null);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            return params.get('search') || '';
        }
        return '';
    });
    const [confirmCheckbox, setConfirmCheckbox] = useState(false);
    const [selectedDoctorForModal, setSelectedDoctorForModal] = useState<any>(null);

    // Calendar navigation states
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<string>(() => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    });

    // Listen for queue/schedule updates to refresh the availability
    useEffect(() => {
        if (window.Echo) {
            const channel = window.Echo.channel('queue');
            channel.listen('AppointmentUpdated', (_e: any) => {
                router.reload({ only: ['schedules'] });
            });

            return () => {
                window.Echo.leaveChannel('queue');
            };
        }
    }, []);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        schedule_id: '',
        time_slot: '',
    });

    const openBookingModal = (schedule: any) => {
        setSelectedSchedule(schedule);
        setData({
            schedule_id: schedule.id,
            time_slot: '', // User must select a slot
        });
        setShowBookingModal(true);
        clearErrors();
    };

    const closeBookingModal = () => {
        setShowBookingModal(false);
        setConfirmCheckbox(false);
        reset();
        clearErrors();
    };

    const submitBooking = (e: any) => {
        e.preventDefault();
        if (!data.time_slot || !confirmCheckbox) {
            return;
        }
        post(route('patient.appointments.store'), {
            onSuccess: () => {
                closeBookingModal();
            },
        });
    };

    const getLocalDateString = (d: Date) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const filteredSchedules = schedules.filter((schedule: any) => {
        const query = searchQuery.toLowerCase();
        return (
            schedule.doctor?.user?.name.toLowerCase().includes(query) ||
            schedule.doctor?.specialty?.name.toLowerCase().includes(query) ||
            schedule.title.toLowerCase().includes(query) ||
            schedule.date.includes(query) ||
            schedule.time.includes(query)
        );
    });

    // Time slots helper functions
    const generateTimeSlots = (schedule: any) => {
        if (!schedule) return [];
        const slots: string[] = [];
        const baseTimeStr = schedule.time; // e.g. "09:00:00"
        const duration = schedule.slot_duration || 30; // duration in minutes
        const count = schedule.number_of_patients || 1; // total slots

        const [hours, minutes, seconds] = baseTimeStr.split(':').map(Number);

        for (let i = 0; i < count; i++) {
            const dateObj = new Date();
            dateObj.setHours(hours, minutes, seconds || 0, 0);
            dateObj.setMinutes(dateObj.getMinutes() + i * duration);

            const slotHours = String(dateObj.getHours()).padStart(2, '0');
            const slotMinutes = String(dateObj.getMinutes()).padStart(2, '0');
            slots.push(`${slotHours}:${slotMinutes}:00`);
        }
        return slots;
    };

    const formatTimeSlot12Hour = (time24: string) => {
        if (!time24) return '';
        const [hoursStr, minutesStr] = time24.split(':');
        const hours = parseInt(hoursStr, 10);
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        return `${displayHours}:${minutesStr} ${ampm}`;
    };

    const isSlotBooked = (schedule: any, slot: string) => {
        if (!schedule || !schedule.appointments) return false;
        return schedule.appointments.some((apt: any) => {
            return apt.time_slot === slot && apt.status !== 'rejected';
        });
    };

    // Calendar construction helper
    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const days = [];
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(null);
        }
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(new Date(year, month, i));
        }
        return days;
    };

    const prevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    const calendarDays = getDaysInMonth(currentMonth);
    const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Filter schedules for the selected calendar date
    const selectedDateSchedules = filteredSchedules.filter((s: any) => {
        const sDateOnly = s.date ? s.date.split('T')[0].split(' ')[0] : '';
        return sDateOnly === selectedDate;
    });

    return (
        <SidebarLayout
            user={auth.user}
        >
            <Head title="Book Appointment" />

            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">

                {/* Header Actions */}
                <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex-col md:flex-row gap-4 mb-6 transition-all">
                    <div>
                        <h3 className="text-base md:text-lg font-bold text-gray-800 dark:text-slate-100">Available Doctor Sessions</h3>
                        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Select an available session below to book your appointment.</p>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        {/* Search */}
                        <div className="relative flex-1 md:flex-none">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                            </div>
                            <input
                                type="text"
                                placeholder="Search doctors, specialties..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 w-full md:w-60 border-gray-200 dark:border-slate-700 rounded-xl text-xs focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50 dark:bg-slate-900/50 dark:text-slate-200 h-10 transition-all outline-none placeholder-gray-400 dark:placeholder-gray-500 placeholder:font-normal"
                            />
                        </div>

                        {/* View Switcher Toggle */}
                        <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
                            <button
                                onClick={() => setViewMode('table')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'table' ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path></svg>
                                <span className="hidden sm:inline">Table</span>
                            </button>
                            <button
                                onClick={() => setViewMode('calendar')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'calendar' ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                <span className="hidden sm:inline">Calendar</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Conditional View Rendering */}
                {viewMode === 'table' ? (
                    /* TABLE VIEW */
                    <div className="bg-white dark:bg-slate-800 overflow-hidden shadow-sm rounded-2xl border border-gray-100 dark:border-slate-700 relative transition-all">
                        <div className="h-auto max-h-[700px] md:h-[calc(100vh-190px)] md:max-h-none overflow-y-auto custom-scrollbar flex flex-col">
                            {/* Desktop Table View */}
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700 hidden md:table">
                                <thead className="bg-gray-50/80 dark:bg-slate-800/80 backdrop-blur-md sticky top-0 z-10 ring-1 ring-gray-200 dark:ring-slate-700">
                                    <tr>
                                        <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 dark:text-gray-400 capitalize tracking-wider w-12">#</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 capitalize tracking-wider">Doctor Details</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 capitalize tracking-wider">Session Info</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 capitalize tracking-wider">Availability</th>
                                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 dark:text-gray-400 capitalize tracking-wider">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                                    {filteredSchedules.map((schedule: any, index: number) => {
                                        const activeAppointments = schedule.appointments?.filter((apt: any) => apt.status !== 'rejected') || [];
                                        const isFull = activeAppointments.length >= schedule.number_of_patients;
                                        const hasBooked = schedule.appointments?.some((apt: any) => apt.patient_id === auth.user.patient?.id);
                                        const slotsLeft = schedule.number_of_patients - activeAppointments.length;

                                        return (
                                            <tr key={schedule.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-all">
                                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold text-gray-400 dark:text-gray-500">
                                                    {index + 1}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div
                                                        onClick={() => setSelectedDoctorForModal(schedule.doctor)}
                                                        className="flex items-center cursor-pointer group/doctor"
                                                    >
                                                        <div className={`h-10 w-10 rounded-full overflow-hidden flex items-center justify-center text-white text-sm font-bold shadow-inner group-hover/doctor:scale-105 transition-transform duration-200 ${isFull ? 'bg-gray-400' : 'bg-gradient-to-br from-teal-400 to-blue-500'}`}>
                                                            {schedule.doctor.user?.avatar ? (
                                                                <img
                                                                    src={`/storage/${schedule.doctor.user.avatar}`}
                                                                    alt={schedule.doctor.user.name}
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            ) : (
                                                                schedule.doctor.user.name.charAt(0)
                                                            )}
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-bold text-gray-900 dark:text-white group-hover/doctor:text-blue-600 dark:group-hover/doctor:text-blue-400 transition-all">Dr. {schedule.doctor.user.name}</div>
                                                            <div className="text-xs text-blue-600 dark:text-blue-400 font-semibold">{schedule.doctor.specialty.name}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-bold text-gray-900 dark:text-white flex items-center">
                                                        {schedule.title}
                                                        {schedule.type === 'virtual' && (
                                                            <span className="ml-2 inline-flex items-center gap-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-[10px] px-2 py-0.5 rounded-full font-bold border border-purple-200 dark:border-purple-800">
                                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                                                                VIRTUAL
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                        {new Date(schedule.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at {formatTime12Hour(schedule.time)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-3 py-1 inline-flex text-[10px] leading-5 font-bold rounded-full ${isFull ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-400' : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400'}`}>
                                                        {isFull ? 'Fully Booked' : `${slotsLeft} slots left`}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button
                                                        onClick={() => openBookingModal(schedule)}
                                                        disabled={isFull || hasBooked}
                                                        className={`inline-flex items-center justify-center py-2 px-4 font-bold rounded-xl shadow-sm transition-all text-xs ${isFull || hasBooked
                                                                ? 'bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-gray-500 cursor-not-allowed shadow-none'
                                                                : 'bg-gradient-to-r from-teal-500 to-blue-600 text-white hover:shadow-md hover:scale-[1.02]'
                                                            }`}
                                                    >
                                                        {isFull ? 'Session Full' : (hasBooked ? 'Already Booked' : 'Book Appointment')}
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>

                            {/* Mobile Card View */}
                            <div className="flex flex-col p-4 space-y-4 md:hidden">
                                {filteredSchedules.map((schedule: any) => {
                                    const activeAppointments = schedule.appointments?.filter((apt: any) => apt.status !== 'rejected') || [];
                                    const isFull = activeAppointments.length >= schedule.number_of_patients;
                                    const hasBooked = schedule.appointments?.some((apt: any) => apt.patient_id === auth.user.patient?.id);
                                    const slotsLeft = schedule.number_of_patients - activeAppointments.length;

                                    return (
                                        <div key={schedule.id} className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl p-5 shadow-sm space-y-4">
                                            <div className="flex justify-between items-start">
                                                <div
                                                    onClick={() => setSelectedDoctorForModal(schedule.doctor)}
                                                    className="flex items-center gap-3 cursor-pointer group/doctor"
                                                >
                                                    <div className={`h-12 w-12 rounded-full overflow-hidden flex items-center justify-center text-white text-sm font-bold shadow-inner group-hover/doctor:scale-105 transition-transform duration-200 ${isFull ? 'bg-gray-400' : 'bg-gradient-to-br from-teal-400 to-blue-500'}`}>
                                                        {schedule.doctor.user?.avatar ? (
                                                            <img
                                                                src={`/storage/${schedule.doctor.user.avatar}`}
                                                                alt={schedule.doctor.user.name}
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : (
                                                            schedule.doctor.user.name.charAt(0)
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm md:text-base font-bold text-gray-900 dark:text-white group-hover/doctor:text-blue-600 dark:group-hover/doctor:text-blue-400 transition-all">
                                                            Dr. {schedule.doctor.user.name}
                                                        </h4>
                                                        <p className="text-[10px] md:text-xs text-blue-600 dark:text-blue-400 font-semibold">{schedule.doctor.specialty.name}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="bg-gray-50 dark:bg-slate-900/50 p-3 rounded-xl border border-gray-100 dark:border-slate-700/50 flex justify-between items-center">
                                                <div>
                                                    <p className="text-xs md:text-sm font-bold text-gray-900 dark:text-white flex items-center">
                                                        {schedule.title}
                                                        {schedule.type === 'virtual' && (
                                                            <span className="ml-2 inline-flex items-center gap-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-[10px] px-2 py-0.5 rounded-full font-bold border border-purple-200 dark:border-purple-800">
                                                                VIRTUAL
                                                            </span>
                                                        )}
                                                    </p>
                                                    <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                        {new Date(schedule.date).toLocaleDateString()} at {formatTime12Hour(schedule.time)}
                                                    </p>
                                                </div>
                                                <span className={`px-2.5 py-1 inline-flex text-[10px] leading-5 font-bold rounded-lg ${isFull ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-400' : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400'}`}>
                                                    {isFull ? 'Full' : `${slotsLeft} left`}
                                                </span>
                                            </div>

                                            <div className="pt-2 border-t border-gray-100 dark:border-slate-700">
                                                <button
                                                    onClick={() => openBookingModal(schedule)}
                                                    disabled={isFull || hasBooked}
                                                    className={`w-full flex justify-center items-center py-2.5 px-4 font-bold rounded-xl shadow-sm transition-all text-xs ${isFull || hasBooked
                                                            ? 'bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-gray-500 cursor-not-allowed shadow-none'
                                                            : 'bg-gradient-to-r from-teal-500 to-blue-600 text-white hover:shadow-md hover:scale-[1.02]'
                                                        }`}
                                                >
                                                    {isFull ? 'Session Full' : (hasBooked ? 'Already Booked' : 'Book Appointment')}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {filteredSchedules.length === 0 && (
                                <div className="flex-1 flex flex-col justify-center items-center p-10 text-center text-gray-500">
                                    {searchQuery ? (
                                        <>
                                            <p className="font-bold text-gray-700 text-base mb-1">
                                                No sessions found for "{searchQuery.toLowerCase().startsWith('dr.') ? searchQuery : `Dr. ${searchQuery}`}"
                                            </p>
                                            <p className="text-sm">This doctor currently has no available sessions scheduled.</p>
                                        </>
                                    ) : (
                                        "No available sessions found matching your filters."
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    /* CALENDAR VIEW */
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start h-auto md:h-[calc(100vh-190px)]">
                        {/* Left Side: Custom Month Grid */}
                        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm flex flex-col h-full overflow-hidden transition-all">
                            {/* Calendar Header */}
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-gray-800 dark:text-slate-100 text-base">{monthName}</h3>
                                <div className="flex items-center gap-1.5">
                                    <button
                                        onClick={prevMonth}
                                        className="p-1.5 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                                    </button>
                                    <button
                                        onClick={nextMonth}
                                        className="p-1.5 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                                    </button>
                                </div>
                            </div>

                            {/* Calendar Weekday Names */}
                            <div className="grid grid-cols-7 gap-1 text-center font-bold text-gray-400 dark:text-gray-500 text-[10px] capitalize tracking-wider mb-2">
                                {dayNames.map(d => <div key={d}>{d}</div>)}
                            </div>

                            {/* Calendar Days Grid */}
                            <div className="grid grid-cols-7 gap-2 flex-1">
                                {calendarDays.map((day, idx) => {
                                    if (day === null) {
                                        return <div key={`empty-${idx}`} className="bg-slate-50/20 dark:bg-slate-900/20 rounded-xl" />;
                                    }

                                    const dayStr = getLocalDateString(day);
                                    const daySchedules = filteredSchedules.filter((s: any) => {
                                        const sDateOnly = s.date ? s.date.split('T')[0].split(' ')[0] : '';
                                        return sDateOnly === dayStr;
                                    });
                                    const isSelected = selectedDate === dayStr;
                                    const isToday = getLocalDateString(new Date()) === dayStr;

                                    return (
                                        <div
                                            key={dayStr}
                                            onClick={() => setSelectedDate(dayStr)}
                                            className={`p-2 rounded-2xl border text-center flex flex-col justify-between items-center cursor-pointer transition-all min-h-[50px] relative ${isSelected
                                                    ? 'bg-blue-600 dark:bg-blue-600 text-white border-transparent shadow-md scale-102'
                                                    : isToday
                                                        ? 'bg-blue-50/80 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800/50 text-blue-700 dark:text-blue-400 hover:bg-blue-100/50 dark:hover:bg-blue-800/30'
                                                        : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                                                }`}
                                        >
                                            <span className="text-xs font-black">{day.getDate()}</span>

                                            {daySchedules.length > 0 && (
                                                <span className={`w-2.5 h-2.5 rounded-full flex items-center justify-center mt-1.5 shadow-sm ${isSelected ? 'bg-white' : 'bg-gradient-to-tr from-teal-400 to-blue-500'
                                                    }`} title={`${daySchedules.length} Session(s)`} />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Right Side: Sidebar listing sessions for the selected calendar day */}
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm flex flex-col h-full overflow-hidden transition-all">
                            <div className="border-b border-slate-100 dark:border-slate-700 pb-3 mb-4">
                                <h3 className="font-bold text-gray-800 dark:text-slate-100 text-sm">Sessions Available</h3>
                                <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mt-0.5">
                                    {new Date(selectedDate).toLocaleDateString(undefined, { dateStyle: 'long' })}
                                </p>
                            </div>

                            <div className="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar min-h-[300px] md:min-h-0">
                                {selectedDateSchedules.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center p-8 text-gray-400">
                                        <svg className="w-12 h-12 text-gray-200 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                        <h4 className="font-bold text-xs">No Sessions Scheduled</h4>
                                        <p className="text-[10px] mt-0.5">No doctor sessions are available on this date.</p>
                                    </div>
                                ) : (
                                    selectedDateSchedules.map((schedule: any) => {
                                        const activeAppointments = schedule.appointments?.filter((apt: any) => apt.status !== 'rejected') || [];
                                        const isFull = activeAppointments.length >= schedule.number_of_patients;
                                        const hasBooked = schedule.appointments?.some((apt: any) => apt.patient_id === auth.user.patient?.id);
                                        const slotsLeft = schedule.number_of_patients - activeAppointments.length;

                                        return (
                                            <div
                                                key={schedule.id}
                                                className="p-4 border border-slate-100 dark:border-slate-700 rounded-2xl hover:border-blue-100 dark:hover:border-slate-600 hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-all flex flex-col gap-3 bg-white dark:bg-slate-800"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        onClick={() => setSelectedDoctorForModal(schedule.doctor)}
                                                        className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm overflow-hidden flex-shrink-0 cursor-pointer"
                                                    >
                                                        {schedule.doctor.user?.avatar ? (
                                                            <img src={`/storage/${schedule.doctor.user.avatar}`} alt={schedule.doctor.user.name} className="h-full w-full object-cover" />
                                                        ) : (
                                                            schedule.doctor.user.name.charAt(0)
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-xs font-black text-slate-800 dark:text-slate-200">Dr. {schedule.doctor.user.name}</h4>
                                                        <p className="text-[10px] text-blue-600 dark:text-blue-400 font-bold">{schedule.doctor.specialty.name}</p>
                                                    </div>
                                                </div>

                                                <div className="border-t border-slate-100/50 dark:border-slate-700/50 pt-2 flex justify-between items-center text-xs">
                                                    <div>
                                                        <p className="font-bold text-slate-700 dark:text-slate-300 flex items-center">
                                                            {schedule.title}
                                                            {schedule.type === 'virtual' && (
                                                                <span className="ml-1.5 inline-flex items-center gap-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-[9px] px-1.5 py-0.5 rounded-full font-bold border border-purple-200 dark:border-purple-800">
                                                                    VIRTUAL
                                                                </span>
                                                            )}
                                                        </p>
                                                        <p className="text-slate-400 dark:text-slate-500 text-[10px] font-semibold mt-0.5">{formatTime12Hour(schedule.time)} ({slotsLeft} left)</p>
                                                    </div>

                                                    <button
                                                        onClick={() => openBookingModal(schedule)}
                                                        disabled={isFull || hasBooked}
                                                        className={`py-1.5 px-3 rounded-lg font-black text-[10px] shadow-sm transition-all ${isFull || hasBooked
                                                                ? 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed shadow-none'
                                                                : 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-103'
                                                            }`}
                                                    >
                                                        {isFull ? 'Full' : (hasBooked ? 'Booked' : 'Book')}
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Booking Confirmation Modal */}
            <Transition appear show={showBookingModal} as={Fragment}>
                <Dialog as="div" className="relative z-[100]" onClose={closeBookingModal}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-md transform flex flex-col max-h-[90vh] overflow-hidden rounded-3xl bg-white dark:bg-slate-800 p-6 text-left align-middle shadow-2xl transition-all relative">
                                    <button
                                        onClick={closeBookingModal}
                                        className="absolute top-4 right-4 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-all bg-gray-100 dark:bg-slate-700 rounded-full p-1 outline-none z-10"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                    </button>

                                    {selectedSchedule && (
                                        <>
                                            <div className="text-center mb-5 flex-shrink-0">
                                                <div className="h-14 w-14 bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-full flex items-center justify-center mx-auto mb-3">
                                                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                                </div>
                                                <Dialog.Title as="h3" className="text-2xl font-bold text-gray-900 dark:text-white">
                                                    Confirm Booking
                                                </Dialog.Title>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5">Book your consultation session:</p>
                                            </div>

                                            <div id="booking-scroll-container" className="flex-1 overflow-y-auto custom-scrollbar pr-3 mb-2 scroll-smooth">
                                                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700 mb-5">
                                                    <p className="font-bold text-base text-slate-800 dark:text-slate-200 text-center mb-1">Dr. {selectedSchedule.doctor.user.name}</p>
                                                    <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold text-center mb-4">{selectedSchedule.doctor.specialty.name}</p>

                                                    <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700 pt-3">
                                                        <div className="flex justify-between">
                                                            <span className="font-medium">Date:</span>
                                                            <span className="text-slate-900 dark:text-slate-200 font-bold">{new Date(selectedSchedule.date).toLocaleDateString()}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="font-medium">Session Start:</span>
                                                            <span className="text-slate-900 dark:text-slate-200 font-bold">{formatTime12Hour(selectedSchedule.time)}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <form id="booking-form" onSubmit={submitBooking}>
                                                    {errors.schedule_id && (
                                                        <div className="mb-3 p-2 bg-rose-50 text-rose-600 text-xs rounded-lg border border-rose-100">
                                                            {errors.schedule_id}
                                                        </div>
                                                    )}

                                                    {errors.time_slot && (
                                                        <div className="mb-3 p-2 bg-rose-50 text-rose-600 text-xs rounded-lg border border-rose-100">
                                                            {errors.time_slot}
                                                        </div>
                                                    )}

                                                    {/* Time Slots Selector */}
                                                    <div className="mb-5">
                                                        <label className="block text-[10px] font-black capitalize tracking-wider text-slate-400 mb-2.5">Select a Time Slot</label>
                                                        <div className="grid grid-cols-2 gap-2.5">
                                                            {generateTimeSlots(selectedSchedule).map((slot: string) => {
                                                                const isBooked = isSlotBooked(selectedSchedule, slot);
                                                                const isSelected = data.time_slot === slot;

                                                                return (
                                                                    <button
                                                                        key={slot}
                                                                        type="button"
                                                                        disabled={isBooked}
                                                                        onClick={() => {
                                                                            setData('time_slot', slot);
                                                                            setTimeout(() => {
                                                                                const container = document.getElementById('booking-scroll-container');
                                                                                const tnc = document.getElementById('tnc-section');
                                                                                if (container && tnc) {
                                                                                    const cRect = container.getBoundingClientRect();
                                                                                    const tRect = tnc.getBoundingClientRect();
                                                                                    const isVisible = tRect.top >= cRect.top && tRect.bottom <= cRect.bottom;
                                                                                    if (!isVisible) {
                                                                                        // Custom easeOutExpo scroll mimicking Lenis
                                                                                        const start = container.scrollTop;
                                                                                        const to = tnc.offsetTop - 20; // 20px padding
                                                                                        const change = to - start;
                                                                                        let startTime: number | null = null;
                                                                                        const duration = 1200; // 1.2 seconds like Lenis

                                                                                        const animateScroll = (timestamp: number) => {
                                                                                            if (!startTime) startTime = timestamp;
                                                                                            const elapsed = timestamp - startTime;
                                                                                            const progress = Math.min(elapsed / duration, 1);
                                                                                            const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
                                                                                            
                                                                                            container.scrollTop = start + change * easeProgress;
                                                                                            
                                                                                            if (progress < 1) {
                                                                                                requestAnimationFrame(animateScroll);
                                                                                            }
                                                                                        };
                                                                                        requestAnimationFrame(animateScroll);
                                                                                    }
                                                                                }
                                                                            }, 50);
                                                                        }}
                                                                        className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all text-center flex flex-col items-center justify-center gap-1 ${isBooked
                                                                                ? 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-600 cursor-not-allowed line-through'
                                                                                : isSelected
                                                                                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-800 border-transparent text-white shadow-md'
                                                                                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                                                            }`}
                                                                    >
                                                                        <span>{formatTimeSlot12Hour(slot)}</span>
                                                                        <span className={`text-[10px] ${isBooked ? 'text-slate-400 font-medium' : isSelected ? 'text-blue-100 font-medium' : 'text-emerald-600 font-black'}`}>
                                                                            {isBooked ? 'Booked' : 'Available'}
                                                                        </span>
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>

                                                    <div 
                                                        id="tnc-section" 
                                                        className={`mb-2 mx-[2px] flex items-start gap-3 p-4 rounded-xl border transition-all duration-500 ${
                                                            data.time_slot && !confirmCheckbox 
                                                                ? 'bg-teal-50 dark:bg-teal-900/40 border-teal-400 dark:border-teal-500 ring-2 ring-teal-400/50 shadow-sm' 
                                                                : 'bg-teal-50/50 dark:bg-teal-900/20 border-teal-100/50 dark:border-teal-800/50'
                                                        }`}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            id="confirm-checkbox"
                                                            checked={confirmCheckbox}
                                                            onChange={(e) => setConfirmCheckbox(e.target.checked)}
                                                            className="mt-0.5 h-4 w-4 rounded border-gray-300 dark:border-slate-700 text-teal-600 dark:bg-slate-700 focus:ring-teal-500 cursor-pointer flex-shrink-0"
                                                        />
                                                        <label htmlFor="confirm-checkbox" className="text-xs text-slate-600 dark:text-slate-300 select-none cursor-pointer leading-relaxed">
                                                            I confirm that I want to book this appointment and will attend the scheduled session.
                                                            {data.time_slot && !confirmCheckbox && (
                                                                <span className="block mt-1 text-teal-600 dark:text-teal-400 font-bold animate-pulse">
                                                                    ↑ Please check this box to proceed
                                                                </span>
                                                            )}
                                                        </label>
                                                    </div>
                                                </form>
                                            </div>

                                            <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-slate-700 flex-shrink-0 mt-3">
                                                <button
                                                    type="button"
                                                    onClick={closeBookingModal}
                                                    className="flex-1 py-3 px-4 text-sm font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-xl transition-all outline-none"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="submit"
                                                    form="booking-form"
                                                    disabled={processing || !confirmCheckbox || !data.time_slot}
                                                    className="flex-1 py-3 px-4 text-sm font-bold text-white bg-gradient-to-r from-teal-500 to-blue-600 hover:shadow-lg rounded-xl shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all transform enabled:hover:scale-[1.02] outline-none"
                                                >
                                                    Confirm Booking
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            {/* Doctor Profile Details Modal */}
            <DoctorDetailsModal
                show={selectedDoctorForModal !== null}
                onClose={() => setSelectedDoctorForModal(null)}
                doctor={selectedDoctorForModal}
            />
        </SidebarLayout>
    );
}


