import SidebarLayout from '@/Layouts/SidebarLayout';
import Modal from '@/Components/Modal';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import PatientDetailsModal from '@/Components/PatientDetailsModal';

export default function Appointments({ auth, appointments }: any) {
    const [searchQuery, setSearchQuery] = useState('');
    const [appointmentToCancel, setAppointmentToCancel] = useState<number | null>(null);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [isBulkMode, setIsBulkMode] = useState(false);
    const [showBulkCancelModal, setShowBulkCancelModal] = useState(false);
    const [viewPatient, setViewPatient] = useState<any>(null);
    const [showPatientModal, setShowPatientModal] = useState(false);
    const [expandedSessions, setExpandedSessions] = useState<number[]>([]);

    // Group appointments by schedule_id
    const groupedSessions = useMemo(() => {
        const groups: Record<number, { schedule: any; appointments: any[] }> = {};
        
        const filtered = appointments.filter((appointment: any) => 
            appointment.appointment_number.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
            appointment.patient.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            appointment.schedule.doctor.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            appointment.date.includes(searchQuery)
        );

        filtered.forEach((apt: any) => {
            const sid = apt.schedule_id;
            if (!groups[sid]) {
                groups[sid] = { schedule: apt.schedule, appointments: [] };
            }
            groups[sid].appointments.push(apt);
        });

        return Object.entries(groups).map(([id, group]) => ({
            scheduleId: Number(id),
            ...group,
        }));
    }, [appointments, searchQuery]);

    const allFilteredIds = useMemo(() => {
        return groupedSessions.flatMap(g => g.appointments.map((a: any) => a.id));
    }, [groupedSessions]);

    const toggleSession = (scheduleId: number) => {
        setExpandedSessions(prev => 
            prev.includes(scheduleId) ? prev.filter(id => id !== scheduleId) : [...prev, scheduleId]
        );
    };

    const handleSelect = (id: number) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handleSelectGroup = (appointmentIds: number[]) => {
        const allSelected = appointmentIds.every(id => selectedIds.includes(id));
        if (allSelected) {
            setSelectedIds(prev => prev.filter(id => !appointmentIds.includes(id)));
        } else {
            setSelectedIds(prev => [...new Set([...prev, ...appointmentIds])]);
        }
    };

    const handleBulkCancel = () => {
        router.delete(route('admin.appointments.bulk-destroy'), {
            data: { appointment_ids: selectedIds },
            onSuccess: () => {
                setShowBulkCancelModal(false);
                setSelectedIds([]);
                setIsBulkMode(false);
            },
            preserveScroll: true
        });
    };

    return (
        <SidebarLayout
            user={auth.user}
            header={<h2 className="font-semibold text-2xl text-gray-800 leading-tight">Manage Appointments</h2>}
        >
            <Head title="Manage Appointments" />
            
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-6px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-slide-down {
                    animation: slideDown 220ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                th, td {
                    transition: width 350ms cubic-bezier(0.4, 0, 0.2, 1), opacity 350ms cubic-bezier(0.4, 0, 0.2, 1), padding 350ms cubic-bezier(0.4, 0, 0.2, 1);
                }
            `}} />

            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                
                {/* Header */}
                <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">All Appointments</h3>
                        <p className="text-sm text-gray-500">View and manage all patient bookings across all doctors, grouped by session.</p>
                    </div>
                    <div className="flex items-center gap-4">
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
                                            if (allFilteredIds.length > 0 && selectedIds.length === allFilteredIds.length) {
                                                setSelectedIds([]);
                                            } else {
                                                setSelectedIds([...allFilteredIds]);
                                            }
                                        }}
                                        className="px-4 py-2 bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 font-bold rounded-xl text-sm transition-all whitespace-nowrap h-11"
                                    >
                                        {allFilteredIds.length > 0 && selectedIds.length === allFilteredIds.length ? 'Deselect All' : 'Select All'}
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
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                                </div>
                                <input 
                                    type="text" 
                                    placeholder="Search appointments..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="h-11 pl-10 pr-4 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all w-full sm:w-64 bg-gray-50 text-gray-700"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white overflow-hidden shadow-sm rounded-2xl border border-gray-100 relative">
                    {/* Patch to cover the scrollbar track gap in the header */}
                    <div className="absolute top-0 right-0 w-[8px] h-[49px] bg-gray-50 border-b border-gray-200 z-20"></div>

                    <div className="overflow-x-auto max-h-[calc(100vh-190px)] overflow-y-auto custom-scrollbar">
                         <table className="min-w-full divide-y divide-gray-200 table-fixed">
                            <thead className="bg-gray-50 sticky top-0 z-10 ring-1 ring-gray-200">
                                <tr>
                                    <th 
                                        className="text-left overflow-hidden whitespace-nowrap align-middle"
                                        style={{ 
                                            width: isBulkMode ? '48px' : '0px',
                                            minWidth: isBulkMode ? '48px' : '0px',
                                            maxWidth: isBulkMode ? '48px' : '0px',
                                            opacity: isBulkMode ? 1 : 0,
                                            paddingLeft: isBulkMode ? '1.5rem' : '0px',
                                            paddingRight: isBulkMode ? '0.5rem' : '0px',
                                            paddingTop: isBulkMode ? '1rem' : '0px',
                                            paddingBottom: isBulkMode ? '1rem' : '0px',
                                            transition: 'all 350ms cubic-bezier(0.4, 0, 0.2, 1)'
                                        }}
                                    ></th>
                                    <th 
                                        className="px-4 py-4 text-center whitespace-nowrap align-middle"
                                        style={{ 
                                            width: '48px',
                                            minWidth: '48px',
                                            maxWidth: '48px',
                                            transition: 'all 350ms cubic-bezier(0.4, 0, 0.2, 1)'
                                        }}
                                    ></th>
                                    <th 
                                        className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap align-middle"
                                        style={{
                                            width: isBulkMode ? '27%' : '31%',
                                            transition: 'all 350ms cubic-bezier(0.4, 0, 0.2, 1)'
                                        }}
                                    >
                                        Session
                                    </th>
                                    <th 
                                        className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap align-middle"
                                        style={{
                                            width: '25%',
                                            transition: 'all 350ms cubic-bezier(0.4, 0, 0.2, 1)'
                                        }}
                                    >
                                        Doctor
                                    </th>
                                    <th 
                                        className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap align-middle"
                                        style={{
                                            width: '20%',
                                            transition: 'all 350ms cubic-bezier(0.4, 0, 0.2, 1)'
                                        }}
                                    >
                                        Date & Time
                                    </th>
                                    <th 
                                        className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap align-middle"
                                        style={{
                                            width: '10%',
                                            transition: 'all 350ms cubic-bezier(0.4, 0, 0.2, 1)'
                                        }}
                                    >
                                        Bookings
                                    </th>
                                    <th 
                                        className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap align-middle"
                                        style={{
                                            width: '10%',
                                            transition: 'all 350ms cubic-bezier(0.4, 0, 0.2, 1)'
                                        }}
                                    >
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {groupedSessions.map((group) => {
                                    const isExpanded = expandedSessions.includes(group.scheduleId);
                                    const groupAptIds = group.appointments.map((a: any) => a.id);
                                    const allGroupSelected = groupAptIds.every((id: number) => selectedIds.includes(id));
                                    
                                    return (
                                        <> 
                                            {/* Session Header Row */}
                                            <tr 
                                                key={`session-${group.scheduleId}`}
                                                onClick={() => toggleSession(group.scheduleId)}
                                                className={`cursor-pointer transition-colors ${isExpanded ? 'bg-blue-50/30' : 'hover:bg-blue-50'}`}
                                            >
                                                <td 
                                                    className="whitespace-nowrap align-middle overflow-hidden" 
                                                    onClick={(e) => e.stopPropagation()}
                                                    style={{ 
                                                        width: isBulkMode ? '48px' : '0px',
                                                        minWidth: isBulkMode ? '48px' : '0px',
                                                        maxWidth: isBulkMode ? '48px' : '0px',
                                                        opacity: isBulkMode ? 1 : 0,
                                                        paddingLeft: isBulkMode ? '1.5rem' : '0px',
                                                        paddingRight: isBulkMode ? '0.5rem' : '0px',
                                                        paddingTop: isBulkMode ? '1rem' : '0px',
                                                        paddingBottom: isBulkMode ? '1rem' : '0px',
                                                        transition: 'all 350ms cubic-bezier(0.4, 0, 0.2, 1)'
                                                    }}
                                                >
                                                    <div 
                                                        style={{ 
                                                            opacity: isBulkMode ? 1 : 0,
                                                            transform: isBulkMode ? 'scale(1)' : 'scale(0.85)',
                                                            transition: 'all 350ms cubic-bezier(0.4, 0, 0.2, 1)'
                                                        }}
                                                    >
                                                        {isBulkMode && (
                                                            <input 
                                                                type="checkbox" 
                                                                checked={allGroupSelected}
                                                                onChange={() => handleSelectGroup(groupAptIds)}
                                                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                                                title="Select all in this session"
                                                            />
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-center align-middle">
                                                    <svg className={`w-5 h-5 text-gray-400 mx-auto transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-bold text-gray-900">{group.schedule.title}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white font-bold text-xs">
                                                            {group.schedule.doctor.user.name.charAt(0)}
                                                        </div>
                                                        <div className="ml-3 text-sm font-bold text-gray-900">Dr. {group.schedule.doctor.user.name}</div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{new Date(group.appointments[0].date).toLocaleDateString()}</div>
                                                    <div className="text-sm text-gray-500">{group.schedule.time}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                        {group.appointments.length} Patient{group.appointments.length !== 1 ? 's' : ''}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <span className="text-blue-600 font-semibold text-xs">
                                                        {isExpanded ? 'Collapse' : 'Expand'} ↕
                                                    </span>
                                                </td>
                                            </tr>

                                            {/* Expanded Patient Rows */}
                                            {isExpanded && group.appointments.map((apt: any) => (
                                                <tr 
                                                    key={`apt-${apt.id}`}
                                                    onClick={() => {
                                                        if (isBulkMode) {
                                                            handleSelect(apt.id);
                                                        } else {
                                                            setViewPatient(apt.patient);
                                                            setShowPatientModal(true);
                                                        }
                                                    }}
                                                    className={`cursor-pointer transition-colors bg-gray-50/50 border-b border-gray-100 ${
                                                        selectedIds.includes(apt.id) ? 'bg-blue-50/70' : 'hover:bg-blue-50/40'
                                                    } animate-slide-down`}
                                                >
                                                    <td 
                                                        className="whitespace-nowrap align-middle overflow-hidden" 
                                                        onClick={(e) => e.stopPropagation()}
                                                        style={{ 
                                                            width: isBulkMode ? '48px' : '0px',
                                                            minWidth: isBulkMode ? '48px' : '0px',
                                                            maxWidth: isBulkMode ? '48px' : '0px',
                                                            opacity: isBulkMode ? 1 : 0,
                                                            paddingLeft: isBulkMode ? '1.5rem' : '0px',
                                                            paddingRight: isBulkMode ? '0.5rem' : '0px',
                                                            paddingTop: isBulkMode ? '0.75rem' : '0px',
                                                            paddingBottom: isBulkMode ? '0.75rem' : '0px',
                                                            transition: 'all 350ms cubic-bezier(0.4, 0, 0.2, 1)'
                                                        }}
                                                    >
                                                        <div 
                                                            style={{ 
                                                                opacity: isBulkMode ? 1 : 0,
                                                                transform: isBulkMode ? 'scale(1)' : 'scale(0.85)',
                                                                transition: 'all 350ms cubic-bezier(0.4, 0, 0.2, 1)'
                                                            }}
                                                        >
                                                            {isBulkMode && (
                                                                <input 
                                                                    type="checkbox" 
                                                                    checked={selectedIds.includes(apt.id)}
                                                                    onChange={() => handleSelect(apt.id)}
                                                                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                                                />
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <div className="w-5 flex justify-center">
                                                            <div className="w-0.5 h-5 bg-gray-200 rounded-full"></div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-3 whitespace-nowrap" colSpan={2}>
                                                        <div className="flex items-center">
                                                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                                                                {apt.patient.user.name.charAt(0)}
                                                            </div>
                                                            <div className="ml-3">
                                                                <div className="text-sm font-bold text-gray-900">{apt.patient.user.name}</div>
                                                                <div className="text-xs text-gray-500">{apt.patient.tel}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-3 whitespace-nowrap">
                                                        <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-gray-100 text-gray-600">
                                                            Apt #{apt.appointment_number}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-3 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                                        <div className="flex items-center gap-1.5">
                                                            {!!apt.checked_in && (
                                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold leading-5 bg-teal-50 text-teal-700 border border-teal-200/50">
                                                                    Arrived
                                                                </span>
                                                            )}
                                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold leading-5 border ${
                                                                apt.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200/50' :
                                                                apt.status === 'confirmed' ? 'bg-blue-50 text-blue-700 border-blue-200/50' :
                                                                apt.status === 'rejected' ? 'bg-rose-50 text-rose-700 border-rose-200/50' :
                                                                'bg-emerald-50 text-emerald-700 border-emerald-200/50'
                                                            }`}>
                                                                {apt.status ? apt.status.charAt(0).toUpperCase() + apt.status.slice(1) : 'Pending'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-3 whitespace-nowrap text-right text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                                                        <div className="flex items-center justify-end gap-2">
                                                            {apt.status === 'pending' && (
                                                                <>
                                                                    <Link
                                                                        href={route('admin.appointments.status.update', apt.id)}
                                                                        method="patch"
                                                                        data={{ status: 'confirmed' }}
                                                                        as="button"
                                                                        preserveScroll
                                                                        title="Approve Appointment"
                                                                        className="text-teal-600 hover:text-teal-700 bg-teal-50 hover:bg-teal-100 p-2 rounded-xl border border-teal-100 transition-all shadow-sm hover:scale-105 active:scale-95 cursor-pointer"
                                                                    >
                                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                                                        </svg>
                                                                    </Link>
                                                                    <Link
                                                                        href={route('admin.appointments.status.update', apt.id)}
                                                                        method="patch"
                                                                        data={{ status: 'rejected' }}
                                                                        as="button"
                                                                        preserveScroll
                                                                        title="Reject Appointment"
                                                                        className="text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 p-2 rounded-xl border border-rose-100 transition-all shadow-sm hover:scale-105 active:scale-95 cursor-pointer"
                                                                    >
                                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                                                                        </svg>
                                                                    </Link>
                                                                </>
                                                            )}
                                                            {apt.status !== 'rejected' && apt.status !== 'completed' && (
                                                                <>
                                                                    {apt.status === 'confirmed' && !apt.checked_in && (
                                                                        <Link
                                                                            href={route('admin.appointments.check-in')}
                                                                            method="post"
                                                                            data={{ code: `APT-${apt.id}` }}
                                                                            as="button"
                                                                            preserveScroll
                                                                            title="Check In Patient"
                                                                            className="text-teal-600 hover:text-teal-700 bg-teal-50 hover:bg-teal-100 p-2 rounded-xl border border-teal-100 transition-all shadow-sm hover:scale-105 active:scale-95 cursor-pointer"
                                                                        >
                                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                                            </svg>
                                                                        </Link>
                                                                    )}
                                                                    <button 
                                                                        onClick={() => setAppointmentToCancel(apt.id)}
                                                                        title="Cancel Appointment"
                                                                        className="text-gray-500 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 p-2 rounded-xl border border-gray-200 transition-all shadow-sm hover:scale-105 active:scale-95 cursor-pointer"
                                                                    >
                                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                        </svg>
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </>
                                    );
                                })}
                            </tbody>
                        </table>
                        {groupedSessions.length === 0 && (
                            <div className="p-10 text-center text-gray-500">
                                {searchQuery ? 'No appointments found matching your search.' : 'No appointments found.'}
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
                        Are you sure you want to cancel this appointment? This action cannot be undone and both parties will be notified.
                    </p>
                    <div className="flex gap-3">
                        <button 
                            onClick={() => setAppointmentToCancel(null)}
                            className="flex-1 px-4 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-bold rounded-xl transition-all shadow-sm"
                        >
                            Keep It
                        </button>
                        <Link 
                            href={appointmentToCancel ? route('admin.appointments.destroy', appointmentToCancel) : '#'}
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
                    <h3 className="text-xl font-bold text-gray-900 text-center mb-3">Cancel Appointments?</h3>
                    <p className="text-sm text-gray-500 text-center mb-8 leading-relaxed">
                        Are you sure you want to cancel {selectedIds.length} selected appointment(s)? This action cannot be undone.
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

            <PatientDetailsModal 
                show={showPatientModal} 
                onClose={() => setShowPatientModal(false)} 
                patient={viewPatient} 
            />
        </SidebarLayout>
    );
}
