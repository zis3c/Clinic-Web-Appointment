import { useState, Fragment } from 'react';
import SidebarLayout from '@/Layouts/SidebarLayout';
import { Head, useForm, Link, router } from '@inertiajs/react';
import CustomSelect from '@/Components/CustomSelect';
import CustomMultiSelect from '@/Components/CustomMultiSelect';
import { Dialog, Transition } from '@headlessui/react';
import Modal from '@/Components/Modal';

export default function Schedules({ auth, schedules, doctors }: any) {
    const [showAddModal, setShowAddModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [sessionToDelete, setSessionToDelete] = useState<any>(null);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [isBulkMode, setIsBulkMode] = useState(false);
    const [showBulkCancelModal, setShowBulkCancelModal] = useState(false);
    const [viewSchedule, setViewSchedule] = useState<any>(null);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [pendingDeleteIds, setPendingDeleteIds] = useState<number[]>([]);

    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        doctor_ids: [],
        date: '',
        time: '',
        number_of_patients: 10,
    });

    const submit = (e: any) => {
        e.preventDefault();
        post(route('admin.schedules.store'), {
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
                    router.delete(route('admin.schedules.destroy', targetId), {
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

    const handleSelect = (id: number) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handleBulkCancel = () => {
        router.delete(route('admin.schedules.bulk-destroy'), {
            data: { schedule_ids: selectedIds },
            onSuccess: () => {
                setShowBulkCancelModal(false);
                setSelectedIds([]);
                setIsBulkMode(false);
            },
            preserveScroll: true
        });
    };

    const openAddModal = () => {
        reset();

        // Robust way to get local timezone YYYY-MM-DD and HH:mm
        const now = new Date();
        const offset = now.getTimezoneOffset() * 60000;
        const localISOTime = (new Date(now.getTime() - offset)).toISOString().slice(0, 16);

        setData({
            title: '',
            doctor_ids: [],
            date: localISOTime.split('T')[0],
            time: localISOTime.split('T')[1],
            number_of_patients: 10,
        });

        setShowAddModal(true);
    };

    const filteredSchedules = schedules.filter((schedule: any) =>
        !pendingDeleteIds.includes(schedule.id) && (
            schedule.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            schedule.doctor.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            schedule.date.includes(searchQuery) ||
            schedule.time.includes(searchQuery)
        )
    );

    return (
        <SidebarLayout
            user={auth.user}
            header={<h2 className="font-semibold text-2xl text-gray-800 dark:text-slate-100 leading-tight">Manage Schedules</h2>}
        >
            <Head title="Manage Schedules" />

            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">

                {/* Header Actions */}
                <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 transition-colors">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 dark:text-slate-100">Schedule Sessions</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Create and manage doctor availability sessions.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto z-20 relative items-center">
                        {!isBulkMode ? (
                            <button
                                onClick={() => setIsBulkMode(true)}
                                className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 font-bold rounded-xl text-sm transition-all whitespace-nowrap h-11 shadow-sm"
                            >
                                Select
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={() => {
                                        if (filteredSchedules.length > 0 && selectedIds.length === filteredSchedules.length) {
                                            setSelectedIds([]);
                                        } else {
                                            setSelectedIds(filteredSchedules.map((s: any) => s.id));
                                        }
                                    }}
                                    className="px-4 py-2 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800/50 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 font-bold rounded-xl text-sm transition-all whitespace-nowrap h-11"
                                >
                                    {filteredSchedules.length > 0 && selectedIds.length === filteredSchedules.length ? 'Deselect All' : 'Select All'}
                                </button>
                                {selectedIds.length > 0 && (
                                    <button
                                        onClick={() => setShowBulkCancelModal(true)}
                                        className="px-4 py-2 bg-rose-500 text-white hover:bg-rose-600 font-bold rounded-xl text-sm transition-all whitespace-nowrap h-11 shadow-md hover:shadow-lg hover:-translate-y-0.5"
                                    >
                                        Delete Selected ({selectedIds.length})
                                    </button>
                                )}
                                <button
                                    onClick={() => {
                                        setIsBulkMode(false);
                                        setSelectedIds([]);
                                    }}
                                    className="px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600 font-bold rounded-xl text-sm transition-all whitespace-nowrap h-11"
                                >
                                    Done
                                </button>
                            </>
                        )}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                            </div>
                            <input
                                type="text"
                                placeholder="Search schedules..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-11 pl-10 pr-4 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all w-full sm:w-64 bg-gray-50 dark:bg-slate-900/50 text-gray-700 dark:text-slate-200 placeholder-gray-400 dark:placeholder-gray-500"
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

                {/* Table View */}
                <div className="bg-white dark:bg-slate-800 overflow-hidden shadow-sm rounded-2xl border border-gray-100 dark:border-slate-700 relative transition-colors">
                    {/* Patch to cover the scrollbar track gap in the header */}
                    <div className="absolute top-0 right-0 w-[8px] h-[49px] bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 z-20"></div>

                    <div className="overflow-x-auto h-[calc(100vh-190px)] overflow-y-auto custom-scrollbar flex flex-col">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                            <thead className="bg-gray-50 dark:bg-slate-800 sticky top-0 z-10 ring-1 ring-gray-200 dark:ring-slate-700">
                                <tr>
                                    {isBulkMode && <th className="px-6 py-4 w-10"></th>}
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Title / Doctor</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date & Time</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Bookings</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                                {filteredSchedules.map((schedule: any) => (
                                    <tr
                                        key={schedule.id}
                                        onClick={() => {
                                            if (isBulkMode) {
                                                handleSelect(schedule.id);
                                            } else {
                                                setViewSchedule(schedule);
                                                setShowScheduleModal(true);
                                            }
                                        }}
                                        className={`transition-colors cursor-pointer ${selectedIds.includes(schedule.id) ? 'bg-blue-50/50 dark:bg-blue-900/20' : 'hover:bg-blue-50 dark:hover:bg-slate-700/50'}`}
                                    >
                                        {isBulkMode && (
                                            <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.includes(schedule.id)}
                                                    onChange={() => handleSelect(schedule.id)}
                                                    className="w-5 h-5 rounded-md border-gray-300 dark:border-slate-600 text-blue-600 dark:bg-slate-700 focus:ring-blue-500 cursor-pointer"
                                                />
                                            </td>
                                        )}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-bold text-gray-900 dark:text-slate-100">{schedule.title}</div>
                                            <div className="text-sm text-blue-600 dark:text-blue-400 font-semibold">Dr. {schedule.doctor.user.name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 dark:text-slate-100">{new Date(schedule.date).toLocaleDateString()}</div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">{schedule.time}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400">
                                                {schedule.appointments?.length || 0} / {schedule.number_of_patients} Booked
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => { setSessionToDelete(schedule); setIsCancelModalOpen(true); }}
                                                    title="Cancel Session"
                                                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 hover:text-rose-700 dark:hover:text-rose-300 transition-colors shadow-sm"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredSchedules.length === 0 && (
                            <div className="flex-1 flex flex-col justify-center items-center p-10 text-center text-gray-500 dark:text-gray-400">
                                {searchQuery ? 'No schedules found matching your search.' : 'No schedules found.'}
                            </div>
                        )}
                    </div>
                </div>

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

                                        <form onSubmit={submit} className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Session Title</label>
                                                <input type="text" value={data.title} onChange={e => setData('title', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50 dark:placeholder-gray-500 text-gray-700 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none shadow-sm font-medium" placeholder="e.g. Morning Checkups" required />
                                                {errors.title && <div className="text-rose-500 text-sm mt-1">{errors.title}</div>}
                                            </div>

                                            <div className="relative z-50">
                                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Doctors (Select Multiple)</label>
                                                <CustomMultiSelect
                                                    value={data.doctor_ids}
                                                    onChange={(val: any) => setData('doctor_ids', val)}
                                                    options={doctors.map((d: any) => ({ value: d.id, label: `Dr. ${d.user.name}` }))}
                                                    placeholder="Select doctors for this session..."
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50 dark:placeholder-gray-500 text-gray-700 dark:text-slate-200 transition-all outline-none shadow-sm font-medium cursor-pointer"
                                                />
                                                {errors.doctor_ids && <div className="text-rose-500 text-sm mt-1">{errors.doctor_ids}</div>}
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Date</label>
                                                    <input type="date" value={data.date} onChange={e => setData('date', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50 dark:placeholder-gray-500 text-gray-700 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none shadow-sm font-medium cursor-pointer" required />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Time</label>
                                                    <input type="time" value={data.time} onChange={e => setData('time', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50 dark:placeholder-gray-500 text-gray-700 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none shadow-sm font-medium cursor-pointer" required />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Max Patients</label>
                                                <input type="number" min="1" value={data.number_of_patients} onChange={(e: any) => setData('number_of_patients', Number(e.target.value))} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50 dark:placeholder-gray-500 text-gray-700 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none shadow-sm font-medium" required />
                                            </div>

                                            <div className="pt-4 flex justify-end">
                                                <button
                                                    type="button"
                                                    onClick={() => setShowAddModal(false)}
                                                    className="mr-3 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg"
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
                                                Are you sure you want to cancel the session <strong>{sessionToDelete?.title}</strong>? This action cannot be undone and will permanently remove this availability slot for all assigned doctors.
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

            </div>

            {/* Bulk Delete Confirmation Modal */}
            <Modal show={showBulkCancelModal} onClose={() => setShowBulkCancelModal(false)} maxWidth="sm">
                <div className="p-6 dark:bg-slate-800">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Confirm Deletion</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                        Are you sure you want to delete {selectedIds.length} selected schedule(s)? This will also delete any associated appointments. This action cannot be undone.
                    </p>
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={() => setShowBulkCancelModal(false)}
                            className="px-4 py-2 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 font-bold rounded-xl transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleBulkCancel}
                            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition-all shadow-md"
                        >
                            Yes, Delete Schedules
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Schedule Details Modal */}
            <Modal show={showScheduleModal} onClose={() => setShowScheduleModal(false)} maxWidth="md">
                {viewSchedule && (
                    <div className="p-8 dark:bg-slate-800">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Session Details</h3>
                            <button onClick={() => setShowScheduleModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 rounded-full p-2 transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>
                        <div className="bg-white dark:bg-slate-900/50 rounded-2xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm space-y-4">
                            <div className="border-b border-gray-100 dark:border-slate-700 pb-4 mb-4">
                                <h4 className="text-xl font-bold text-gray-900 dark:text-white">{viewSchedule.title}</h4>
                                <p className="text-sm text-blue-600 dark:text-blue-400 font-semibold mt-1">Dr. {viewSchedule.doctor?.user?.name || 'Unknown'}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400 font-medium mb-1">Date</p>
                                    <p className="font-bold text-gray-900 dark:text-slate-100">{new Date(viewSchedule.date).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400 font-medium mb-1">Time</p>
                                    <p className="font-bold text-gray-900 dark:text-slate-100">{viewSchedule.time}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400 font-medium mb-1">Capacity</p>
                                    <p className="font-bold text-gray-900 dark:text-slate-100">{viewSchedule.number_of_patients} patients</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400 font-medium mb-1">Booked</p>
                                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400">
                                        {viewSchedule.appointments?.length || 0} / {viewSchedule.number_of_patients}
                                    </span>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-gray-500 dark:text-gray-400 font-medium mb-1">Doctor Contact</p>
                                    {viewSchedule.doctor?.tel ? (
                                        <a
                                            href={`https://wa.me/${viewSchedule.doctor.tel.replace(/\D/g, '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center font-bold text-gray-900 dark:text-slate-100 hover:text-emerald-600 transition-colors group"
                                            title="Chat on WhatsApp"
                                        >
                                            {viewSchedule.doctor.tel}
                                            <svg className="w-3.5 h-3.5 ml-1.5 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                                        </a>
                                    ) : (
                                        <p className="font-bold text-gray-900 dark:text-slate-100">Not available</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </SidebarLayout>
    );
}

