import { useState } from 'react';
import SidebarLayout from '@/Layouts/SidebarLayout';
import Modal from '@/Components/Modal';
import PatientDetailsModal from '@/Components/PatientDetailsModal';
import { Head, Link, router } from '@inertiajs/react';
import { formatTime12Hour } from '../../Utils/time';
import CustomSelect from '@/Components/CustomSelect';

export default function Appointments({ auth, appointments }: any) {
    const [searchQuery, setSearchQuery] = useState('');
    const [dateFilter, setDateFilter] = useState('all');
    const [appointmentToCancel, setAppointmentToCancel] = useState<number | null>(null);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [showBulkCancelModal, setShowBulkCancelModal] = useState(false);
    const [isBulkMode, setIsBulkMode] = useState(false);
    const [viewPatient, setViewPatient] = useState<any>(null);
    const [showPatientModal, setShowPatientModal] = useState(false);

    const isDateInRange = (dateStr: string, filter: string) => {
        if (filter === 'all') return true;
        
        // Parse date safely (assuming YYYY-MM-DD format from backend)
        const apptDate = new Date(dateStr);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (filter === 'yesterday') {
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            return apptDate.toDateString() === yesterday.toDateString();
        }
        
        if (filter === 'today') {
            return apptDate.toDateString() === today.toDateString();
        }
        
        if (filter === 'tomorrow') {
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            return apptDate.toDateString() === tomorrow.toDateString();
        }
        
        if (filter === 'week') {
            const nextWeek = new Date(today);
            nextWeek.setDate(nextWeek.getDate() + 7);
            return apptDate >= today && apptDate < nextWeek;
        }
        
        if (filter === 'month') {
            return apptDate.getMonth() === today.getMonth() && apptDate.getFullYear() === today.getFullYear();
        }
        
        return true;
    };

    const filteredAppointments = appointments.filter((appointment: any) => {
        const matchesSearch = 
            appointment.patient.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            appointment.schedule.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            appointment.patient.tel.includes(searchQuery) ||
            appointment.appointment_number.toString().includes(searchQuery);
            
        const matchesDate = isDateInRange(appointment.date, dateFilter);
        
        return matchesSearch && matchesDate;
    });

    // The handleSelectAll logic is now inside the button's onClick in the render function

    const handleSelect = (id: number) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handleBulkCancel = () => {
        router.delete(route('doctor.appointments.bulk-destroy'), {
            data: { appointment_ids: selectedIds },
            onSuccess: () => {
                setShowBulkCancelModal(false);
                setSelectedIds([]);
            },
            preserveScroll: true
        });
    };

    const dateOptions = [
        { value: 'all', label: 'All Dates' },
        { value: 'yesterday', label: 'Yesterday' },
        { value: 'today', label: 'Today' },
        { value: 'tomorrow', label: 'Tomorrow' },
        { value: 'week', label: 'Next 7 Days' },
        { value: 'month', label: 'This Month' }
    ];

    return (
        <SidebarLayout
            user={auth.user}
            header={<h2 className="font-semibold text-2xl text-gray-800 leading-tight">My Appointments</h2>}
        >
            <Head title="My Appointments" />

            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                
                {/* Header Actions */}
                <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex-col md:flex-row gap-4">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">Your Upcoming Patient Appointments</h3>
                        <p className="text-sm text-gray-500">View details of patients who have booked your sessions.</p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto z-20 relative items-center">
                        {!isBulkMode ? (
                            <button
                                onClick={() => setIsBulkMode(true)}
                                className="px-4 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold rounded-xl text-sm transition-all whitespace-nowrap h-11 shadow-sm"
                            >
                                Select
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={() => {
                                        if (filteredAppointments.length > 0 && selectedIds.length === filteredAppointments.length) {
                                            setSelectedIds([]);
                                        } else {
                                            setSelectedIds(filteredAppointments.map((a: any) => a.id));
                                        }
                                    }}
                                    className="px-4 py-2 bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 font-bold rounded-xl text-sm transition-all whitespace-nowrap h-11"
                                >
                                    {filteredAppointments.length > 0 && selectedIds.length === filteredAppointments.length ? 'Deselect All' : 'Select All'}
                                </button>
                                {selectedIds.length > 0 && (
                                    <button
                                        onClick={() => setShowBulkCancelModal(true)}
                                        className="px-4 py-2 bg-rose-500 text-white hover:bg-rose-600 font-bold rounded-xl text-sm transition-all whitespace-nowrap h-11 shadow-md hover:shadow-lg hover:-translate-y-0.5"
                                    >
                                        Cancel Selected ({selectedIds.length})
                                    </button>
                                )}
                                <button
                                    onClick={() => {
                                        setIsBulkMode(false);
                                        setSelectedIds([]);
                                    }}
                                    className="px-4 py-2 bg-gray-100 text-gray-600 hover:bg-gray-200 font-bold rounded-xl text-sm transition-all whitespace-nowrap h-11"
                                >
                                    Done
                                </button>
                            </>
                        )}
                        <div className="w-full sm:w-36">
                            <CustomSelect
                                value={dateFilter}
                                onChange={(val: string | number) => setDateFilter(val as string)}
                                options={dateOptions}
                                className="border border-gray-200 rounded-xl text-sm bg-gray-50 h-11 px-3 font-medium"
                            />
                        </div>
                        <div className="relative w-full md:w-auto">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                            </div>
                            <input 
                                type="text" 
                                placeholder="Search appointments..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 w-full md:w-64 border-gray-200 rounded-xl text-sm focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50 h-11 transition-all outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white overflow-hidden shadow-sm rounded-2xl border border-gray-100 relative">
                    {/* Patch to cover the scrollbar track gap in the header */}
                    <div className="absolute top-0 right-0 w-[8px] h-[49px] bg-gray-50 border-b border-gray-200 z-20"></div>
                    
                    <div className="overflow-x-auto max-h-[calc(100vh-190px)] overflow-y-auto custom-scrollbar">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50 sticky top-0 z-10 ring-1 ring-gray-200">
                                <tr>
                                    {isBulkMode && <th className="px-6 py-4 text-left w-12"></th>}
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Patient Details</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Session Info</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Apt No.</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredAppointments.map((appointment: any) => (
                                    <tr key={appointment.id} className={`hover:bg-gray-50 transition-colors ${selectedIds.includes(appointment.id) ? 'bg-blue-50/50' : ''}`}>
                                        {isBulkMode && (
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <input 
                                                    type="checkbox" 
                                                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500 cursor-pointer"
                                                    checked={selectedIds.includes(appointment.id)}
                                                    onChange={() => handleSelect(appointment.id)}
                                                />
                                            </td>
                                        )}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold">
                                                    {appointment.patient.user.name.charAt(0)}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-bold text-gray-900">{appointment.patient.user.name}</div>
                                                    <div className="text-sm text-gray-500">Tel: {appointment.patient.tel}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-bold text-gray-900">{appointment.schedule.title}</div>
                                            <div className="text-sm text-gray-500">{new Date(appointment.date).toLocaleDateString()} at {formatTime12Hour(appointment.schedule.time)}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                #{appointment.appointment_number}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-3">
                                                <button 
                                                    onClick={() => {
                                                        setViewPatient(appointment.patient);
                                                        setShowPatientModal(true);
                                                    }}
                                                    className="text-blue-600 hover:text-blue-900 font-semibold focus:outline-none bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                                                >
                                                    View Details
                                                </button>
                                                <button 
                                                    onClick={() => setAppointmentToCancel(appointment.id)}
                                                    className="text-rose-600 hover:text-rose-900 font-semibold focus:outline-none bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredAppointments.length === 0 && (
                            <div className="p-10 text-center text-gray-500">
                                {searchQuery ? "No appointments found matching your search." : "No appointments have been booked yet."}
                            </div>
                        )}
                    </div>
                </div>

            </div>

            {/* Cancel Confirmation Modal */}
            <Modal show={appointmentToCancel !== null} onClose={() => setAppointmentToCancel(null)} maxWidth="sm">
                <div className="p-8">
                    <div className="flex items-center justify-center w-16 h-16 mx-auto bg-rose-50 rounded-2xl mb-6 shadow-inner">
                        <svg className="w-8 h-8 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 text-center mb-3">Cancel Appointment?</h3>
                    <p className="text-sm text-gray-500 text-center mb-8 leading-relaxed">
                        Are you sure you want to cancel this appointment? This action cannot be undone and the patient will be notified.
                    </p>
                    <div className="flex gap-3">
                        <button 
                            onClick={() => setAppointmentToCancel(null)}
                            className="flex-1 px-4 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-bold rounded-xl transition-all shadow-sm"
                        >
                            Keep It
                        </button>
                        <Link 
                            href={appointmentToCancel ? route('doctor.appointments.destroy', appointmentToCancel) : '#'}
                            method="delete"
                            as="button"
                            onClick={() => setAppointmentToCancel(null)}
                            preserveScroll
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-bold rounded-xl transition-all text-center shadow-md hover:shadow-lg hover:-translate-y-0.5"
                        >
                            Yes, Cancel
                        </Link>
                    </div>
                </div>
            </Modal>
            {/* Bulk Cancel Confirmation Modal */}
            <Modal show={showBulkCancelModal} onClose={() => setShowBulkCancelModal(false)} maxWidth="sm">
                <div className="p-8">
                    <div className="flex items-center justify-center w-16 h-16 mx-auto bg-rose-50 rounded-2xl mb-6 shadow-inner">
                        <svg className="w-8 h-8 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 text-center mb-3">Bulk Cancel Appointments?</h3>
                    <p className="text-sm text-gray-500 text-center mb-8 leading-relaxed">
                        Are you sure you want to cancel the <span className="font-bold text-rose-600">{selectedIds.length}</span> selected appointments? This action cannot be undone and all selected patients will be notified.
                    </p>
                    <div className="flex gap-3">
                        <button 
                            onClick={() => setShowBulkCancelModal(false)}
                            className="flex-1 px-4 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-bold rounded-xl transition-all shadow-sm"
                        >
                            Keep Them
                        </button>
                        <button 
                            onClick={handleBulkCancel}
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-bold rounded-xl transition-all text-center shadow-md hover:shadow-lg hover:-translate-y-0.5"
                        >
                            Yes, Cancel All
                        </button>
                    </div>
                </div>
            </Modal>

            {/* View Patient Details Modal */}
            <PatientDetailsModal 
                show={showPatientModal} 
                onClose={() => setShowPatientModal(false)} 
                patient={viewPatient} 
            />
        </SidebarLayout>
    );
}
