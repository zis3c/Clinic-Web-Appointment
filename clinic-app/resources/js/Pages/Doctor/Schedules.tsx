import { useState, Fragment } from 'react';
import { useAutoRefresh } from '@/hooks/useAutoRefresh';
import SidebarLayout from '@/Layouts/SidebarLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { Dialog, Transition } from '@headlessui/react';
import SessionDetailsModal from '@/Components/SessionDetailsModal';
import { formatTime12Hour } from '../../Utils/time';
import CustomDatePicker from '@/Components/CustomDatePicker';
import CustomTimePicker from '@/Components/CustomTimePicker';
import CustomSelect from '@/Components/CustomSelect';

export default function Schedules({ auth, schedules }: any) {
    useAutoRefresh(['schedules']);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedSession, setSelectedSession] = useState(null);
    const [sessionToDelete, setSessionToDelete] = useState<any>(null);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [pendingDeleteIds, setPendingDeleteIds] = useState<number[]>([]);

    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        date: '',
        time: '',
        type: 'in_person',
        number_of_patients: 10,
    });

    const openAddModal = () => {
        reset();
        
        // Robust way to get local timezone YYYY-MM-DD and HH:mm
        const now = new Date();
        const offset = now.getTimezoneOffset() * 60000;
        const localISOTime = (new Date(now.getTime() - offset)).toISOString().slice(0, 16);
        
        setData({
            title: '',
            date: localISOTime.split('T')[0],
            time: localISOTime.split('T')[1],
            type: 'in_person',
            number_of_patients: 10,
        });
        
        setShowAddModal(true);
    };

    const submitAdd = (e: any) => {
        e.preventDefault();
        post(route('doctor.schedules.store'), {
            onSuccess: () => {
                setShowAddModal(false);
                reset();
            },
        });
    };

    const confirmDelete = () => {
        if (!sessionToDelete) return;
        const targetId = sessionToDelete.id;
        const sessionTitle = sessionToDelete.title;
        
        // Close modal and hide session immediately
        setIsCancelModalOpen(false);
        setIsDeleting(true);
        setPendingDeleteIds(prev => [...prev, targetId]);

        // Dispatch undo toast event
        const event = new CustomEvent('show-undo-toast', {
            detail: {
                message: `Session "${sessionTitle}" has been cancelled.`,
                onConfirm: () => {
                    router.delete(route('doctor.schedules.destroy', targetId), {
                        onFinish: () => {
                            setIsDeleting(false);
                            setPendingDeleteIds(prev => prev.filter(id => id !== targetId));
                        },
                        preserveScroll: true
                    });
                },
                onUndo: () => {
                    setIsDeleting(false);
                    setPendingDeleteIds(prev => prev.filter(id => id !== targetId));
                }
            }
        });
        window.dispatchEvent(event);
    };

    const filteredSchedules = schedules.filter((schedule: any) => 
        !pendingDeleteIds.includes(schedule.id) && (
            schedule.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            schedule.date.includes(searchQuery) ||
            schedule.time.includes(searchQuery)
        )
    );

    return (
        <SidebarLayout
            user={auth.user}
            header={<h2 className="font-semibold text-2xl text-gray-800 leading-tight">My Schedule</h2>}
        >
            <Head title="My Schedule" />

            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                
                {/* Header Actions */}
                <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex-col md:flex-row gap-4 transition-all">
                    <div className="w-full text-center md:text-left">
                        <h3 className="text-base md:text-lg font-bold text-gray-800 dark:text-slate-100">Your Scheduled Sessions</h3>
                        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">View and manage your upcoming availability.</p>
                    </div>
                    <div className="flex flex-col md:flex-row items-center gap-3 md:gap-4 w-full md:w-auto">
                        <div className="relative w-full md:w-auto">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                            </div>
                            <input 
                                type="text" 
                                placeholder="Search schedules..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 w-full md:w-64 border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50 dark:bg-slate-900/50 dark:text-white h-11 transition-all outline-none"
                            />
                        </div>
                        <button 
                            onClick={openAddModal}
                            className="w-full md:w-auto h-10 md:h-11 px-4 md:px-5 flex items-center justify-center bg-gradient-to-r from-teal-400 to-blue-600 dark:from-teal-600 dark:to-blue-700 text-white text-sm md:text-base font-semibold rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] md:hover:scale-105 transition-all whitespace-nowrap"
                        >
                            + Add New Session
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-slate-800 overflow-hidden shadow-sm rounded-2xl border border-gray-100 dark:border-slate-700 relative transition-all">
                    {/* Patch to cover the scrollbar track gap in the header */}
                    <div className="absolute top-0 right-0 w-[8px] h-[49px] bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 z-20"></div>

                    <div className="overflow-x-auto h-[calc(100vh-190px)] md:overflow-y-auto custom-scrollbar flex flex-col p-4 md:p-0">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700 hidden md:table">
                            <thead className="bg-gray-50/80 dark:bg-slate-800/80 backdrop-blur-md sticky top-0 z-10 ring-1 ring-gray-200 dark:ring-slate-700">
                                <tr>
                                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 dark:text-gray-400 capitalize tracking-wider w-12">#</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 capitalize tracking-wider">Session Details</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 capitalize tracking-wider">Date & Time</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 capitalize tracking-wider">Capacity</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 dark:text-gray-400 capitalize tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                                {filteredSchedules.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((schedule: any, index: number) => {
                                    const isFull = schedule.appointments?.length >= schedule.number_of_patients;
                                    
                                    return (
                                        <tr key={schedule.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-all">
                                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold text-gray-400 dark:text-gray-500">
                                                {index + 1}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-400 font-bold">
                                                        {schedule.title.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-bold text-gray-900 dark:text-white">{schedule.title}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-bold text-gray-900 dark:text-white">{new Date(schedule.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">{formatTime12Hour(schedule.time)}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    {schedule.type === 'virtual' && (
                                                        <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-[10px] px-2 py-0.5 rounded-full font-bold border border-purple-200 dark:border-purple-800 flex items-center gap-1">
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                                                            VIRTUAL
                                                        </span>
                                                    )}
                                                    <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg ${isFull ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400' : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'}`}>
                                                        {isFull ? 'Full' : `${schedule.appointments?.length || 0}/${schedule.number_of_patients}`}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end items-center gap-2.5">
                                                    <button 
                                                        onClick={() => setSelectedSession(schedule)}
                                                        title="View Bookings"
                                                        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 p-2 rounded-xl transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                                                    </button>
                                                    <button 
                                                        onClick={() => { setSessionToDelete(schedule); setIsCancelModalOpen(true); }}
                                                        title="Cancel Session"
                                                        className="text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 bg-rose-50 dark:bg-rose-900/30 hover:bg-rose-100 dark:hover:bg-rose-900/50 p-2 rounded-xl transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        {/* Mobile Card View */}
                        <div className="flex flex-col space-y-4 md:hidden">
                            {filteredSchedules.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((schedule: any) => {
                                const isFull = schedule.appointments?.length >= schedule.number_of_patients;
                                
                                return (
                                    <div key={schedule.id} className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-400 font-bold shrink-0">
                                                {schedule.title.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center">
                                                    {schedule.title}
                                                    {schedule.type === 'virtual' && (
                                                        <span className="ml-2 inline-flex items-center gap-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-[10px] px-2 py-0.5 rounded-full font-bold border border-purple-200 dark:border-purple-800">
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                                                            VIRTUAL
                                                        </span>
                                                    )}
                                                </h4>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                    {new Date(schedule.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at {formatTime12Hour(schedule.time)}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex justify-between items-center bg-gray-50 dark:bg-slate-900/50 p-3 rounded-xl border border-gray-100 dark:border-slate-700/50 mb-4">
                                            <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Capacity</span>
                                            <span className={`px-2 py-0.5 inline-flex text-[10px] font-bold rounded-full ${isFull ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-400' : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400'}`}>
                                                {schedule.appointments?.length || 0} / {schedule.number_of_patients} Booked
                                            </span>
                                        </div>
                                        
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => setSelectedSession(schedule)}
                                                className="flex-1 py-2 px-3 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-xl transition-all text-center"
                                            >
                                                View Bookings
                                            </button>
                                            <button 
                                                onClick={() => { setSessionToDelete(schedule); setIsCancelModalOpen(true); }}
                                                className="flex-none p-2 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30 hover:bg-rose-100 dark:hover:bg-rose-900/50 rounded-xl transition-all"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {filteredSchedules.length === 0 && (
                            <div className="flex-1 flex flex-col justify-center items-center p-10 text-center text-gray-500 dark:text-gray-400">
                                {searchQuery ? "No scheduled sessions found matching your search." : "You have no scheduled sessions. Please contact an Admin to schedule your availability."}
                            </div>
                        )}
                    </div>
                </div>

                {/* Session Details Modal */}
                <SessionDetailsModal 
                    selectedSession={selectedSession} 
                    onClose={() => setSelectedSession(null)} 
                />

                {/* Cancel Session Confirmation Modal */}
                <Transition appear show={isCancelModalOpen} as={Fragment}>
                    <Dialog as="div" className="relative z-[100]" onClose={() => !isDeleting && setIsCancelModalOpen(false)}>
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <div className="fixed inset-0 bg-gray-500/75 dark:bg-slate-900/80 backdrop-blur-sm" />
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
                                    <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-3xl bg-white dark:bg-slate-800 p-8 text-left align-middle shadow-2xl transition-all relative">
                                        <div className="text-center mb-6">
                                            <div className="h-16 w-16 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                                            </div>
                                            <Dialog.Title as="h3" className="text-2xl font-bold text-gray-900 dark:text-white">
                                                Cancel Session?
                                            </Dialog.Title>
                                            <p className="text-gray-500 dark:text-gray-400 mt-2">
                                                Are you sure you want to cancel the session <strong>{sessionToDelete?.title}</strong>? This action cannot be undone and will permanently remove this availability slot.
                                            </p>
                                        </div>
                                        
                                        <div className="flex flex-col-reverse sm:flex-row gap-3 mt-8">
                                            <button 
                                                type="button" 
                                                onClick={() => setIsCancelModalOpen(false)}
                                                disabled={isDeleting}
                                                className="flex-1 py-3 px-4 text-sm font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-xl transition-all outline-none"
                                            >
                                                Keep Session
                                            </button>
                                            <button 
                                                type="button" 
                                                onClick={confirmDelete}
                                                disabled={isDeleting}
                                                className="flex-1 py-3 px-4 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md disabled:opacity-50 transition-all outline-none"
                                            >
                                                {isDeleting ? 'Cancelling...' : 'Yes, Cancel Session'}
                                            </button>
                                        </div>
                                    </Dialog.Panel>
                                </Transition.Child>
                            </div>
                        </div>
                    </Dialog>
                </Transition>

                {/* Add Modal */}
                <Transition appear show={showAddModal} as={Fragment}>
                    <Dialog as="div" className="relative z-[100]" onClose={() => setShowAddModal(false)}>
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <div className="fixed inset-0 bg-gray-500/75 dark:bg-slate-900/80 backdrop-blur-sm" />
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
                                    <Dialog.Panel className="w-full max-w-lg transform overflow-visible rounded-3xl bg-white dark:bg-slate-800 border border-transparent dark:border-slate-700 p-8 text-left align-middle shadow-2xl transition-all relative">
                                        <button 
                                            onClick={() => setShowAddModal(false)}
                                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                        >
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                        </button>
                                        
                                        <Dialog.Title as="h3" className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                                            Add New Session
                                        </Dialog.Title>
                                        
                                        <form onSubmit={submitAdd} className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Session Title</label>
                                                <input type="text" value={data.title} onChange={e => setData('title', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50 dark:placeholder-gray-500 placeholder:font-normal text-gray-700 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/40 transition-all outline-none shadow-sm font-medium" placeholder="e.g. Morning Checkups" required />
                                                {errors.title && <div className="text-rose-500 text-sm mt-1">{errors.title}</div>}
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Date</label>
                                                    <CustomDatePicker value={data.date} onChange={(val: any) => setData('date', val)} required={true} placement="top" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Time</label>
                                                    <CustomTimePicker value={data.time} onChange={(val: any) => setData('time', val)} required={true} placement="top" />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Consultation Type</label>
                                                <CustomSelect
                                                    value={data.type}
                                                    onChange={(val) => setData('type', val as string)}
                                                    options={[
                                                        { value: 'in_person', label: 'In-Person Consultation' },
                                                        { value: 'virtual', label: 'Virtual Video Call (Telehealth)' },
                                                    ]}
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50 text-gray-700 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/40 transition-all outline-none shadow-sm font-medium cursor-pointer"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Max Patients</label>
                                                <input type="number" min="1" value={data.number_of_patients} onChange={(e: any) => setData('number_of_patients', Number(e.target.value))} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50 dark:placeholder-gray-500 placeholder:font-normal text-gray-700 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/40 transition-all outline-none shadow-sm font-medium" required />
                                            </div>

                                            <div className="pt-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 sm:gap-0">
                                                <button 
                                                    type="button" 
                                                    onClick={() => setShowAddModal(false)}
                                                    className="sm:mr-3 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg text-center"
                                                >
                                                    Cancel
                                                </button>
                                                <button 
                                                    type="submit" 
                                                    disabled={processing}
                                                    className="px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm disabled:opacity-50 text-center"
                                                >
                                                    Create Session
                                                </button>
                                            </div>
                                        </form>
                                    </Dialog.Panel>
                                </Transition.Child>
                            </div>
                        </div>
                    </Dialog>
                </Transition>

            </div>
        </SidebarLayout>
    );
}

