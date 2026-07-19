import React, { useState } from 'react';
import { useAutoRefresh } from '@/hooks/useAutoRefresh';
import SidebarLayout from '@/Layouts/SidebarLayout';
import { Head, useForm, router } from '@inertiajs/react';
import CustomDatePicker from '@/Components/CustomDatePicker';
import Modal from '@/Components/Modal';

export default function Pharmacy({ auth, medications, stats }: { auth: any, medications: any[], stats?: any }) {
    useAutoRefresh(['medications', 'stats'], { pollingOnly: true });
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingMedId, setEditingMedId] = useState<number | null>(null);
    
    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '',
        description: '',
        category: '',
        supplier: '',
        expiry_date: '',
        stock_quantity: 0,
        unit: 'pcs',
        price: 0,
        low_stock_threshold: 10,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditMode && editingMedId) {
            put(route('admin.pharmacy.update', editingMedId), {
                onSuccess: () => {
                    setIsAddModalOpen(false);
                    reset();
                },
            });
        } else {
            post(route('admin.pharmacy.store'), {
                onSuccess: () => {
                    setIsAddModalOpen(false);
                    reset();
                },
            });
        }
    };

    const openAddModal = () => {
        reset();
        setIsEditMode(false);
        setEditingMedId(null);
        setIsAddModalOpen(true);
    };

    const openEditModal = (med: any) => {
        setData({
            name: med.name,
            description: med.description || '',
            category: med.category || '',
            supplier: med.supplier || '',
            expiry_date: med.expiry_date ? med.expiry_date.split('T')[0] : '',
            stock_quantity: med.stock_quantity,
            unit: med.unit,
            price: med.price,
            low_stock_threshold: med.low_stock_threshold,
        });
        setEditingMedId(med.id);
        setIsEditMode(true);
        setIsAddModalOpen(true);
    };

    const deleteMed = (id: number) => {
        if (confirm('Are you sure you want to delete this medication?')) {
            router.delete(route('admin.pharmacy.destroy', id));
        }
    };

    return (
        <SidebarLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Pharmacy Inventory</h2>}
        >
            <Head title="Pharmacy" />

            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 h-full flex flex-col">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white dark:bg-slate-800 p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 transition-colors print:hidden mb-8 gap-4 md:gap-0">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 dark:text-slate-100">Pharmacy Inventory</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Manage medication stock, pricing, and threshold alerts.</p>
                    </div>
                    <button
                        onClick={openAddModal}
                        className="h-11 px-5 flex items-center justify-center gap-2 bg-gradient-to-r from-teal-400 to-blue-600 dark:from-teal-600 dark:to-blue-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all w-full md:w-auto whitespace-nowrap"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                        Add Medication
                    </button>
                </div>

                {/* KPI Metrics */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 flex-shrink-0">
                        {/* Total Items */}
                        <div className="group cursor-default">
                            <div className="relative h-full overflow-hidden bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-4 group-hover:shadow-xl group-hover:shadow-blue-500/5 group-hover:-translate-y-1 transform-gpu transition-all duration-300">
                                <div className="absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br from-blue-50 dark:from-blue-900/20 to-transparent rounded-full opacity-50 pointer-events-none"></div>
                                <div className="flex items-center justify-between relative z-10">
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 capitalize tracking-widest mb-1">Total Items</p>
                                        <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{stats.totalItems}</h3>
                                    </div>
                                    <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-500 to-blue-600 text-white flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300 shadow-md">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Low Stock Alerts */}
                        <div className="group cursor-default">
                            <div className="relative h-full overflow-hidden bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-4 group-hover:shadow-xl group-hover:shadow-red-500/5 group-hover:-translate-y-1 transform-gpu transition-all duration-300">
                                <div className="absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br from-red-50 dark:from-red-900/20 to-transparent rounded-full opacity-50 pointer-events-none"></div>
                                <div className="flex items-center justify-between relative z-10">
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 capitalize tracking-widest mb-1">Low Stock</p>
                                        <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{stats.lowStockCount}</h3>
                                    </div>
                                    <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-red-500 to-rose-600 text-white flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300 shadow-md">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Expiring Soon */}
                        <div className="group cursor-default">
                            <div className="relative h-full overflow-hidden bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-4 group-hover:shadow-xl group-hover:shadow-amber-500/5 group-hover:-translate-y-1 transform-gpu transition-all duration-300">
                                <div className="absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br from-amber-50 dark:from-amber-900/20 to-transparent rounded-full opacity-50 pointer-events-none"></div>
                                <div className="flex items-center justify-between relative z-10">
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 capitalize tracking-widest mb-1">Expiring Soon (30d)</p>
                                        <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{stats.expiringSoonCount}</h3>
                                    </div>
                                    <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 text-white flex items-center justify-center transform group-hover:-rotate-12 transition-transform duration-300 shadow-md">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Inventory Value */}
                        <div className="group cursor-default">
                            <div className="relative h-full overflow-hidden bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-4 group-hover:shadow-xl group-hover:shadow-emerald-500/5 group-hover:-translate-y-1 transform-gpu transition-all duration-300">
                                <div className="absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br from-emerald-50 dark:from-emerald-900/20 to-transparent rounded-full opacity-50 pointer-events-none"></div>
                                <div className="flex items-center justify-between relative z-10">
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 capitalize tracking-widest mb-1">Total Value</p>
                                        <h3 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tight">RM {stats.totalValue.toFixed(2)}</h3>
                                    </div>
                                    <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300 shadow-md">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden flex-1 flex flex-col transition-colors relative">
                    {/* Patch to cover the scrollbar track gap in the header */}
                    <div className="absolute top-0 right-0 w-[8px] h-[49px] bg-gray-50/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-700 z-20"></div>
                    
                    <div className="overflow-x-auto flex-1 h-[calc(100vh-190px)] overflow-y-auto custom-scrollbar flex flex-col">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700 table-fixed">
                            <thead className="bg-gray-50/80 dark:bg-slate-800/80 backdrop-blur-md sticky top-0 z-10 ring-1 ring-gray-200 dark:ring-slate-700">
                                <tr>
                                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 dark:text-gray-400 capitalize tracking-wider w-12">#</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 capitalize tracking-wider whitespace-nowrap align-middle">Medication Name</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 capitalize tracking-wider whitespace-nowrap align-middle">Category</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 capitalize tracking-wider whitespace-nowrap align-middle">Unit</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 capitalize tracking-wider whitespace-nowrap align-middle">Stock Quantity</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 capitalize tracking-wider whitespace-nowrap align-middle">Price (MYR)</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 capitalize tracking-wider whitespace-nowrap align-middle">Expiry Date</th>
                                    <th className="pl-6 pr-10 py-4 text-right text-xs font-bold text-gray-500 dark:text-gray-400 capitalize tracking-wider whitespace-nowrap align-middle">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                                {medications.map((med: any, index: number) => {
                                    const isLowStock = med.stock_quantity <= med.low_stock_threshold;
                                    return (
                                        <tr key={med.id} onClick={() => openEditModal(med)} className="hover:bg-blue-50/50 dark:hover:bg-slate-800/30 transition-colors group cursor-pointer">
                                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold text-gray-400 dark:text-gray-500">
                                                {index + 1}
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{med.name}</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{med.description}</div>
                                            </td>
                                            <td className="py-4 px-6 text-sm whitespace-nowrap">
                                                {med.category ? (
                                                    <span className="px-2.5 py-1 text-xs font-bold bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-lg">
                                                        {med.category}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400 dark:text-gray-600">-</span>
                                                )}
                                            </td>
                                            <td className="py-4 px-6 text-sm font-medium text-gray-600 dark:text-gray-300 whitespace-nowrap">
                                                {med.unit}
                                            </td>
                                            <td className="py-4 px-6 text-sm font-medium whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <span className={isLowStock ? 'text-red-600 dark:text-red-400 font-bold' : 'text-gray-600 dark:text-gray-300'}>
                                                        {med.stock_quantity}
                                                    </span>
                                                    <div className="w-16 h-1.5 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                        <div 
                                                            className={`h-full rounded-full ${isLowStock ? 'bg-red-500' : 'bg-teal-500'}`} 
                                                            style={{ width: `${Math.min(100, (med.stock_quantity / Math.max(1, med.low_stock_threshold * 3)) * 100)}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-sm font-medium text-gray-600 dark:text-gray-300 whitespace-nowrap">
                                                RM {parseFloat(med.price).toFixed(2)}
                                            </td>
                                            <td className="py-4 px-6 text-sm font-medium whitespace-nowrap">
                                                {med.expiry_date ? (
                                                    <span className={`px-2 py-1 text-xs rounded-md font-bold ${
                                                        new Date(med.expiry_date) < new Date() ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                        new Date(med.expiry_date) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                                        'text-gray-600 dark:text-gray-400'
                                                    }`}>
                                                        {med.expiry_date}
                                                    </span>
                                                ) : <span className="text-gray-400 dark:text-gray-600">-</span>}
                                            </td>
                                            <td className="py-4 pl-6 pr-10 text-right">
                                                {isLowStock ? (
                                                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-red-100 dark:bg-red-500/20 text-red-800 dark:text-red-400 border border-red-200 dark:border-red-500/30 animate-pulse">
                                                        Low Stock
                                                    </span>
                                                ) : (
                                                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-teal-100 dark:bg-teal-500/20 text-teal-800 dark:text-teal-400 border border-teal-200 dark:border-teal-500/30">
                                                        In Stock
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                                {medications.length === 0 && (
                                    <tr>
                                        <td colSpan={8} className="py-12 text-center">
                                            <div className="flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                                                <svg className="w-12 h-12 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                                                <p className="font-medium text-lg text-gray-500 dark:text-gray-400">No medications found.</p>
                                                <p className="text-sm mt-1">Click "Add Medication" to start building your inventory.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Add/Edit Medication Modal */}
            <Modal show={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} maxWidth="lg">
                <form onSubmit={submit}>
                    <div className="px-6 pt-6 pb-4 bg-white dark:bg-slate-800">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6" id="modal-title">
                            {isEditMode ? 'Edit Medication' : 'Add New Medication'}
                        </h3>
                        <div className="space-y-5 max-h-[60vh] md:max-h-[65vh] overflow-y-auto custom-scrollbar pr-2 -mr-2">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Medication Name</label>
                                <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} required className="w-full text-sm border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-900/50 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/40 shadow-sm" placeholder="e.g. Amoxicillin 500mg" />
                                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Description (Optional)</label>
                                <textarea value={data.description} onChange={e => setData('description', e.target.value)} className="w-full text-sm border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-900/50 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/40 shadow-sm" rows={2} placeholder="Usage instructions or notes..."></textarea>
                            </div>
                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Category</label>
                                    <input type="text" value={data.category} onChange={e => setData('category', e.target.value)} className="w-full text-sm border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-900/50 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/40 shadow-sm" placeholder="e.g. Antibiotics" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Supplier</label>
                                    <input type="text" value={data.supplier} onChange={e => setData('supplier', e.target.value)} className="w-full text-sm border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-900/50 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/40 shadow-sm" placeholder="e.g. MedSupply Inc" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Expiry Date (Optional)</label>
                                    <CustomDatePicker value={data.expiry_date} onChange={(val: any) => setData('expiry_date', val)} required={false} placeholder="Select expiry date" placement="top" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Unit</label>
                                    <input type="text" value={data.unit} onChange={e => setData('unit', e.target.value)} required className="w-full text-sm border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-900/50 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/40 shadow-sm" placeholder="e.g. tablet, bottle" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Initial Stock</label>
                                    <div className="flex items-center border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500 bg-gray-50 dark:bg-slate-900/50 transition-colors">
                                        <button type="button" onClick={() => setData('stock_quantity', Math.max(0, data.stock_quantity - 1))} className="w-11 h-[38px] flex-shrink-0 flex items-center justify-center bg-gray-50 dark:bg-slate-900/50 text-gray-600 dark:text-gray-400 border-r border-gray-200 dark:border-slate-700 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors font-bold text-lg">-</button>
                                        <input type="number" min="0" value={data.stock_quantity} onChange={e => setData('stock_quantity', e.target.value === '' ? '' as any : Number(e.target.value))} required className="w-full text-center text-sm border-0 bg-transparent dark:text-white focus:ring-0 shadow-none px-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                                        <button type="button" onClick={() => setData('stock_quantity', data.stock_quantity + 1)} className="w-11 h-[38px] flex-shrink-0 flex items-center justify-center bg-gray-50 dark:bg-slate-900/50 text-gray-600 dark:text-gray-400 border-l border-gray-200 dark:border-slate-700 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors font-bold text-lg">+</button>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Price (MYR)</label>
                                    <div className="relative flex items-center">
                                        <span className="absolute left-3 font-bold text-gray-500">RM</span>
                                        <input type="number" step="0.01" min="0" value={data.price} onChange={e => setData('price', e.target.value === '' ? '' as any : Number(e.target.value))} required className="w-full pl-10 text-sm border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-900/50 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/40 shadow-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Low Stock Alert at</label>
                                    <div className="flex items-center border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500 bg-gray-50 dark:bg-slate-900/50 transition-colors">
                                        <button type="button" onClick={() => setData('low_stock_threshold', Math.max(0, data.low_stock_threshold - 1))} className="w-11 h-[38px] flex-shrink-0 flex items-center justify-center bg-gray-50 dark:bg-slate-900/50 text-gray-600 dark:text-gray-400 border-r border-gray-200 dark:border-slate-700 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors font-bold text-lg">-</button>
                                        <input type="number" min="0" value={data.low_stock_threshold} onChange={e => setData('low_stock_threshold', e.target.value === '' ? '' as any : Number(e.target.value))} required className="w-full text-center text-sm border-0 bg-transparent dark:text-white focus:ring-0 shadow-none px-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                                        <button type="button" onClick={() => setData('low_stock_threshold', data.low_stock_threshold + 1)} className="w-11 h-[38px] flex-shrink-0 flex items-center justify-center bg-gray-50 dark:bg-slate-900/50 text-gray-600 dark:text-gray-400 border-l border-gray-200 dark:border-slate-700 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors font-bold text-lg">+</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50/50 dark:bg-slate-800/80 px-6 py-4 flex flex-col sm:flex-row gap-3 border-t border-gray-100 dark:border-slate-700 justify-between items-center">
                        {isEditMode ? (
                            <button type="button" onClick={() => editingMedId && deleteMed(editingMedId)} className="w-full sm:w-auto px-5 py-2 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 font-bold rounded-xl transition-colors active:scale-95 text-sm">
                                Delete
                            </button>
                        ) : (
                            <div></div>
                        )}
                        <div className="flex flex-col sm:flex-row-reverse gap-3 w-full sm:w-auto">
                            <button type="submit" disabled={processing} className="w-full sm:w-auto px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-800 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-md transition-all hover:scale-[1.02] transform-gpu will-change-transform active:scale-95 disabled:opacity-50 text-sm">
                                {isEditMode ? 'Update Medication' : 'Save Medication'}
                            </button>
                            <button type="button" onClick={() => setIsAddModalOpen(false)} className="w-full sm:w-auto px-5 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm hover:scale-[1.02] transform-gpu will-change-transform active:scale-95 text-sm">
                                Cancel
                            </button>
                        </div>
                    </div>
                </form>
            </Modal>
        </SidebarLayout>
    );
}
