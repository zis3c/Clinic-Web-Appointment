import { useState, Fragment } from 'react';
import SidebarLayout from '@/Layouts/SidebarLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Dialog, Transition } from '@headlessui/react';
import SessionDetailsModal from '@/Components/SessionDetailsModal';
import { formatTime12Hour } from '../../Utils/time';

export default function Schedules({ auth, schedules }: any) {
    const [selectedSession, setSelectedSession] = useState(null);
    const [sessionToDelete, setSessionToDelete] = useState<any>(null);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [pendingDeleteIds, setPendingDeleteIds] = useState<number[]>([]);

    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        date: '',
        time: '',
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
        setPendingDeleteIds(prev => [...prev, targetId]);

        // Dispatch undo toast event
        const event = new CustomEvent('show-undo-toast', {
            detail: {
                message: `Session "${sessionTitle}" has been cancelled.`,
                onConfirm: () => {
                    router.delete(route('doctor.schedules.destroy', targetId), {
                        onFinish: () => {
                            setPendingDeleteIds(prev => prev.filter(id => id !== targetId));
                        },
                        preserveScroll: true
                    });
                },
                onUndo: () => {
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
                <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex-col md:flex-row gap-4 transition-colors">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 dark:text-slate-100">Your Scheduled Sessions</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">View and manage your upcoming availability.</p>
                    </div>
                    <div className="flex items-center gap-4 w-full md:w-auto">
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
                            className="h-11 px-5 flex items-center justify-center bg-gradient-to-r from-teal-400 to-blue-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all whitespace-nowrap"
                        >
                            + Add New Session
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-slate-800 overflow-hidden shadow-sm rounded-2xl border border-gray-100 dark:border-slate-700 relative transition-colors">
                    {/* Patch to cover the scrollbar track gap in the header */}
                    <div className="absolute top-0 right-0 w-[8px] h-[49px] bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 z-20"></div>

                    <div className="overflow-x-auto h-[calc(100vh-190px)] overflow-y-auto custom-scrollbar flex flex-col">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                            <thead className="bg-gray-50 dark:bg-slate-800 sticky top-0 z-10 ring-1 ring-gray-200 dark:ring-slate-700">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Session Details</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date & Time</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Capacity</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                                {filteredSchedules.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((schedule: any) => {
                                    const isFull = schedule.appointments?.length >= schedule.number_of_patients;
                                    
                                    return (
                                        <tr key={schedule.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
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
                                                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${isFull ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-400' : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400'}`}>
                                                    {schedule.appointments?.length || 0} / {schedule.number_of_patients} Booked
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end items-center space-x-5">
                                                    <button 
                                                        onClick={() => setSelectedSession(schedule)}
                                                        className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 font-bold transition-colors"
                                                    >
                                                        View Bookings
                                                    </button>
                                                    
                                                    {/* Vertical Separator */}
                                                    <div className="h-4 w-px bg-gray-300 dark:bg-gray-600 rounded"></div>

                                                    <button 
                                                        onClick={() => { setSessionToDelete(schedule); setIsCancelModalOpen(true); }}
                                                        className="text-rose-500 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 font-bold transition-colors"
                                                    >
                                                        Cancel Session
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
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
                                        
                                        <div className="flex gap-3 mt-8">
                                            <button 
                                                type="button" 
                                                onClick={() => setIsCancelModalOpen(false)}
                                                disabled={isDeleting}
                                                className="flex-1 py-3 px-4 text-sm font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-xl transition-colors focus:outline-none"
                                            >
                                                Keep Session
                                            </button>
                                            <button 
                                                type="button" 
                                                onClick={confirmDelete}
                                                disabled={isDeleting}
                                                className="flex-1 py-3 px-4 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md disabled:opacity-50 transition-all focus:outline-none"
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
                            <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm" />
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
                                    <Dialog.Panel className="w-full max-w-lg transform overflow-visible rounded-3xl bg-white p-8 text-left align-middle shadow-2xl transition-all relative">
                                        <button 
                                            onClick={() => setShowAddModal(false)}
                                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                                        >
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                        </button>
                                        
                                        <Dialog.Title as="h3" className="text-2xl font-bold mb-6 text-gray-900">
                                            Add New Session
                                        </Dialog.Title>
                                        
                                        <form onSubmit={submitAdd} className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-1">Session Title</label>
                                                <input type="text" value={data.title} onChange={e => setData('title', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-700 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none shadow-sm font-medium" placeholder="e.g. Morning Checkups" required />
                                                {errors.title && <div className="text-rose-500 text-sm mt-1">{errors.title}</div>}
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-bold text-gray-700 mb-1">Date</label>
                                                    <input type="date" value={data.date} onChange={e => setData('date', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-700 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none shadow-sm font-medium cursor-pointer" required />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-bold text-gray-700 mb-1">Time</label>
                                                    <input type="time" value={data.time} onChange={e => setData('time', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-700 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none shadow-sm font-medium cursor-pointer" required />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-1">Max Patients</label>
                                                <input type="number" min="1" value={data.number_of_patients} onChange={(e: any) => setData('number_of_patients', Number(e.target.value))} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-700 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none shadow-sm font-medium" required />
                                            </div>

                                            <div className="pt-4 flex justify-end">
                                                <button 
                                                    type="button" 
                                                    onClick={() => setShowAddModal(false)}
                                                    className="mr-3 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                                                >
                                                    Cancel
                                                </button>
                                                <button 
                                                    type="submit" 
                                                    disabled={processing}
                                                    className="px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm disabled:opacity-50"
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
