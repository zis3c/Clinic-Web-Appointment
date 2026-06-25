import { useState } from 'react';
import SidebarLayout from '@/Layouts/SidebarLayout';
import { Head, Link } from '@inertiajs/react';
import { formatTime12Hour } from '../../Utils/time';
import DoctorDetailsModal from '@/Components/DoctorDetailsModal';
import AppointmentDetailsModal from '@/Components/AppointmentDetailsModal';

export default function Dashboard({ auth, appointments = [] }: any) {
    const [selectedDoctorForModal, setSelectedDoctorForModal] = useState<any>(null);
    const [selectedAptForDetails, setSelectedAptForDetails] = useState<any>(null);

    const getLocalDateString = (d: Date) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const todayStr = getLocalDateString(new Date());
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = getLocalDateString(tomorrow);

    // Calculate metrics
    const upcomingAppointments = (appointments || []).filter((apt: any) => {
        return apt.date >= todayStr && apt.status !== 'rejected' && apt.status !== 'completed';
    });

    // Sort upcoming appointments ascending (earliest first)
    const sortedUpcoming = [...upcomingAppointments].sort((a: any, b: any) => {
        const dateA = new Date(a.date + 'T' + (a.schedule?.time || '00:00:00')).getTime();
        const dateB = new Date(b.date + 'T' + (b.schedule?.time || '00:00:00')).getTime();
        return dateA - dateB;
    });

    const getGreetingMessage = () => {
        if (sortedUpcoming.length === 0) {
            return (
                <span>
                    You don't have any upcoming appointments scheduled.
                </span>
            );
        }

        const nextApt = sortedUpcoming[0];
        const timeStr = formatTime12Hour(nextApt.schedule?.time);
        const doctorName = nextApt.schedule?.doctor?.user?.name || 'Unknown';

        if (nextApt.date === todayStr) {
            return (
                <span>
                    You have an appointment <span className="font-extrabold text-blue-600">today at {timeStr}</span> with Dr. {doctorName}.
                </span>
            );
        } else if (nextApt.date === tomorrowStr) {
            return (
                <span>
                    You have an appointment <span className="font-extrabold text-blue-600">tomorrow at {timeStr}</span> with Dr. {doctorName}.
                </span>
            );
        } else {
            const formattedDate = new Date(nextApt.date).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
            });
            return (
                <span>
                    Your next appointment is on <span className="font-extrabold text-blue-600">{formattedDate} at {timeStr}</span> with Dr. {doctorName}.
                </span>
            );
        }
    };

    const totalAppointments = appointments.length;
    const uniqueDoctorsCount = new Set(
        appointments.map((apt: any) => apt.schedule?.doctor?.id).filter(Boolean)
    ).size;

    return (
        <SidebarLayout
            user={auth.user}
            header={<h2 className="font-semibold text-2xl text-gray-800 leading-tight">Patient Dashboard</h2>}
        >
            <Head title="Patient Dashboard" />

            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 py-6 space-y-6">
                
                {/* Welcome Banner */}
                <div className="relative overflow-hidden bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                        {/* Calendar Icon with Badge */}
                        <div className="relative p-3 bg-blue-50 rounded-2xl text-blue-600 flex-shrink-0">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                            </svg>
                            {upcomingAppointments.length > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white animate-bounce">
                                    {upcomingAppointments.length}
                                </span>
                            )}
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                                Welcome back, {auth.user.name}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                                {getGreetingMessage()}
                            </p>
                        </div>
                    </div>
                    <Link
                        href={route('patient.doctors.index')}
                        className="h-11 px-5 flex items-center justify-center gap-2 bg-gradient-to-r from-teal-400 to-blue-600 text-white font-bold rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all whitespace-nowrap"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                        Book New Appointment
                    </Link>
                </div>

                {/* KPI Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Upcoming Appointments */}
                    <div className="relative overflow-hidden bg-white rounded-2xl shadow-sm border border-gray-100 p-5 group hover:shadow-xl hover:shadow-teal-500/10 hover:-translate-y-0.5 transition-all duration-300">
                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br from-teal-50 to-transparent rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700 pointer-events-none"></div>
                        <div className="flex items-center justify-between relative z-10">
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Upcoming Consultations</p>
                                <h3 className="text-3xl font-black text-gray-900 tracking-tight">{upcomingAppointments.length}</h3>
                            </div>
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-teal-400 to-emerald-500 text-white flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300 shadow-md shadow-teal-500/30">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            </div>
                        </div>
                    </div>

                    {/* Total Bookings */}
                    <div className="relative overflow-hidden bg-white rounded-2xl shadow-sm border border-gray-100 p-5 group hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-0.5 transition-all duration-300">
                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br from-blue-50 to-transparent rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700 pointer-events-none"></div>
                        <div className="flex items-center justify-between relative z-10">
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total Booked</p>
                                <h3 className="text-3xl font-black text-gray-900 tracking-tight">{totalAppointments}</h3>
                            </div>
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-500 to-blue-600 text-white flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300 shadow-md shadow-blue-500/30">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                            </div>
                        </div>
                    </div>

                    {/* Unique Doctors */}
                    <div className="relative overflow-hidden bg-white rounded-2xl shadow-sm border border-gray-100 p-5 group hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-0.5 transition-all duration-300">
                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br from-purple-50 to-transparent rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700 pointer-events-none"></div>
                        <div className="flex items-center justify-between relative z-10">
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Doctors Consulted</p>
                                <h3 className="text-3xl font-black text-gray-900 tracking-tight">{uniqueDoctorsCount}</h3>
                            </div>
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-600 text-white flex items-center justify-center transform group-hover:-rotate-12 transition-transform duration-300 shadow-md shadow-purple-500/30">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Appointments Layout */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                    <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-gray-50 to-white">
                        <div>
                            <h3 className="font-bold text-gray-800">Your Appointment History</h3>
                            <p className="text-xs text-gray-500">Overview of all active and past consultations</p>
                        </div>
                        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                            {appointments.length} Total
                        </span>
                    </div>

                    <div className="p-6">
                        {(!appointments || appointments.length === 0) ? (
                            <div className="text-center h-[calc(100vh-390px)] flex flex-col justify-center items-center">
                                <div className="mx-auto h-16 w-16 text-gray-300 mb-4">
                                    <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h4 className="font-bold text-gray-800">No appointments found</h4>
                                <p className="text-xs text-gray-400 mt-1">Book your first appointment to get started.</p>
                            </div>
                        ) : (
                            <div className="space-y-4 h-[calc(100vh-390px)] overflow-y-auto custom-scrollbar pr-2 pb-2">
                                {appointments.map((apt: any) => {
                                    const isPast = new Date(apt.date + 'T' + (apt.schedule?.time || '00:00:00')).getTime() < new Date().getTime() || apt.status === 'completed';
                                    return (
                                        <div 
                                            key={apt.id} 
                                            onClick={() => setSelectedAptForDetails(apt)}
                                            className="flex items-center justify-between p-5 border border-gray-100 rounded-2xl hover:bg-slate-50/50 hover:border-blue-200 hover:shadow-md cursor-pointer group/card transition-all duration-200"
                                            title="Click to view appointment status details"
                                        >
                                            <div className="flex items-center space-x-4">
                                                <div className="h-12 w-12 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl group-hover/card:scale-105 transition-transform duration-200 flex-shrink-0">
                                                    {apt.schedule?.doctor?.user?.avatar ? (
                                                        <img 
                                                            src={`/storage/${apt.schedule.doctor.user.avatar}`} 
                                                            alt={apt.schedule.doctor.user.name} 
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        apt.schedule?.doctor?.user?.name?.charAt(0) || 'D'
                                                    )}
                                                </div>
                                                <div>
                                                    <h4 className="text-base font-bold text-gray-900 group-hover/card:text-blue-600 transition-colors">
                                                        Dr. {apt.schedule?.doctor?.user?.name || 'Unknown'}
                                                    </h4>
                                                    <p className="text-xs text-gray-500 font-medium mt-0.5">
                                                        {new Date(apt.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at {formatTime12Hour(apt.schedule?.time)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end space-y-1.5 flex-shrink-0">
                                                <div className="flex items-center gap-1.5">
                                                    {!!apt.checked_in && (
                                                        <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-black bg-teal-50 text-teal-700 border border-teal-200/50">
                                                            Arrived
                                                        </span>
                                                    )}
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-black border ${
                                                        apt.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200/50' :
                                                        apt.status === 'confirmed' ? 'bg-blue-50 text-blue-700 border-blue-200/50' :
                                                        apt.status === 'rejected' ? 'bg-rose-50 text-rose-700 border-rose-200/50' :
                                                        'bg-emerald-50 text-emerald-700 border-emerald-200/50'
                                                    }`}>
                                                        {apt.status ? apt.status.charAt(0).toUpperCase() + apt.status.slice(1) : 'Pending'}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-400 font-bold">Apt #{apt.appointment_number}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Doctor Details Modal */}
            <DoctorDetailsModal 
                show={selectedDoctorForModal !== null} 
                onClose={() => setSelectedDoctorForModal(null)} 
                doctor={selectedDoctorForModal} 
            />

            {/* Appointment Details Modal */}
            <AppointmentDetailsModal
                show={selectedAptForDetails !== null}
                onClose={() => setSelectedAptForDetails(null)}
                appointment={selectedAptForDetails}
            />
        </SidebarLayout>
    );
}
