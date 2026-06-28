import { useState, Fragment } from 'react';
import SidebarLayout from '@/Layouts/SidebarLayout';
import { Head, useForm } from '@inertiajs/react';
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
                <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex-col md:flex-row gap-4 mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">Available Doctor Sessions</h3>
                        <p className="text-sm text-gray-500">Select an available session below to book your appointment.</p>
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
                                className="pl-9 w-full md:w-60 border-gray-200 rounded-xl text-xs focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50 h-10 transition-all outline-none"
                            />
                        </div>

                        {/* View Switcher Toggle */}
                        <div className="flex bg-slate-100 p-1 rounded-xl">
                            <button
                                onClick={() => setViewMode('table')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'table' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path></svg>
                                Table
                            </button>
                            <button
                                onClick={() => setViewMode('calendar')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'calendar' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                Calendar
                            </button>
                        </div>
                    </div>
                </div>

                {/* Conditional View Rendering */}
                {viewMode === 'table' ? (
                    /* TABLE VIEW */
                    <div className="bg-white overflow-hidden shadow-sm rounded-2xl border border-gray-100 relative">
                        <div className="overflow-x-auto h-[calc(100vh-190px)] overflow-y-auto custom-scrollbar flex flex-col">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50 sticky top-0 z-10 ring-1 ring-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Doctor Details</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Session Info</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Availability</th>
                                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredSchedules.map((schedule: any) => {
                                        const activeAppointments = schedule.appointments?.filter((apt: any) => apt.status !== 'rejected') || [];
                                        const isFull = activeAppointments.length >= schedule.number_of_patients;
                                        const hasBooked = schedule.appointments?.some((apt: any) => apt.patient_id === auth.user.patient?.id);
                                        const slotsLeft = schedule.number_of_patients - activeAppointments.length;

                                        return (
                                            <tr key={schedule.id} className="hover:bg-gray-50 transition-colors">
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
                                                            <div className="text-sm font-bold text-gray-900 group-hover/doctor:text-blue-600 transition-colors">Dr. {schedule.doctor.user.name}</div>
                                                            <div className="text-xs text-blue-600 font-semibold">{schedule.doctor.specialty.name}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-bold text-gray-900">{schedule.title}</div>
                                                    <div className="text-xs text-gray-500 mt-0.5">
                                                        {new Date(schedule.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at {formatTime12Hour(schedule.time)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-3 py-1 inline-flex text-[10px] leading-5 font-bold rounded-full ${isFull ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}`}>
                                                        {isFull ? 'Fully Booked' : `${slotsLeft} slots left`}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button
                                                        onClick={() => openBookingModal(schedule)}
                                                        disabled={isFull || hasBooked}
                                                        className={`inline-flex items-center justify-center py-2 px-4 font-bold rounded-xl shadow-sm transition-all text-xs ${isFull || hasBooked
                                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
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
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start h-[calc(100vh-190px)]">
                        {/* Left Side: Custom Month Grid */}
                        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full overflow-hidden">
                            {/* Calendar Header */}
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-gray-800 text-base">{monthName}</h3>
                                <div className="flex items-center gap-1.5">
                                    <button
                                        onClick={prevMonth}
                                        className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-slate-50 transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                                    </button>
                                    <button
                                        onClick={nextMonth}
                                        className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-slate-50 transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                                    </button>
                                </div>
                            </div>

                            {/* Calendar Weekday Names */}
                            <div className="grid grid-cols-7 gap-1 text-center font-bold text-gray-400 text-[10px] uppercase tracking-wider mb-2">
                                {dayNames.map(d => <div key={d}>{d}</div>)}
                            </div>

                            {/* Calendar Days Grid */}
                            <div className="grid grid-cols-7 gap-2 flex-1">
                                {calendarDays.map((day, idx) => {
                                    if (day === null) {
                                        return <div key={`empty-${idx}`} className="bg-slate-50/20 rounded-xl" />;
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
                                                    ? 'bg-blue-600 text-white border-transparent shadow-md scale-102'
                                                    : isToday
                                                        ? 'bg-blue-50/80 border-blue-200 text-blue-700 hover:bg-blue-100/50'
                                                        : 'bg-white border-slate-100 text-gray-700 hover:bg-slate-50'
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
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full overflow-hidden">
                            <div className="border-b border-slate-100 pb-3 mb-4">
                                <h3 className="font-bold text-gray-800 text-sm">Sessions Available</h3>
                                <p className="text-xs text-blue-600 font-semibold mt-0.5">
                                    {new Date(selectedDate).toLocaleDateString(undefined, { dateStyle: 'long' })}
                                </p>
                            </div>

                            <div className="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar">
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
                                                className="p-4 border border-slate-100 rounded-2xl hover:border-blue-100 hover:bg-slate-50/50 transition-all flex flex-col gap-3"
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
                                                        <h4 className="text-xs font-black text-slate-800">Dr. {schedule.doctor.user.name}</h4>
                                                        <p className="text-[10px] text-blue-600 font-bold">{schedule.doctor.specialty.name}</p>
                                                    </div>
                                                </div>

                                                <div className="border-t border-slate-100/50 pt-2 flex justify-between items-center text-xs">
                                                    <div>
                                                        <p className="font-bold text-slate-700">{schedule.title}</p>
                                                        <p className="text-slate-400 text-[10px] font-semibold mt-0.5">{formatTime12Hour(schedule.time)} ({slotsLeft} left)</p>
                                                    </div>

                                                    <button
                                                        onClick={() => openBookingModal(schedule)}
                                                        disabled={isFull || hasBooked}
                                                        className={`py-1.5 px-3 rounded-lg font-black text-[10px] shadow-sm transition-all ${isFull || hasBooked
                                                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
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
                                <Dialog.Panel className="w-full max-w-md transform flex flex-col max-h-[90vh] overflow-hidden rounded-3xl bg-white p-6 text-left align-middle shadow-2xl transition-all relative">
                                    <button
                                        onClick={closeBookingModal}
                                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors bg-gray-100 rounded-full p-1 focus:outline-none z-10"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                    </button>

                                    {selectedSchedule && (
                                        <>
                                            <div className="text-center mb-5 flex-shrink-0">
                                                <div className="h-14 w-14 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                                </div>
                                                <Dialog.Title as="h3" className="text-2xl font-bold text-gray-900">
                                                    Confirm Booking
                                                </Dialog.Title>
                                                <p className="text-sm text-gray-500 mt-1.5">Book your consultation session:</p>
                                            </div>

                                            <div className="flex-1 overflow-y-auto custom-scrollbar pr-3 mb-2">
                                                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 mb-5">
                                                    <p className="font-bold text-base text-slate-800 text-center mb-1">Dr. {selectedSchedule.doctor.user.name}</p>
                                                    <p className="text-xs text-blue-600 font-semibold text-center mb-4">{selectedSchedule.doctor.specialty.name}</p>

                                                    <div className="space-y-2 text-xs text-slate-600 border-t border-slate-200 pt-3">
                                                        <div className="flex justify-between">
                                                            <span className="font-medium">Date:</span>
                                                            <span className="text-slate-900 font-bold">{new Date(selectedSchedule.date).toLocaleDateString()}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="font-medium">Session Start:</span>
                                                            <span className="text-slate-900 font-bold">{formatTime12Hour(selectedSchedule.time)}</span>
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
                                                        <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2.5">Select a Time Slot</label>
                                                        <div className="grid grid-cols-2 gap-2.5">
                                                            {generateTimeSlots(selectedSchedule).map((slot: string) => {
                                                                const isBooked = isSlotBooked(selectedSchedule, slot);
                                                                const isSelected = data.time_slot === slot;

                                                                return (
                                                                    <button
                                                                        key={slot}
                                                                        type="button"
                                                                        disabled={isBooked}
                                                                        onClick={() => setData('time_slot', slot)}
                                                                        className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all text-center flex flex-col items-center justify-center gap-1 ${isBooked
                                                                                ? 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed line-through'
                                                                                : isSelected
                                                                                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 border-transparent text-white shadow-md'
                                                                                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
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

                                                    <div className="mb-2 flex items-start gap-3 bg-teal-50/50 p-4 rounded-xl border border-teal-100/50">
                                                        <input
                                                            type="checkbox"
                                                            id="confirm-checkbox"
                                                            checked={confirmCheckbox}
                                                            onChange={(e) => setConfirmCheckbox(e.target.checked)}
                                                            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500 cursor-pointer flex-shrink-0"
                                                        />
                                                        <label htmlFor="confirm-checkbox" className="text-xs text-slate-600 select-none cursor-pointer leading-relaxed">
                                                            I confirm that I want to book this appointment and will attend the scheduled session.
                                                        </label>
                                                    </div>
                                                </form>
                                            </div>

                                            <div className="flex gap-3 pt-4 border-t border-gray-100 flex-shrink-0 mt-3">
                                                <button
                                                    type="button"
                                                    onClick={closeBookingModal}
                                                    className="flex-1 py-3 px-4 text-sm font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors focus:outline-none"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="submit"
                                                    form="booking-form"
                                                    disabled={processing || !confirmCheckbox || !data.time_slot}
                                                    className="flex-1 py-3 px-4 text-sm font-bold text-white bg-gradient-to-r from-teal-500 to-blue-600 hover:shadow-lg rounded-xl shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all transform enabled:hover:scale-[1.02] focus:outline-none"
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
