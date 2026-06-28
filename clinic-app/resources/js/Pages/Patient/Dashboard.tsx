import { useState } from 'react';
import SidebarLayout from '@/Layouts/SidebarLayout';
import { Head, Link } from '@inertiajs/react';
import { formatTime12Hour } from '../../Utils/time';
import DoctorDetailsModal from '@/Components/DoctorDetailsModal';
import AppointmentDetailsModal from '@/Components/AppointmentDetailsModal';
import Modal from '@/Components/Modal';

export default function Dashboard({ auth, appointments = [] }: any) {
    const [selectedDoctorForModal, setSelectedDoctorForModal] = useState<any>(null);
    const [selectedAptForDetails, setSelectedAptForDetails] = useState<any>(null);
    const [selectedAptForEHR, setSelectedAptForEHR] = useState<any>(null);

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

    // Find active waiting room queue appointment today
    const activeQueueAppointment = (appointments || []).find((apt: any) => {
        return apt.date === todayStr && apt.checked_in && apt.status === 'confirmed' && apt.queue_info !== null;
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
        >
            <Head title="Patient Dashboard" />

            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                
                {/* Welcome Banner */}
                <div className="relative overflow-hidden bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                        {/* Calendar Icon with Badge */}
                        <button 
                            onClick={() => {
                                if (sortedUpcoming.length > 0) {
                                    setSelectedAptForDetails(sortedUpcoming[0]);
                                }
                            }}
                            className={`relative p-3 rounded-2xl text-blue-600 flex-shrink-0 transition-all outline-none focus:outline-none focus:ring-0 active:outline-none group ${sortedUpcoming.length > 0 ? 'bg-blue-50 hover:bg-blue-100 cursor-pointer hover:shadow-md hover:-translate-y-0.5' : 'bg-gray-50 cursor-default'}`}
                            title={sortedUpcoming.length > 0 ? "View Next Appointment" : "No upcoming appointments"}
                        >
                            <svg className={`w-6 h-6 transition-transform ${sortedUpcoming.length > 0 ? 'group-hover:scale-110 group-active:scale-95' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                            </svg>
                            {upcomingAppointments.length > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white animate-bounce">
                                    {upcomingAppointments.length}
                                </span>
                            )}
                        </button>
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

                {/* Live Queue Ticket */}
                {activeQueueAppointment && (
                    <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-700 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
                        {/* Background subtle graphics */}
                        <div className="absolute right-0 bottom-0 opacity-10 translate-x-12 translate-y-12">
                            <svg className="w-80 h-80" fill="currentColor" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="40" />
                            </svg>
                        </div>

                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                    <span className="text-xs font-black tracking-widest text-blue-200 uppercase">Live Queue Board</span>
                                </div>
                                <h3 className="text-2xl font-black tracking-tight">You are checked in & waiting</h3>
                                <p className="text-sm text-blue-100 max-w-md">
                                    Your consultation with <span className="font-bold text-white">Dr. {activeQueueAppointment.schedule?.doctor?.user?.name}</span> is active in the lobby queue.
                                </p>
                            </div>

                            <div className="flex items-center gap-6 bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10 w-full md:w-auto justify-around">
                                <div className="text-center">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-blue-200">Your Position</p>
                                    <p className="text-3xl font-black text-white mt-1">#{activeQueueAppointment.queue_info?.position}</p>
                                </div>
                                <div className="h-10 w-px bg-white/20"></div>
                                <div className="text-center">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-blue-200">Patients Ahead</p>
                                    <p className="text-3xl font-black text-white mt-1">{activeQueueAppointment.queue_info?.patients_ahead}</p>
                                </div>
                                <div className="h-10 w-px bg-white/20"></div>
                                <div className="text-center">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-blue-200">Est. Wait</p>
                                    <p className="text-2xl font-black text-white mt-1">~{activeQueueAppointment.queue_info?.estimated_wait_minutes}m</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

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
                            <div className="text-center h-[calc(100vh-450px)] flex flex-col justify-center items-center">
                                <div className="mx-auto h-16 w-16 text-gray-300 mb-4">
                                    <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h4 className="font-bold text-gray-800">No appointments found</h4>
                                <p className="text-xs text-gray-400 mt-1">Book your first appointment to get started.</p>
                            </div>
                        ) : (
                            <div className="space-y-4 h-[calc(100vh-450px)] overflow-y-auto custom-scrollbar pr-2 pb-2">
                                {appointments.map((apt: any) => {
                                    return (
                                        <div 
                                            key={apt.id} 
                                            onClick={() => setSelectedAptForDetails(apt)}
                                            className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border border-gray-100 rounded-2xl hover:bg-slate-50/50 hover:border-blue-200 hover:shadow-md cursor-pointer group/card transition-all duration-200 gap-4"
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
                                                    {apt.time_slot && (
                                                        <span className="inline-flex items-center mt-1 px-2 py-0.5 bg-blue-50 text-[10px] text-blue-600 font-bold rounded border border-blue-100">
                                                            Slot: {formatTime12Hour(apt.time_slot)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex sm:flex-col items-start sm:items-end justify-between sm:justify-start gap-1.5 flex-shrink-0">
                                                <div className="flex items-center gap-1.5">
                                                    {apt.status === 'completed' && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedAptForEHR(apt);
                                                            }}
                                                            className="inline-flex items-center px-2.5 py-1 rounded text-xs font-black bg-teal-600 hover:bg-teal-700 text-white border border-teal-700 shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
                                                        >
                                                            View Rx/Notes
                                                        </button>
                                                    )}
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

            {/* EHR Details Modal */}
            <Modal
                show={selectedAptForEHR !== null}
                onClose={() => setSelectedAptForEHR(null)}
                maxWidth="md"
            >
                {selectedAptForEHR && (
                    <div className="p-8 relative">
                        <button 
                            onClick={() => setSelectedAptForEHR(null)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-rose-500 transition-all duration-300 hover:rotate-90 hover:scale-110 active:scale-95 bg-gray-50 hover:bg-rose-50 p-1.5 rounded-full shadow-sm z-20"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>

                        <div className="text-center mb-6">
                            <div className="h-14 w-14 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Consultation EHR Record</h3>
                            <p className="text-xs text-gray-500 mt-1">JanjiCare Completed Consultation Note</p>
                        </div>

                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 mb-6 space-y-4">
                            <div className="flex flex-col sm:flex-row justify-between text-sm pb-3 border-b border-slate-200/60 gap-2">
                                <div>
                                    <p className="text-xs text-slate-400 font-bold">DOCTOR</p>
                                    <p className="font-extrabold text-slate-800 mt-0.5">Dr. {selectedAptForEHR.schedule?.doctor?.user?.name}</p>
                                    <p className="text-xs text-blue-600 font-bold">{selectedAptForEHR.schedule?.doctor?.specialty?.name}</p>
                                </div>
                                <div className="sm:text-right">
                                    <p className="text-xs text-slate-400 font-bold">DATE & TIME</p>
                                    <p className="font-extrabold text-slate-800 mt-0.5">
                                        {new Date(selectedAptForEHR.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                                    </p>
                                    <p className="text-xs text-slate-500 font-semibold">{formatTime12Hour(selectedAptForEHR.schedule?.time)}</p>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Diagnosis</h4>
                                <p className="text-sm font-extrabold text-slate-900 bg-teal-50/50 border border-teal-100/50 p-3 rounded-xl mt-1.5 leading-relaxed">
                                    {selectedAptForEHR.diagnosis || 'No diagnosis recorded.'}
                                </p>
                            </div>

                            <div>
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Prescriptions</h4>
                                <p className="text-sm font-semibold text-slate-800 bg-blue-50/30 border border-blue-100/30 p-3 rounded-xl mt-1.5 whitespace-pre-line leading-relaxed font-mono">
                                    {selectedAptForEHR.prescriptions || 'No prescription written.'}
                                </p>
                            </div>

                            <div>
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Clinical Notes</h4>
                                <p className="text-sm text-slate-700 bg-white border border-slate-100 p-3 rounded-xl mt-1.5 whitespace-pre-line leading-relaxed">
                                    {selectedAptForEHR.notes || 'No doctor notes.'}
                                </p>
                            </div>
                        </div>

                        {/* Stamp and signature simulation */}
                        <div className="flex justify-between items-center px-4">
                            <div className="text-[9px] text-slate-400 font-bold">
                                JanjiCare Electronic Health Record<br/>
                                System ID: #{selectedAptForEHR.id}
                            </div>
                            <div className="text-right flex flex-col items-center">
                                <div className="font-serif text-teal-600/85 text-xl font-bold italic rotate-[-4deg] border-2 border-teal-500/20 px-3 py-1 rounded bg-teal-50/20">
                                    Dr. {selectedAptForEHR.schedule?.doctor?.user?.name?.split(' ')[0]}
                                </div>
                                <div className="text-[8px] text-slate-400 uppercase font-black tracking-wider mt-1">Digitally Signed</div>
                            </div>
                        </div>

                        <button 
                            onClick={() => setSelectedAptForEHR(null)}
                            className="mt-6 w-full py-3 px-4 text-sm font-black text-white bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 hover:shadow-xl hover:shadow-teal-500/30 hover:-translate-y-1 active:translate-y-0 rounded-xl shadow-md transition-all duration-300 text-center focus:outline-none"
                        >
                            Close Record
                        </button>
                    </div>
                )}
            </Modal>
        </SidebarLayout>
    );
}
