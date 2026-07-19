import React from 'react';
import SidebarLayout from '@/Layouts/SidebarLayout';
import { Head, Link } from '@inertiajs/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function PatientEMR({ auth, patient }: any) {
    // Format vitals data for the chart
    const vitalsData = patient.vitals.map((v: any) => ({
        date: new Date(v.created_at).toLocaleDateString(),
        sys: v.blood_pressure ? parseInt(v.blood_pressure.split('/')[0]) : null,
        dia: v.blood_pressure ? parseInt(v.blood_pressure.split('/')[1]) : null,
        heart_rate: v.heart_rate,
        weight: parseFloat(v.weight),
    })).reverse(); // Oldest first for chart timeline

    return (
        <SidebarLayout
            user={auth.user}
        >
            <Head title={`EMR: ${patient.user.name}`} />
            
            <div className="py-6 mb-4 flex justify-between items-center max-w-7xl mx-auto sm:px-6 lg:px-8">
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">Patient EMR: {patient.user.name}</h2>
                <Link href={route('doctor.patients.index')} className="text-blue-600 hover:underline">
                    &larr; Back to Patients
                </Link>
            </div>

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900">{patient.user.name}</h3>
                            <p className="text-gray-500">DOB: {new Date(patient.date_of_birth).toLocaleDateString()} | Gender: {patient.gender}</p>
                            <p className="text-gray-500">Contact: {patient.contact_number}</p>
                        </div>
                    </div>

                    {/* Vitals Charts */}
                    {vitalsData.length > 0 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-slate-900 rounded-lg shadow-lg p-6">
                                <h4 className="text-xl font-bold text-white mb-4">Blood Pressure Trends</h4>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={vitalsData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                            <XAxis dataKey="date" stroke="#94a3b8" />
                                            <YAxis stroke="#94a3b8" domain={['auto', 'auto']} />
                                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: '#fff' }} />
                                            <Legend />
                                            <Line type="monotone" dataKey="sys" name="Systolic" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} />
                                            <Line type="monotone" dataKey="dia" name="Diastolic" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                            
                            <div className="bg-slate-900 rounded-lg shadow-lg p-6">
                                <h4 className="text-xl font-bold text-white mb-4">Heart Rate & Weight</h4>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={vitalsData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                            <XAxis dataKey="date" stroke="#94a3b8" />
                                            <YAxis yAxisId="left" stroke="#94a3b8" domain={['auto', 'auto']} />
                                            <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" domain={['auto', 'auto']} />
                                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: '#fff' }} />
                                            <Legend />
                                            <Line yAxisId="left" type="monotone" dataKey="heart_rate" name="Heart Rate (bpm)" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                                            <Line yAxisId="right" type="monotone" dataKey="weight" name="Weight (kg)" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 text-center text-gray-500">
                            No vitals recorded for this patient yet.
                        </div>
                    )}

                    {/* Vitals History Table */}
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <h4 className="text-xl font-bold text-gray-900">Vitals History</h4>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50/80 dark:bg-slate-800/80 backdrop-blur-md sticky top-0 z-10 ring-1 ring-gray-200 dark:ring-slate-700">
                                    <tr>
                                        <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 dark:text-gray-400 capitalize tracking-wider w-12">#</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 capitalize tracking-wider">Date</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 capitalize tracking-wider">BP</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 capitalize tracking-wider">HR</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 capitalize tracking-wider">Temp (°C)</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 capitalize tracking-wider">Weight (kg)</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {patient.vitals.map((v: any, index: number) => (
                                        <tr key={v.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold text-gray-400">{index + 1}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{new Date(v.created_at).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{v.blood_pressure || '-'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{v.heart_rate || '-'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{v.temperature || '-'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{v.weight || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Prescription History */}
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <h4 className="text-xl font-bold text-gray-900">Consultation & Prescription History</h4>
                        </div>
                        <div className="divide-y divide-gray-200">
                            {patient.appointments.map((apt: any) => (
                                <div key={apt.id} className="p-6">
                                    <div className="flex justify-between items-center mb-2">
                                        <h5 className="font-bold text-lg text-gray-900">Dr. {apt.schedule.doctor.user.name}</h5>
                                        <span className="text-sm text-gray-500">{new Date(apt.date).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-sm text-gray-700 mb-4"><span className="font-bold">Diagnosis:</span> {apt.diagnosis || 'None'}</p>
                                    
                                    {apt.pharmacy_prescriptions && apt.pharmacy_prescriptions.length > 0 ? (
                                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                            <h6 className="font-bold text-sm text-gray-700 mb-2">Prescribed Medications:</h6>
                                            <ul className="list-disc pl-5 space-y-1">
                                                {apt.pharmacy_prescriptions.map((rx: any) => (
                                                    <li key={rx.id} className="text-sm text-gray-600">
                                                        <span className="font-bold">{rx.medication.name}</span> - {rx.dosage} ({rx.frequency}) for {rx.duration_days} days. Dispensed: {rx.quantity_dispensed} {rx.medication.unit}
                                                        {rx.instructions && <span className="block text-xs text-gray-500 italic mt-0.5">Note: {rx.instructions}</span>}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500 italic">No structured prescriptions for this consultation.</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </SidebarLayout>
    );
}
