import SidebarLayout from '@/Layouts/SidebarLayout';
import { useAutoRefresh } from '@/hooks/useAutoRefresh';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import Modal from '@/Components/Modal';

import AdminPatientHistoryModal from '@/Components/AdminPatientHistoryModal';

export default function Patients({ auth, patients }: any) {
    useAutoRefresh(['patients'], { pollingOnly: true });
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [isBulkMode, setIsBulkMode] = useState(false);
    const [showBulkCancelModal, setShowBulkCancelModal] = useState(false);
    const [viewPatient, setViewPatient] = useState<any>(null);
    const [showPatientModal, setShowPatientModal] = useState(false);
    const [patientToDelete, setPatientToDelete] = useState<number | null>(null);
    const [pendingDeleteIds, setPendingDeleteIds] = useState<number[]>([]);

    const handleSingleDelete = () => {
        if (!patientToDelete) return;
        const targetId = patientToDelete;
        const patientName = patients.find((p: any) => p.id === targetId)?.user?.name || 'Patient';
        
        // Hide immediately
        setPendingDeleteIds(prev => [...prev, targetId]);
        setPatientToDelete(null);

        // Dispatch undo toast event
        const event = new CustomEvent('show-undo-toast', {
            detail: {
                message: `Patient "${patientName}" has been queued for deletion.`,
                onConfirm: () => {
                    router.delete(route('admin.patients.destroy', targetId), {
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

    const filteredPatients = patients.filter((patient: any) => 
        !pendingDeleteIds.includes(patient.id) && (
            patient.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            patient.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            patient.nic.toLowerCase().includes(searchQuery.toLowerCase()) ||
            patient.tel.includes(searchQuery)
        )
    );

    const handleSelect = (id: number) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handleBulkCancel = () => {
        router.delete(route('admin.patients.bulk-destroy'), {
            data: { patient_ids: selectedIds },
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
            header={<h2 className="font-semibold text-2xl text-gray-800 dark:text-slate-100 leading-tight">Manage Patients</h2>}
        >
            <Head title="Manage Patients" />

            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white dark:bg-slate-800 p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 transition-all gap-4 md:gap-0">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 dark:text-slate-100">Patient Directory</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">View and manage all registered patients.</p>
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
                                            if (filteredPatients.length > 0 && selectedIds.length === filteredPatients.length) {
                                                setSelectedIds([]);
                                            } else {
                                                setSelectedIds(filteredPatients.map((p: any) => p.id));
                                            }
                                        }}
                                        className="px-4 py-2 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800/50 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 font-bold rounded-xl text-sm transition-all whitespace-nowrap h-11"
                                    >
                                        {filteredPatients.length > 0 && selectedIds.length === filteredPatients.length ? 'Deselect All' : 'Select All'}
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
                            <div className="relative flex-1 min-w-[200px] w-full sm:w-auto">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                                </div>
                                <input 
                                    type="text" 
                                    placeholder="Search patients..." 
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
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                            <thead className="bg-gray-50/80 dark:bg-slate-800/80 backdrop-blur-md sticky top-0 z-10 ring-1 ring-gray-200 dark:ring-slate-700">
                                <tr>
                                    {isBulkMode && <th className="px-6 py-4 w-10"></th>}
                                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 dark:text-gray-400 capitalize tracking-wider w-12">#</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 capitalize tracking-wider">Patient</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 capitalize tracking-wider">NIC</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 capitalize tracking-wider">Contact</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 capitalize tracking-wider">DOB</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 dark:text-gray-400 capitalize tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                                {filteredPatients.map((patient: any, index: number) => (
                                    <tr 
                                        key={patient.id} 
                                        onClick={() => {
                                            if (isBulkMode) {
                                                handleSelect(patient.id);
                                            } else {
                                                setViewPatient(patient);
                                                setShowPatientModal(true);
                                            }
                                        }}
                                        className={`transition-all cursor-pointer ${selectedIds.includes(patient.id) ? 'bg-blue-50/50 dark:bg-blue-900/20' : 'hover:bg-blue-50 dark:hover:bg-slate-700/50'}`}
                                    >
                                        {isBulkMode && (
                                            <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                                <input 
                                                    type="checkbox" 
                                                    checked={selectedIds.includes(patient.id)}
                                                    onChange={() => handleSelect(patient.id)}
                                                    className="w-5 h-5 rounded-md border-gray-300 dark:border-slate-700 text-blue-600 dark:bg-slate-700 focus:ring-blue-500 cursor-pointer"
                                                />
                                            </td>
                                        )}
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold text-gray-400 dark:text-gray-500">
                                            {index + 1}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-400 font-bold">
                                                    {patient.user.name.charAt(0)}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-bold text-gray-900 dark:text-slate-100">{patient.user.name}</div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">{patient.user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {patient.nic}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {patient.tel}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {patient.dob}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center justify-end gap-2">

                                                <button 
                                                    onClick={() => setPatientToDelete(patient.id)}
                                                    title="Remove"
                                                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 hover:text-rose-700 dark:hover:text-rose-300 transition-all shadow-sm"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredPatients.length === 0 && (
                            <div className="flex-1 flex flex-col justify-center items-center p-10 text-center text-gray-500 dark:text-gray-400">
                                {searchQuery ? 'No patients found matching your search.' : 'No patients found.'}
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile Cards View */}
                <div className="md:hidden flex flex-col gap-4 mt-4">
                    {filteredPatients.length === 0 ? (
                        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl text-center shadow-sm border border-gray-100 dark:border-slate-700">
                            <p className="text-gray-500 dark:text-gray-400 font-medium">
                                {searchQuery ? 'No patients found matching your search.' : 'No patients found.'}
                            </p>
                        </div>
                    ) : (
                        filteredPatients.map((patient: any) => (
                            <div 
                                key={`mob-pat-${patient.id}`}
                                onClick={() => {
                                    if (isBulkMode) {
                                        handleSelect(patient.id);
                                    } else {
                                        setViewPatient(patient);
                                        setShowPatientModal(true);
                                    }
                                }}
                                className={`bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-4 flex flex-col gap-3 cursor-pointer transition-all ${selectedIds.includes(patient.id) ? 'bg-blue-50/70 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-slate-700/50'}`}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        {isBulkMode && (
                                            <input 
                                                type="checkbox" 
                                                checked={selectedIds.includes(patient.id)}
                                                onChange={(e) => { e.stopPropagation(); handleSelect(patient.id); }}
                                                className="w-5 h-5 rounded border-gray-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                            />
                                        )}
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-400 font-bold">
                                                {patient.user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900 dark:text-slate-100 text-base">{patient.user.name}</h4>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{patient.user.email}</p>
                                            </div>
                                        </div>
                                    </div>
                                    {!isBulkMode && (
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setPatientToDelete(patient.id); }}
                                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-all shrink-0"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                        </button>
                                    )}
                                </div>
                                
                                <div className="flex flex-col gap-2 pt-3 border-t border-gray-100 dark:border-slate-700 mt-1">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500 dark:text-gray-400">NIC</span>
                                        <span className="text-gray-900 dark:text-slate-100 font-medium">{patient.nic}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500 dark:text-gray-400">Contact</span>
                                        <span className="text-gray-900 dark:text-slate-100 font-medium">{patient.tel}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500 dark:text-gray-400">DOB</span>
                                        <span className="text-gray-900 dark:text-slate-100 font-medium">{patient.dob}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

            </div>

            {/* Bulk Delete Confirmation Modal */}
            <Modal show={showBulkCancelModal} onClose={() => setShowBulkCancelModal(false)} maxWidth="sm">
                <div className="p-6 dark:bg-slate-800">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Confirm Deletion</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                        Are you sure you want to delete {selectedIds.length} selected patient(s)? This action cannot be undone.
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
                            Yes, Delete Patients
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal show={patientToDelete !== null} onClose={() => setPatientToDelete(null)} maxWidth="sm">
                <div className="p-4 sm:p-6 md:p-8 dark:bg-slate-800">
                    <div className="flex items-center justify-center w-16 h-16 mx-auto bg-rose-50 dark:bg-rose-900/30 rounded-2xl mb-6 shadow-inner">
                        <svg className="w-8 h-8 text-rose-500 dark:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-3">Remove Patient?</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-8 leading-relaxed">
                        Are you sure you want to remove this patient from the directory? This action cannot be undone and will delete all patient records.
                    </p>
                    <div className="flex gap-3">
                        <button 
                            onClick={() => setPatientToDelete(null)}
                            className="flex-1 px-4 py-3 bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl transition-all shadow-sm"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleSingleDelete}
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-bold rounded-xl transition-all text-center shadow-md hover:shadow-lg hover:-translate-y-0.5"
                        >
                            Yes, Remove
                        </button>
                    </div>
                </div>
            </Modal>

            <AdminPatientHistoryModal 
                show={showPatientModal} 
                onClose={() => setShowPatientModal(false)} 
                patient={viewPatient} 
            />
        </SidebarLayout>
    );
}


