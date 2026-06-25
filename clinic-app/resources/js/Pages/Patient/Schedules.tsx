import { useState, Fragment } from 'react';
import SidebarLayout from '@/Layouts/SidebarLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { Dialog, Transition } from '@headlessui/react';
import { formatTime12Hour } from '../../Utils/time';
import DoctorDetailsModal from '@/Components/DoctorDetailsModal';

declare const route: any;

export default function Schedules({ auth, schedules }: any) {
    const [selectedSchedule, setSelectedSchedule] = useState<any>(null);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [confirmCheckbox, setConfirmCheckbox] = useState(false);
    const [selectedDoctorForModal, setSelectedDoctorForModal] = useState<any>(null);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        schedule_id: '',
    });

    const openBookingModal = (schedule: any) => {
        setSelectedSchedule(schedule);
        setData('schedule_id', schedule.id);
        setShowBookingModal(true);
        clearErrors();
    };

    const closeBookingModal = () => {
        setShowBookingModal(false);
        setConfirmCheckbox(false);
        // We do not set selectedSchedule to null here so the modal retains its content during the exit animation.
        // It will be updated the next time openBookingModal is called.
        reset();
        clearErrors();
    };

    const submitBooking = (e: any) => {
        e.preventDefault();
        post(route('patient.appointments.store'), {
            onSuccess: () => {
                closeBookingModal();
            },
        });
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

    return (
        <SidebarLayout
            user={auth.user}
            header={<h2 className="font-semibold text-2xl text-gray-800 leading-tight">Book an Appointment</h2>}
        >
            <Head title="Book Appointment" />

            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                
                {/* Header */}
                <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex-col md:flex-row gap-4 mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">Available Doctor Sessions</h3>
                        <p className="text-sm text-gray-500">Select an available session below to book your appointment.</p>
                    </div>
                    <div className="relative w-full md:w-auto">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        </div>
                        <input 
                            type="text" 
                            placeholder="Search doctors, specialties, dates..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 w-full md:w-80 border-gray-200 rounded-xl text-sm focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50 h-11 transition-all outline-none"
                        />
                    </div>
                </div>


                {/* Table View */}
                <div className="bg-white overflow-hidden shadow-sm rounded-2xl border border-gray-100 relative">
                    {/* Patch to cover the scrollbar track gap in the header */}
                    <div className="absolute top-0 right-0 w-[8px] h-[49px] bg-gray-50 border-b border-gray-200 z-20"></div>

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
                                    const isFull = schedule.appointments?.length >= schedule.number_of_patients;
                                    const hasBooked = schedule.appointments?.some((apt: any) => apt.patient_id === auth.user.patient?.id);
                                    const slotsLeft = schedule.number_of_patients - (schedule.appointments?.length || 0);

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
                                                        <div className="text-sm text-blue-600 font-semibold">{schedule.doctor.specialty.name}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-bold text-gray-900">{schedule.title}</div>
                                                <div className="text-sm text-gray-500">
                                                    {new Date(schedule.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at {formatTime12Hour(schedule.time)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${isFull ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}`}>
                                                    {isFull ? 'Fully Booked' : `${slotsLeft} slots left`}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button 
                                                    onClick={() => openBookingModal(schedule)}
                                                    disabled={isFull || hasBooked}
                                                    className={`inline-flex items-center justify-center py-2 px-4 font-bold rounded-xl shadow-sm transition-all text-xs ${
                                                        isFull || hasBooked 
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
                                No available sessions found matching your filters.
                            </div>
                        )}
                    </div>
                </div>

                {/* Booking Confirmation Modal using Headless UI */}
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
                                    <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-3xl bg-white p-8 text-left align-middle shadow-2xl transition-all relative">
                                        <button 
                                            onClick={closeBookingModal}
                                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors bg-gray-100 rounded-full p-1 focus:outline-none"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                        </button>
                                        
                                        {selectedSchedule && (
                                            <>
                                                <div className="text-center mb-6">
                                                    <div className="h-16 w-16 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                                    </div>
                                                    <Dialog.Title as="h3" className="text-2xl font-bold text-gray-900">
                                                        Confirm Booking
                                                    </Dialog.Title>
                                                    <p className="text-gray-500 mt-2">You are about to book an appointment with:</p>
                                                </div>
                                                
                                                <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 mb-6">
                                                    <p className="font-bold text-lg text-slate-800 text-center mb-1">Dr. {selectedSchedule.doctor.user.name}</p>
                                                    <p className="text-sm text-blue-600 font-semibold text-center mb-4">{selectedSchedule.doctor.specialty.name}</p>
                                                    
                                                    <div className="space-y-2 text-sm text-slate-600 border-t border-slate-200 pt-4">
                                                        <div className="flex justify-between">
                                                            <span className="font-medium">Date:</span>
                                                            <span className="text-slate-900 font-semibold">{new Date(selectedSchedule.date).toLocaleDateString()}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="font-medium">Time:</span>
                                                            <span className="text-slate-900 font-semibold">{formatTime12Hour(selectedSchedule.time)}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <form onSubmit={submitBooking}>
                                                    {errors.schedule_id && (
                                                        <div className="mb-4 p-3 bg-rose-50 text-rose-600 text-sm rounded-lg border border-rose-100">
                                                            {errors.schedule_id}
                                                        </div>
                                                    )}
                                                    
                                                    <div className="mb-6 flex items-start gap-3 bg-teal-50/50 p-4 rounded-xl border border-teal-100/50">
                                                        <input 
                                                            type="checkbox" 
                                                            id="confirm-checkbox"
                                                            checked={confirmCheckbox}
                                                            onChange={(e) => setConfirmCheckbox(e.target.checked)}
                                                            className="mt-1 h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                                                        />
                                                        <label htmlFor="confirm-checkbox" className="text-xs text-slate-600 select-none cursor-pointer leading-relaxed">
                                                            I confirm that I want to book this appointment and will attend the scheduled session.
                                                        </label>
                                                    </div>
                                                    
                                                    <div className="flex gap-3">
                                                        <button 
                                                            type="button" 
                                                            onClick={closeBookingModal}
                                                            className="flex-1 py-3 px-4 text-sm font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors focus:outline-none"
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button 
                                                            type="submit" 
                                                            disabled={processing || !confirmCheckbox}
                                                            className="flex-1 py-3 px-4 text-sm font-bold text-white bg-gradient-to-r from-teal-500 to-blue-600 hover:shadow-lg rounded-xl shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all transform enabled:hover:scale-[1.02] focus:outline-none"
                                                        >
                                                            Confirm Booking
                                                        </button>
                                                    </div>
                                                </form>
                                            </>
                                        )}
                                    </Dialog.Panel>
                                </Transition.Child>
                            </div>
                        </div>
                    </Dialog>
                </Transition>

            </div>

            {/* Doctor Profile Details Modal */}
            <DoctorDetailsModal 
                show={selectedDoctorForModal !== null} 
                onClose={() => setSelectedDoctorForModal(null)} 
                doctor={selectedDoctorForModal} 
            />
        </SidebarLayout>
    );
}
