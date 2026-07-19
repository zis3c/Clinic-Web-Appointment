import { useState, Fragment } from 'react';
import { useAutoRefresh } from '@/hooks/useAutoRefresh';
import SidebarLayout from '@/Layouts/SidebarLayout';
import { Head, useForm, router } from '@inertiajs/react';
import CustomSelect from '@/Components/CustomSelect';
import { Dialog, Transition } from '@headlessui/react';
import Modal from '@/Components/Modal';
import AdminDoctorHistoryModal from '@/Components/AdminDoctorHistoryModal';

export default function Doctors({ auth, doctors, specialties }: any) {
    useAutoRefresh(['doctors'], { pollingOnly: true });
    const [showAddModal, setShowAddModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [isBulkMode, setIsBulkMode] = useState(false);
    const [showBulkCancelModal, setShowBulkCancelModal] = useState(false);
    const [viewDoctor, setViewDoctor] = useState<any>(null);
    const [showDoctorModal, setShowDoctorModal] = useState(false);
    const [doctorToDelete, setDoctorToDelete] = useState<number | null>(null);
    const [pendingDeleteIds, setPendingDeleteIds] = useState<number[]>([]);

    const handleSingleDelete = () => {
        if (!doctorToDelete) return;
        const targetId = doctorToDelete;
        const doctorName = doctors.find((d: any) => d.id === targetId)?.user?.name || 'Doctor';
        
        // Hide immediately
        setPendingDeleteIds(prev => [...prev, targetId]);
        setDoctorToDelete(null);

        // Dispatch undo toast event
        const event = new CustomEvent('show-undo-toast', {
            detail: {
                message: `Dr. "${doctorName}" has been queued for deletion.`,
                onConfirm: () => {
                    router.delete(route('admin.doctors.destroy', targetId), {
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
    
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        nic: '',
        tel: '',
        specialty_id: specialties.length > 0 ? specialties[0].id : '',
    });

    const submit = (e: any) => {
        e.preventDefault();
        post(route('admin.doctors.store'), {
            onSuccess: () => {
                setShowAddModal(false);
                reset();
            },
        });
    };

    const filteredDoctors = doctors.filter((doctor: any) => 
        !pendingDeleteIds.includes(doctor.id) && (
            doctor.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            doctor.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            doctor.specialty.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            doctor.nic.toLowerCase().includes(searchQuery.toLowerCase()) ||
            doctor.tel.includes(searchQuery)
        )
    );

    const handleSelect = (id: number) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handleBulkCancel = () => {
        router.delete(route('admin.doctors.bulk-destroy'), {
            data: { doctor_ids: selectedIds },
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
            header={<h2 className="font-semibold text-2xl text-gray-800 dark:text-slate-100 leading-tight">Manage Doctors</h2>}
        >
            <Head title="Manage Doctors" />

            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                
                {/* Header Actions */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white dark:bg-slate-800 p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 transition-all gap-4 md:gap-0">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 dark:text-slate-100">Doctor Directory</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Add, edit, or remove doctors from the system.</p>
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
                                        if (filteredDoctors.length > 0 && selectedIds.length === filteredDoctors.length) {
                                            setSelectedIds([]);
                                        } else {
                                            setSelectedIds(filteredDoctors.map((d: any) => d.id));
                                        }
                                    }}
                                    className="px-4 py-2 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800/50 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 font-bold rounded-xl text-sm transition-all whitespace-nowrap h-11"
                                >
                                    {filteredDoctors.length > 0 && selectedIds.length === filteredDoctors.length ? 'Deselect All' : 'Select All'}
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
                                placeholder="Search doctors..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-11 pl-10 pr-4 border border-gray-200 dark:border-slate-700 rounded-xl text-sm transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/40 outline-none w-full md:w-64 bg-gray-50 dark:bg-slate-900/50 text-gray-700 dark:text-slate-200 placeholder-gray-400 dark:placeholder-gray-500 placeholder:font-normal"
                            />
                        </div>
                        <button 
                            onClick={() => setShowAddModal(true)}
                            className="h-11 px-5 flex items-center justify-center bg-gradient-to-r from-teal-400 to-blue-600 dark:from-teal-600 dark:to-blue-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/40 outline-none w-full sm:w-auto whitespace-nowrap mt-1 sm:mt-0"
                        >
                            + Add New Doctor
                        </button>
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
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 capitalize tracking-wider">Doctor</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 capitalize tracking-wider">Specialty</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 capitalize tracking-wider">Contact</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 capitalize tracking-wider">NIC</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 dark:text-gray-400 capitalize tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                                {filteredDoctors.map((doctor: any, index: number) => (
                                    <tr 
                                        key={doctor.id} 
                                        onClick={() => {
                                            if (isBulkMode) {
                                                handleSelect(doctor.id);
                                            } else {
                                                setViewDoctor(doctor);
                                                setShowDoctorModal(true);
                                            }
                                        }}
                                        className={`transition-all cursor-pointer ${selectedIds.includes(doctor.id) ? 'bg-blue-50/50 dark:bg-blue-900/20' : 'hover:bg-blue-50 dark:hover:bg-slate-700/50'}`}
                                    >
                                        {isBulkMode && (
                                            <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                                <input 
                                                    type="checkbox" 
                                                    checked={selectedIds.includes(doctor.id)}
                                                    onChange={() => handleSelect(doctor.id)}
                                                    className="w-5 h-5 rounded-md border-gray-300 dark:border-slate-700 text-blue-600 dark:bg-slate-700 focus:ring-blue-500 cursor-pointer"
                                                />
                                            </td>
                                        )}
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold text-gray-400 dark:text-gray-500">
                                            {index + 1}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white font-bold">
                                                    {doctor.user.name.charAt(0)}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-bold text-gray-900 dark:text-slate-100">{doctor.user.name}</div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">{doctor.user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-400">
                                                {doctor.specialty.name}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {doctor.tel}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {doctor.nic}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center justify-end gap-2">

                                                <button 
                                                    onClick={() => setDoctorToDelete(doctor.id)}
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
                        {filteredDoctors.length === 0 && (
                            <div className="flex-1 flex flex-col justify-center items-center p-10 text-center text-gray-500 dark:text-gray-400">
                                {searchQuery ? 'No doctors found matching your search.' : 'No doctors found in the system.'}
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile Cards View */}
                <div className="md:hidden flex flex-col gap-4 mt-4">
                    {filteredDoctors.length === 0 ? (
                        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl text-center shadow-sm border border-gray-100 dark:border-slate-700">
                            <p className="text-gray-500 dark:text-gray-400 font-medium">
                                {searchQuery ? 'No doctors found matching your search.' : 'No doctors found in the system.'}
                            </p>
                        </div>
                    ) : (
                        filteredDoctors.map((doctor: any) => (
                            <div 
                                key={`mob-doc-${doctor.id}`}
                                onClick={() => {
                                    if (isBulkMode) {
                                        handleSelect(doctor.id);
                                    } else {
                                        setViewDoctor(doctor);
                                        setShowDoctorModal(true);
                                    }
                                }}
                                className={`bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-4 flex flex-col gap-3 cursor-pointer transition-all ${selectedIds.includes(doctor.id) ? 'bg-blue-50/70 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-slate-700/50'}`}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        {isBulkMode && (
                                            <input 
                                                type="checkbox" 
                                                checked={selectedIds.includes(doctor.id)}
                                                onChange={(e) => { e.stopPropagation(); handleSelect(doctor.id); }}
                                                className="w-5 h-5 rounded border-gray-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                            />
                                        )}
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white font-bold">
                                                {doctor.user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900 dark:text-slate-100 text-base">{doctor.user.name}</h4>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{doctor.user.email}</p>
                                            </div>
                                        </div>
                                    </div>
                                    {!isBulkMode && (
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setDoctorToDelete(doctor.id); }}
                                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-all shrink-0"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                        </button>
                                    )}
                                </div>
                                
                                <div className="flex flex-col gap-2 pt-3 border-t border-gray-100 dark:border-slate-700 mt-1">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500 dark:text-gray-400">Specialty</span>
                                        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-400">
                                            {doctor.specialty.name}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500 dark:text-gray-400">Contact</span>
                                        <span className="text-gray-900 dark:text-slate-100 font-medium">{doctor.tel}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500 dark:text-gray-400">NIC</span>
                                        <span className="text-gray-900 dark:text-slate-100 font-medium">{doctor.nic}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
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

                        <div className="fixed inset-0 overflow-hidden">
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
                                    <Dialog.Panel className="w-full max-w-lg transform overflow-visible rounded-3xl bg-white dark:bg-slate-800 p-8 text-left align-middle shadow-2xl transition-all relative">
                                        <button 
                                            onClick={() => setShowAddModal(false)}
                                            className="absolute top-4 right-4 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                                        >
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                        </button>
                                        
                                        <Dialog.Title as="h3" className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                                            Add New Doctor
                                        </Dialog.Title>
                                        
                                        <form onSubmit={submit} className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Name</label>
                                                <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50 text-gray-700 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/40 transition-all outline-none shadow-sm font-medium" required />
                                                {errors.name && <div className="text-rose-500 dark:text-rose-400 text-sm mt-1">{errors.name}</div>}
                                            </div>
                                            
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Email</label>
                                                <input type="email" value={data.email} onChange={e => setData('email', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50 text-gray-700 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/40 transition-all outline-none shadow-sm font-medium" required />
                                                {errors.email && <div className="text-rose-500 dark:text-rose-400 text-sm mt-1">{errors.email}</div>}
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">NIC</label>
                                                    <input type="text" value={data.nic} onChange={e => setData('nic', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50 text-gray-700 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/40 transition-all outline-none shadow-sm font-medium" required />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Telephone</label>
                                                    <input type="text" value={data.tel} onChange={e => setData('tel', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50 text-gray-700 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/40 transition-all outline-none shadow-sm font-medium" required />
                                                </div>
                                            </div>

                                            <div className="relative z-50">
                                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Specialty</label>
                                                <CustomSelect 
                                                    value={data.specialty_id} 
                                                    onChange={(val: any) => setData('specialty_id', val)} 
                                                    options={specialties.map((s: any) => ({ value: s.id, label: s.name }))}
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50 text-gray-700 dark:text-slate-200 transition-all outline-none shadow-sm font-medium cursor-pointer"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Password</label>
                                                    <input type="password" value={data.password} onChange={e => setData('password', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50 text-gray-700 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/40 transition-all outline-none shadow-sm font-medium" required />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Confirm Password</label>
                                                    <input type="password" value={data.password_confirmation} onChange={e => setData('password_confirmation', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50 text-gray-700 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/40 transition-all outline-none shadow-sm font-medium" required />
                                                </div>
                                            </div>
                                            {errors.password && <div className="text-rose-500 dark:text-rose-400 text-sm mt-1">{errors.password}</div>}

                                            <div className="pt-4 flex justify-end">
                                                <button 
                                                    type="button" 
                                                    onClick={() => setShowAddModal(false)}
                                                    className="mr-3 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg"
                                                >
                                                    Cancel
                                                </button>
                                                <button 
                                                    type="submit" 
                                                    disabled={processing}
                                                    className="w-full sm:w-auto px-5 py-2 bg-gradient-to-r from-teal-500 to-emerald-600 dark:from-teal-600 dark:to-emerald-800 hover:from-teal-600 hover:to-emerald-700 text-white font-bold rounded-xl shadow-md transition-all hover:scale-[1.02] transform-gpu will-change-transform active:scale-95 disabled:opacity-50 text-sm"
                                                >
                                                    Save Doctor
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

            {/* Bulk Delete Confirmation Modal */}
            <Modal show={showBulkCancelModal} onClose={() => setShowBulkCancelModal(false)} maxWidth="sm">
                <div className="p-6 dark:bg-slate-800">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Confirm Deletion</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                        Are you sure you want to delete {selectedIds.length} selected doctor(s)? This action cannot be undone.
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
                            Yes, Delete Doctors
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal show={doctorToDelete !== null} onClose={() => setDoctorToDelete(null)} maxWidth="sm">
                <div className="p-4 sm:p-6 md:p-8 dark:bg-slate-800">
                    <div className="flex items-center justify-center w-16 h-16 mx-auto bg-rose-50 dark:bg-rose-900/30 rounded-2xl mb-6 shadow-inner">
                        <svg className="w-8 h-8 text-rose-500 dark:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-3">Remove Doctor?</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-8 leading-relaxed">
                        Are you sure you want to remove this doctor from the directory? This action cannot be undone and will delete all associated schedules and records.
                    </p>
                    <div className="flex gap-3">
                        <button 
                            onClick={() => setDoctorToDelete(null)}
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

            {/* Doctor History Modal */}
            <AdminDoctorHistoryModal 
                show={showDoctorModal} 
                onClose={() => setShowDoctorModal(false)} 
                doctor={viewDoctor} 
            />
        </SidebarLayout>
    );
}

