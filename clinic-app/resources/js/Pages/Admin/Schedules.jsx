import { useState, Fragment } from 'react';
import SidebarLayout from '@/Layouts/SidebarLayout';
import { Head, useForm, Link, router } from '@inertiajs/react';
import CustomSelect from '@/Components/CustomSelect';
import CustomMultiSelect from '@/Components/CustomMultiSelect';
import { Dialog, Transition } from '@headlessui/react';

export default function Schedules({ auth, schedules, doctors }) {
    const [showAddModal, setShowAddModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [sessionToDelete, setSessionToDelete] = useState(null);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    
    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        doctor_ids: [],
        date: '',
        time: '',
        number_of_patients: 10,
    });

    const submit = (e) => {
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
        setIsDeleting(true);
        router.delete(route('admin.schedules.destroy', sessionToDelete.id), {
            preserveScroll: true,
            onFinish: () => {
                setIsDeleting(false);
                setIsCancelModalOpen(false);
            }
        });
    };

    const openAddModal = () => {
        reset();
        
        // Robust way to get local timezone YYYY-MM-DD and HH:mm
        const now = new Date();
        const offset = now.getTimezoneOffset() * 60000;
        const localISOTime = (new Date(now - offset)).toISOString().slice(0, 16);
        
        setData({
            title: '',
            doctor_ids: [],
            date: localISOTime.split('T')[0],
            time: localISOTime.split('T')[1],
            number_of_patients: 10,
        });
        
        setShowAddModal(true);
    };

    const filteredSchedules = schedules.filter(schedule => 
        schedule.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        schedule.doctor.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        schedule.date.includes(searchQuery) ||
        schedule.time.includes(searchQuery)
    );

    return (
        <SidebarLayout
            user={auth.user}
            header={<h2 className="font-semibold text-2xl text-gray-800 leading-tight">Manage Schedules</h2>}
        >
            <Head title="Manage Schedules" />

            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                
                {/* Header Actions */}
                <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">Schedule Sessions</h3>
                        <p className="text-sm text-gray-500">Create and manage doctor availability sessions.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                            </div>
                            <input 
                                type="text" 
                                placeholder="Search schedules..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-11 pl-10 pr-4 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all w-full sm:w-64 bg-gray-50 text-gray-700"
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
                <div className="bg-white overflow-hidden shadow-sm rounded-2xl border border-gray-100">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Title / Doctor</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date & Time</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Bookings</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredSchedules.map((schedule) => (
                                    <tr key={schedule.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-bold text-gray-900">{schedule.title}</div>
                                            <div className="text-sm text-blue-600 font-semibold">Dr. {schedule.doctor.user.name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{new Date(schedule.date).toLocaleDateString()}</div>
                                            <div className="text-sm text-gray-500">{schedule.time}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                {schedule.appointments?.length || 0} / {schedule.number_of_patients} Booked
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button 
                                                onClick={() => { setSessionToDelete(schedule); setIsCancelModalOpen(true); }}
                                                className="text-rose-600 hover:text-rose-900 font-semibold"
                                            >
                                                Cancel Session
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredSchedules.length === 0 && (
                            <div className="p-10 text-center text-gray-500">
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
                                        
                                        <form onSubmit={submit} className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-1">Session Title</label>
                                                <input type="text" value={data.title} onChange={e => setData('title', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-700 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none shadow-sm font-medium" placeholder="e.g. Morning Checkups" required />
                                                {errors.title && <div className="text-rose-500 text-sm mt-1">{errors.title}</div>}
                                            </div>
                                            
                                            <div className="relative z-50">
                                                <label className="block text-sm font-bold text-gray-700 mb-1">Doctors (Select Multiple)</label>
                                                <CustomMultiSelect 
                                                    value={data.doctor_ids} 
                                                    onChange={val => setData('doctor_ids', val)} 
                                                    options={doctors.map(d => ({ value: d.id, label: `Dr. ${d.user.name}` }))}
                                                    placeholder="Select doctors for this session..."
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-700 transition-all outline-none shadow-sm font-medium cursor-pointer"
                                                />
                                                {errors.doctor_ids && <div className="text-rose-500 text-sm mt-1">{errors.doctor_ids}</div>}
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
                                                <input type="number" min="1" value={data.number_of_patients} onChange={e => setData('number_of_patients', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-700 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none shadow-sm font-medium" required />
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
                                    <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-3xl bg-white p-8 text-left align-middle shadow-2xl transition-all relative">
                                        <div className="text-center mb-6">
                                            <div className="h-16 w-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                                            </div>
                                            <Dialog.Title as="h3" className="text-2xl font-bold text-gray-900">
                                                Cancel Session?
                                            </Dialog.Title>
                                            <p className="text-gray-500 mt-2">
                                                Are you sure you want to cancel the session <strong>{sessionToDelete?.title}</strong>? This action cannot be undone and will permanently remove this availability slot for all assigned doctors.
                                            </p>
                                        </div>
                                        
                                        <div className="flex gap-3 mt-8">
                                            <button 
                                                type="button" 
                                                onClick={() => setIsCancelModalOpen(false)}
                                                disabled={isDeleting}
                                                className="flex-1 py-3 px-4 text-sm font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors focus:outline-none"
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
        </SidebarLayout>
    );
}
