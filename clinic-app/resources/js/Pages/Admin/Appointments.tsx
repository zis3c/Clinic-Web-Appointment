import SidebarLayout from '@/Layouts/SidebarLayout';
import { useAutoRefresh } from '@/hooks/useAutoRefresh';
import Modal from '@/Components/Modal';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useMemo, Fragment } from 'react';
import PatientDetailsModal from '@/Components/PatientDetailsModal';

export default function Appointments({ auth, appointments }: any) {
    useAutoRefresh(['appointments']);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
    const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
    const [appointmentToCancel, setAppointmentToCancel] = useState<number | null>(null);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [isBulkMode, setIsBulkMode] = useState(false);
    const [showBulkCancelModal, setShowBulkCancelModal] = useState(false);
    const [viewPatient, setViewPatient] = useState<any>(null);
    const [showPatientModal, setShowPatientModal] = useState(false);
    const [expandedSessions, setExpandedSessions] = useState<number[]>([]);
    const [pendingDeleteIds, setPendingDeleteIds] = useState<number[]>([]);

    // Group appointments by schedule_id
    const groupedSessions = useMemo(() => {
        const groups: Record<number, { schedule: any; appointments: any[] }> = {};
        
        const filtered = appointments.filter((appointment: any) => 
            !pendingDeleteIds.includes(appointment.id) && (
                appointment.appointment_number.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
                appointment.patient.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                appointment.schedule.doctor.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                appointment.date.includes(searchQuery)
            )
        );

        filtered.forEach((apt: any) => {
            const sid = apt.schedule_id;
            if (!groups[sid]) {
                groups[sid] = { schedule: apt.schedule, appointments: [] };
            }
            groups[sid].appointments.push(apt);
        });

        const sortedGroups = Object.entries(groups).map(([id, group]) => ({
            scheduleId: Number(id),
            ...group,
        }));

        sortedGroups.sort((a: any, b: any) => {
            const dateA = new Date(a.schedule.date).getTime();
            const dateB = new Date(b.schedule.date).getTime();
            // If same date, sort by time
            if (dateA === dateB) {
                return sortOrder === 'newest' 
                    ? b.schedule.time.localeCompare(a.schedule.time)
                    : a.schedule.time.localeCompare(b.schedule.time);
            }
            return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
        });

        return sortedGroups;
    }, [appointments, searchQuery, sortOrder, pendingDeleteIds]);

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

    const handleConfirmCancel = () => {
        if (!appointmentToCancel) return;
        const targetId = appointmentToCancel;
        const apt = appointments.find((a: any) => a.id === targetId);
        const patientName = apt?.patient?.user?.name || 'Patient';
        
        // Hide immediately
        setPendingDeleteIds(prev => [...prev, targetId]);
        setAppointmentToCancel(null);

        // Dispatch undo toast event
        const event = new CustomEvent('show-undo-toast', {
            detail: {
                message: `Appointment for "${patientName}" has been cancelled.`,
                onConfirm: () => {
                    router.delete(route('admin.appointments.destroy', targetId), {
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
            header={<h2 className="font-semibold text-2xl text-gray-800 dark:text-slate-100 leading-tight">Manage Appointments</h2>}
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
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white dark:bg-slate-800 p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 transition-all gap-4 md:gap-0">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 dark:text-slate-100">All Appointments</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">View and manage all patient bookings across all doctors, grouped by session.</p>
                    </div>
                    <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 w-full md:w-auto">
                        <div className="flex flex-row flex-wrap sm:flex-nowrap gap-3 w-full md:w-auto z-20 relative items-center">
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
                                            if (allFilteredIds.length > 0 && selectedIds.length === allFilteredIds.length) {
                                                setSelectedIds([]);
                                            } else {
                                                setSelectedIds([...allFilteredIds]);
                                            }
                                        }}
                                        className="px-4 py-2 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800/50 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 font-bold rounded-xl text-sm transition-all whitespace-nowrap h-11"
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
                                        className="px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600 font-bold rounded-xl text-sm transition-all whitespace-nowrap h-11"
                                    >
                                        Done
                                    </button>
                                </>
                            )}
                                <div className="relative">
                                    <button 
                                        onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                                        className={`h-11 px-4 border border-gray-200 dark:border-slate-700 rounded-xl text-sm transition-all bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 cursor-pointer min-w-[150px] flex items-center justify-between shadow-sm font-semibold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/40 ${sortDropdownOpen ? 'border-blue-500 ring-2 ring-blue-500/20 dark:ring-blue-500/40' : ''}`}
                                    >
                                        <div className="flex items-center gap-2">
                                            {sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}
                                        </div>
                                        <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${sortDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                    </button>
                                    
                                    {sortDropdownOpen && (
                                        <>
                                            <div className="fixed inset-0 z-30" onClick={() => setSortDropdownOpen(false)}></div>
                                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 z-40 overflow-hidden animate-slide-down origin-top-right">
                                                <div className="p-1.5">
                                                    <button
                                                        onClick={() => { setSortOrder('newest'); setSortDropdownOpen(false); }}
                                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold flex items-center justify-between transition-all outline-none ${sortOrder === 'newest' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 'text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700/50'}`}
                                                    >
                                                        Newest First
                                                        {sortOrder === 'newest' && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>}
                                                    </button>
                                                    <button
                                                        onClick={() => { setSortOrder('oldest'); setSortDropdownOpen(false); }}
                                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold flex items-center justify-between transition-all outline-none ${sortOrder === 'oldest' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 'text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700/50'}`}
                                                    >
                                                        Oldest First
                                                        {sortOrder === 'oldest' && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>}
                                                    </button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                                <div className="relative flex-1 min-w-[200px] w-full sm:w-auto">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                                </div>
                                <input 
                                    type="text" 
                                    placeholder="Search appointments..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="h-11 pl-10 pr-4 border border-gray-200 dark:border-slate-700 rounded-xl text-sm transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/40 outline-none w-full md:w-64 bg-gray-50 dark:bg-slate-900/50 text-gray-700 dark:text-slate-200 placeholder-gray-400 dark:placeholder-gray-500 placeholder:font-normal"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Desktop Table View */}
                <div className="bg-white dark:bg-slate-800 overflow-hidden shadow-sm rounded-2xl border border-gray-100 dark:border-slate-700 relative transition-all hidden md:block">
                    {/* Patch to cover the scrollbar track gap in the header */}
                    <div className="absolute top-0 right-0 w-[8px] h-[49px] bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 z-20"></div>

                    <div className="overflow-x-auto h-[calc(100vh-190px)] overflow-y-auto custom-scrollbar flex flex-col">
                         <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700 table-fixed">
                            <thead className="bg-gray-50/80 dark:bg-slate-800/80 backdrop-blur-md sticky top-0 z-10 ring-1 ring-gray-200 dark:ring-slate-700">
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
                                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 dark:text-gray-400 capitalize tracking-wider whitespace-nowrap align-middle w-12">#</th>
                                    <th 
                                        className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 capitalize tracking-wider whitespace-nowrap align-middle"
                                        style={{
                                            width: isBulkMode ? '27%' : '31%',
                                            transition: 'all 350ms cubic-bezier(0.4, 0, 0.2, 1)'
                                        }}
                                    >
                                        Session
                                    </th>
                                    <th 
                                        className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 capitalize tracking-wider whitespace-nowrap align-middle"
                                        style={{
                                            width: '25%',
                                            transition: 'all 350ms cubic-bezier(0.4, 0, 0.2, 1)'
                                        }}
                                    >
                                        Doctor
                                    </th>
                                    <th 
                                        className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 capitalize tracking-wider whitespace-nowrap align-middle"
                                        style={{
                                            width: '20%',
                                            transition: 'all 350ms cubic-bezier(0.4, 0, 0.2, 1)'
                                        }}
                                    >
                                        Date & Time
                                    </th>
                                    <th 
                                        className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 capitalize tracking-wider whitespace-nowrap align-middle"
                                        style={{
                                            width: '10%',
                                            transition: 'all 350ms cubic-bezier(0.4, 0, 0.2, 1)'
                                        }}
                                    >
                                        Bookings
                                    </th>
                                    <th 
                                        className="px-6 py-4 text-right text-xs font-bold text-gray-500 dark:text-gray-400 capitalize tracking-wider whitespace-nowrap align-middle"
                                        style={{
                                            width: '10%',
                                            transition: 'all 350ms cubic-bezier(0.4, 0, 0.2, 1)'
                                        }}
                                    >
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                                <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                                {groupedSessions.map((group, groupIndex) => {
                                    const isExpanded = expandedSessions.includes(group.scheduleId);
                                    const groupAptIds = group.appointments.map((a: any) => a.id);
                                    const allGroupSelected = groupAptIds.every((id: number) => selectedIds.includes(id));
                                    
                                    return (
                                        <Fragment key={`group-${group.scheduleId}`}> 
                                            {/* Session Header Row */}
                                            <tr 
                                                key={`session-${group.scheduleId}`}
                                                onClick={() => toggleSession(group.scheduleId)}
                                                className={`cursor-pointer transition-all ${isExpanded ? 'bg-blue-50/30 dark:bg-blue-900/10' : 'hover:bg-blue-50 dark:hover:bg-slate-700/50'}`}
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
                                                                className="w-4 h-4 rounded border-gray-300 dark:border-slate-700 text-blue-600 dark:bg-slate-700 focus:ring-blue-500 cursor-pointer"
                                                                title="Select all in this session"
                                                            />
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-center align-middle">
                                                    <svg className={`w-5 h-5 text-gray-400 dark:text-gray-500 mx-auto transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center font-bold text-sm text-gray-500 dark:text-gray-400">
                                                    {groupIndex + 1}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-bold text-gray-900 dark:text-slate-100">{group.schedule.title}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white font-bold text-xs">
                                                            {group.schedule.doctor.user.name.charAt(0)}
                                                        </div>
                                                        <div className="ml-3 text-sm font-bold text-gray-900 dark:text-slate-100">Dr. {group.schedule.doctor.user.name}</div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900 dark:text-slate-100">{new Date(group.appointments[0].date).toLocaleDateString()}</div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">{group.schedule.time}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400">
                                                        {group.appointments.length} Patient{group.appointments.length !== 1 ? 's' : ''}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <span className="text-blue-600 dark:text-blue-400 font-semibold text-xs">
                                                        {isExpanded ? 'Collapse' : 'Expand'} ↕
                                                    </span>
                                                </td>
                                            </tr>

                                            {/* Expanded Patient Rows */}
                                            {isExpanded && group.appointments.map((apt: any, aptIndex: number) => (
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
                                                    className={`cursor-pointer transition-all bg-gray-50/50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-700/50 ${
                                                        selectedIds.includes(apt.id) ? 'bg-blue-50/70 dark:bg-blue-900/20' : 'hover:bg-blue-50/40 dark:hover:bg-slate-700/30'
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
                                                                    className="w-4 h-4 rounded border-gray-300 dark:border-slate-700 text-blue-600 dark:bg-slate-700 focus:ring-blue-500 cursor-pointer"
                                                                />
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <div className="w-5 flex justify-center">
                                                            <div className="w-0.5 h-5 bg-gray-200 dark:bg-slate-700 rounded-full"></div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-3 whitespace-nowrap text-center text-xs font-bold text-gray-400 dark:text-gray-500">
                                                        {groupIndex + 1}.{aptIndex + 1}
                                                    </td>
                                                    <td className="px-6 py-3 whitespace-nowrap" colSpan={2}>
                                                        <div className="flex items-center">
                                                            <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-400 font-bold text-xs">
                                                                {apt.patient?.user?.name?.charAt(0) || '?'}
                                                            </div>
                                                            <div className="ml-3">
                                                                <div className="text-sm font-bold text-gray-900 dark:text-slate-100">{apt.patient?.user?.name || 'Unknown Patient'}</div>
                                                                <div className="text-xs text-gray-500 dark:text-gray-400">{apt.patient?.tel || 'No contact'}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-3 whitespace-nowrap">
                                                        <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300">
                                                            Apt #{apt.appointment_number}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-3 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                                        <div className="flex items-center gap-1.5">
                                                            {!!apt.checked_in && (
                                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold leading-5 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 border border-teal-200/50 dark:border-teal-800/50">
                                                                    Arrived
                                                                </span>
                                                            )}
                                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold leading-5 border ${
                                                                apt.status === 'pending' ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200/50 dark:border-amber-800/50' :
                                                                apt.status === 'confirmed' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200/50 dark:border-blue-800/50' :
                                                                apt.status === 'rejected' ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-rose-200/50 dark:border-rose-800/50' :
                                                                'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-800/50'
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
                                                                        className="text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 bg-teal-50 dark:bg-teal-900/30 hover:bg-teal-100 dark:hover:bg-teal-900/50 p-2 rounded-xl border border-teal-100 dark:border-teal-800/50 transition-all shadow-sm hover:scale-105 active:scale-95 cursor-pointer"
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
                                                                        className="text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 bg-rose-50 dark:bg-rose-900/30 hover:bg-rose-100 dark:hover:bg-rose-900/50 p-2 rounded-xl border border-rose-100 dark:border-rose-800/50 transition-all shadow-sm hover:scale-105 active:scale-95 cursor-pointer"
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
                                                                            className="text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 bg-teal-50 dark:bg-teal-900/30 hover:bg-teal-100 dark:hover:bg-teal-900/50 p-2 rounded-xl border border-teal-100 dark:border-teal-800/50 transition-all shadow-sm hover:scale-105 active:scale-95 cursor-pointer"
                                                                        >
                                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                                            </svg>
                                                                        </Link>
                                                                    )}
                                                                    <button 
                                                                        onClick={() => setAppointmentToCancel(apt.id)}
                                                                        title="Cancel Appointment"
                                                                        className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 p-2 rounded-xl border border-gray-200 dark:border-slate-700 transition-all shadow-sm hover:scale-105 active:scale-95 cursor-pointer"
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
                                        </Fragment>
                                    );
                                })}
                            </tbody>
                        </table>
                        {groupedSessions.length === 0 && (
                            <div className="flex-1 flex flex-col justify-center items-center p-10 text-center text-gray-500 dark:text-gray-400">
                                {searchQuery ? 'No appointments found matching your search.' : 'No appointments found.'}
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile Cards View */}
                <div className="md:hidden flex flex-col gap-4 mt-4">
                    {groupedSessions.length === 0 ? (
                        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl text-center shadow-sm border border-gray-100 dark:border-slate-700">
                            <p className="text-gray-500 dark:text-gray-400 font-medium">
                                {searchQuery ? 'No appointments found matching your search.' : 'No appointments found.'}
                            </p>
                        </div>
                    ) : (
                        groupedSessions.map(group => {
                            const isExpanded = expandedSessions.includes(group.scheduleId);
                            const groupAptIds = group.appointments.map((a: any) => a.id);
                            const allGroupSelected = groupAptIds.every((id: number) => selectedIds.includes(id));
                            
                            return (
                                <div key={`mob-group-${group.scheduleId}`} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
                                    {/* Session Header Card */}
                                    <div 
                                        onClick={() => toggleSession(group.scheduleId)}
                                        className={`p-4 flex flex-col gap-3 cursor-pointer ${isExpanded ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-3">
                                                {isBulkMode && (
                                                    <input 
                                                        type="checkbox" 
                                                        checked={allGroupSelected}
                                                        onChange={(e) => { e.stopPropagation(); handleSelectGroup(groupAptIds); }}
                                                        className="w-5 h-5 rounded border-gray-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500"
                                                    />
                                                )}
                                                <div>
                                                    <h4 className="font-bold text-gray-900 dark:text-slate-100">{group.schedule.title}</h4>
                                                    <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mt-1">Dr. {group.schedule.doctor.user.name}</p>
                                                </div>
                                            </div>
                                            <svg className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                                        </div>
                                        
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-500 dark:text-gray-400">{new Date(group.appointments[0].date).toLocaleDateString()} • {group.schedule.time}</span>
                                            <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400">
                                                {group.appointments.length} Patient{group.appointments.length !== 1 ? 's' : ''}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Mobile Appointments List */}
                                    {isExpanded && (
                                        <div className="border-t border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/20 divide-y divide-gray-100 dark:divide-slate-700">
                                            {group.appointments.map((apt: any) => (
                                                <div 
                                                    key={`mob-apt-${apt.id}`}
                                                    onClick={() => {
                                                        if (isBulkMode) {
                                                            handleSelect(apt.id);
                                                        } else {
                                                            setViewPatient(apt.patient);
                                                            setShowPatientModal(true);
                                                        }
                                                    }}
                                                    className={`p-4 flex flex-col gap-3 ${selectedIds.includes(apt.id) ? 'bg-blue-50/70 dark:bg-blue-900/20' : ''}`}
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex items-center gap-3">
                                                            {isBulkMode && (
                                                                <input 
                                                                    type="checkbox" 
                                                                    checked={selectedIds.includes(apt.id)}
                                                                    onChange={(e) => { e.stopPropagation(); handleSelect(apt.id); }}
                                                                    className="w-5 h-5 rounded border-gray-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500"
                                                                />
                                                            )}
                                                            <div className="flex items-center gap-2.5">
                                                                <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-400 font-bold text-xs">
                                                                    {apt.patient?.user?.name?.charAt(0) || '?'}
                                                                </div>
                                                                <div>
                                                                    <h5 className="font-bold text-gray-900 dark:text-slate-100 text-sm">{apt.patient?.user?.name || 'Unknown Patient'}</h5>
                                                                    <p className="text-xs text-gray-500 dark:text-gray-400">{apt.patient?.tel || 'No contact'}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col items-end gap-1.5">
                                                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-gray-100 dark:bg-slate-700/50 text-gray-600 dark:text-gray-300 border border-gray-200/50 dark:border-slate-700/50">Apt #{apt.appointment_number}</span>
                                                            <div className="flex items-center gap-1.5">
                                                                {!!apt.checked_in && (
                                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 border border-teal-200/50 dark:border-teal-800/50">
                                                                        Arrived
                                                                    </span>
                                                                )}
                                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${apt.status === 'pending' ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200/50 dark:border-amber-800/50' : apt.status === 'confirmed' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200/50 dark:border-blue-800/50' : apt.status === 'rejected' ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-rose-200/50 dark:border-rose-800/50' : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-800/50'}`}>
                                                                    {apt.status ? apt.status.charAt(0).toUpperCase() + apt.status.slice(1) : 'Pending'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {apt.status === 'pending' && !isBulkMode && (
                                                        <div className="flex gap-2 mt-1">
                                                            <Link href={route('admin.appointments.status.update', apt.id)} method="patch" data={{ status: 'confirmed' }} className="flex-1 text-center py-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-bold text-xs rounded-lg border border-emerald-200 dark:border-emerald-800/50 hover:bg-emerald-100 transition-all" onClick={(e) => e.stopPropagation()}>Confirm</Link>
                                                            <button onClick={(e) => { e.stopPropagation(); setAppointmentToCancel(apt.id); }} className="flex-1 text-center py-2 bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 font-bold text-xs rounded-lg border border-rose-200 dark:border-rose-800/50 hover:bg-rose-100 transition-all">Cancel</button>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>

            </div>

            {/* Cancel Confirmation Modal */}
            <Modal show={appointmentToCancel !== null} onClose={() => setAppointmentToCancel(null)} maxWidth="sm">
                <div className="p-4 sm:p-6 md:p-8 dark:bg-slate-800">
                    <div className="flex items-center justify-center w-16 h-16 mx-auto bg-rose-50 dark:bg-rose-900/30 rounded-2xl mb-6 shadow-inner">
                        <svg className="w-8 h-8 text-rose-500 dark:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-3">Cancel Appointment?</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-8 leading-relaxed">
                        Are you sure you want to cancel this appointment? This action cannot be undone and both parties will be notified.
                    </p>
                    <div className="flex flex-col-reverse sm:flex-row gap-3">
                        <button 
                            onClick={() => setAppointmentToCancel(null)}
                            className="flex-1 px-4 py-3 bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl transition-all shadow-sm"
                        >
                            Keep It
                        </button>
                        <button 
                            onClick={handleConfirmCancel}
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-bold rounded-xl transition-all text-center shadow-md hover:shadow-lg hover:-translate-y-0.5"
                        >
                            Yes, Cancel
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Bulk Cancel Confirmation Modal */}
            <Modal show={showBulkCancelModal} onClose={() => setShowBulkCancelModal(false)} maxWidth="sm">
                <div className="p-4 sm:p-6 md:p-8 dark:bg-slate-800">
                    <div className="flex items-center justify-center w-16 h-16 mx-auto bg-rose-50 dark:bg-rose-900/30 rounded-2xl mb-6 shadow-inner">
                        <svg className="w-8 h-8 text-rose-500 dark:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-3">Cancel Appointments?</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-8 leading-relaxed">
                        Are you sure you want to cancel {selectedIds.length} selected appointment(s)? This action cannot be undone.
                    </p>
                    <div className="flex flex-col-reverse sm:flex-row gap-3">
                        <button 
                            onClick={() => setShowBulkCancelModal(false)}
                            className="flex-1 px-4 py-3 bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl transition-all shadow-sm"
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


