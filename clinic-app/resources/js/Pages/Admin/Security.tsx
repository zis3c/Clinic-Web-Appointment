import React, { useState } from 'react';
import { useAutoRefresh } from '@/hooks/useAutoRefresh';
import { Head, usePage } from '@inertiajs/react';
import SidebarLayout from '@/Layouts/SidebarLayout';
import CustomSelect from '@/Components/CustomSelect';

interface SecurityLog {
    id: number;
    ip_address: string | null;
    event_type: string;
    description: string | null;
    payload: any;
    user_id: number | null;
    created_at: string;
}

interface TopIp {
    ip_address: string;
    total: number;
}

interface Props {
    stats: {
        totalFailedLogins: number;
        totalWafBlocks: number;
        todayFailedLogins: number;
        todayWafBlocks: number;
    };
    logs: SecurityLog[];
    topIps: TopIp[];
    auditLogs: any[];
    lockedUsers: any[];
    backups: any[];
}

export default function Security({ stats, logs, topIps, auditLogs = [], lockedUsers = [], backups = [] }: Props) {
    useAutoRefresh(['stats', 'logs', 'topIps', 'auditLogs', 'lockedUsers', 'backups'], { pollingOnly: true });
    const page = usePage();
    const { auth } = page.props as any;
    const csrfToken = (page.props as any).csrf_token as string;
    const [activeTab, setActiveTab] = useState<'threats' | 'audit' | 'lockouts' | 'backups'>('threats');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('all');

    const getEventColor = (type: string) => {
        if (type === 'failed_login') return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
        if (type === 'waf_block') return 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400';
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    };

    const getEventLabel = (type: string) => {
        if (type === 'failed_login') return 'Failed Login';
        if (type === 'waf_block') return 'WAF Block';
        return type;
    };

    return (
        <SidebarLayout 
            user={auth.user}
            header={<h2 className="font-semibold text-2xl text-gray-800 dark:text-slate-100 leading-tight">Security Command Center</h2>}
        >
            <Head title="Security Command Center" />

            {/* Layout Wrapper */}
            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                
                {/* Header Actions */}
                <div className="flex flex-shrink-0 flex-col md:flex-row justify-between items-start md:items-center bg-white dark:bg-slate-800 p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 transition-all gap-4 md:gap-0">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 dark:text-slate-100">Security Dashboard</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Monitor threats, failed logins, and firewall activity.</p>
                    </div>
                </div>

                {/* KPI Metrics */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-shrink-0">
                    {/* Failed Logins */}
                    <div className="group cursor-default">
                        <div className="relative h-full overflow-hidden bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-4 group-hover:shadow-xl group-hover:shadow-amber-500/5 group-hover:-translate-y-1 transform-gpu transition-all duration-300">
                            <div className="absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br from-amber-50 dark:from-amber-900/20 to-transparent rounded-full opacity-50 pointer-events-none"></div>
                            <div className="flex items-center justify-between relative z-10">
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 capitalize tracking-widest mb-1">Failed Logins</p>
                                    <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{stats.totalFailedLogins}</h3>
                                </div>
                                <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 text-white flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300 shadow-md">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                                </div>
                            </div>
                            <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400">
                                <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-0.5">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>
                                    {stats.todayFailedLogins}
                                </span>
                                <span>Today</span>
                            </div>
                        </div>
                    </div>

                    {/* WAF Blocks */}
                    <div className="group cursor-default">
                        <div className="relative h-full overflow-hidden bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-4 group-hover:shadow-xl group-hover:shadow-rose-500/5 group-hover:-translate-y-1 transform-gpu transition-all duration-300">
                            <div className="absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br from-rose-50 dark:from-rose-900/20 to-transparent rounded-full opacity-50 pointer-events-none"></div>
                            <div className="flex items-center justify-between relative z-10">
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 capitalize tracking-widest mb-1">WAF Blocks</p>
                                    <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{stats.totalWafBlocks}</h3>
                                </div>
                                <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-rose-500 to-rose-600 text-white flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300 shadow-md">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                                </div>
                            </div>
                            <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400">
                                <span className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-0.5">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>
                                    {stats.todayWafBlocks}
                                </span>
                                <span>Today</span>
                            </div>
                        </div>
                    </div>

                    {/* Top IPs */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-gray-100 dark:border-slate-700 shadow-sm overflow-y-auto max-h-[140px] custom-scrollbar">
                        <h3 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 capitalize tracking-widest mb-3">Top Attacking IP Addresses</h3>
                        {topIps.length > 0 ? (
                            <div className="space-y-3">
                                {topIps.map((ip, idx) => (
                                    <div key={idx} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></div>
                                            <span className="text-xs font-mono font-semibold text-gray-700 dark:text-gray-300" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{ip.ip_address || 'Unknown'}</span>
                                        </div>
                                        <span className="text-[10px] font-black px-2 py-0.5 bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400 rounded-md">
                                            {ip.total} events
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-16 text-center text-teal-500 dark:text-teal-400/80">
                                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 tracking-widest capitalize">No Active Attackers</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Content Card */}
                <div className="bg-white dark:bg-slate-800 overflow-hidden shadow-sm rounded-2xl border border-gray-100 dark:border-slate-700 relative transition-all flex flex-col">
                    
                    {/* Integrated Header: Tabs & Filters */}
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
                        {/* Tabs */}
                        <div className="grid grid-cols-2 sm:flex sm:flex-row gap-1 sm:space-x-1 bg-gray-50 dark:bg-slate-900/50 p-1 rounded-xl w-full sm:w-fit border border-gray-200 dark:border-slate-700 flex-shrink-0">
                            <button
                                onClick={() => { setActiveTab('threats'); setSearchQuery(''); setFilterType('all'); }}
                                className={`w-full sm:w-auto px-4 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'threats' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800/80'}`}
                            >
                                Threats
                            </button>
                            <button
                                onClick={() => { setActiveTab('audit'); setSearchQuery(''); setFilterType('all'); }}
                                className={`w-full sm:w-auto px-4 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'audit' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800/80'}`}
                            >
                                Audit Logs
                            </button>
                            <button
                                onClick={() => { setActiveTab('lockouts'); setSearchQuery(''); setFilterType('all'); }}
                                className={`w-full sm:w-auto px-4 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'lockouts' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800/80'}`}
                            >
                                Lockouts {lockedUsers.length > 0 && <span className="ml-1 bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{lockedUsers.length}</span>}
                            </button>
                            <button
                                onClick={() => { setActiveTab('backups'); setSearchQuery(''); setFilterType('all'); }}
                                className={`w-full sm:w-auto px-4 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'backups' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800/80'}`}
                            >
                                Backups
                            </button>
                        </div>

                        {/* Filters & Actions Section */}
                        {(activeTab === 'threats' || activeTab === 'audit') && (
                            <div className="flex flex-row flex-wrap sm:flex-nowrap gap-3 items-center w-full xl:w-auto xl:justify-end">
                                <div className="relative flex-grow min-w-[200px] w-full sm:w-64">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                                    </div>
                                    <input
                                        type="text"
                                        className="h-11 w-full pl-10 pr-4 border border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-900/50 text-gray-900 dark:text-white placeholder-gray-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/40 sm:text-sm transition-colors"
                                        placeholder={`Search ${activeTab === 'threats' ? 'IP, desc, or payload' : 'user, action, or target'}...`}
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                {activeTab === 'threats' && (
                                    <div className="flex-1 min-w-[140px] sm:flex-none sm:w-40 z-30">
                                        <CustomSelect
                                            value={filterType}
                                            onChange={(val) => setFilterType(val as string)}
                                            className="h-11 px-4 border border-gray-200 dark:border-slate-700 rounded-xl text-sm transition-all outline-none"
                                            options={[
                                                { value: 'all', label: 'All Events' },
                                                { value: 'failed_login', label: 'Failed Logins' },
                                                { value: 'waf_block', label: 'WAF Blocks' }
                                            ]}
                                        />
                                    </div>
                                )}
                                {activeTab === 'audit' && (
                                    <div className="flex-1 min-w-[140px] sm:flex-none sm:w-40 z-30">
                                        <CustomSelect
                                            value={filterType}
                                            onChange={(val) => setFilterType(val as string)}
                                            className="h-11 px-4 border border-gray-200 dark:border-slate-700 rounded-xl text-sm transition-all outline-none"
                                            options={[
                                                { value: 'all', label: 'All Actions' },
                                                { value: 'created', label: 'Created' },
                                                { value: 'updated', label: 'Updated' },
                                                { value: 'deleted', label: 'Deleted' }
                                            ]}
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                        
                        {activeTab === 'backups' && (
                            <form method="POST" action={route('admin.backups.create')} className="w-full xl:w-auto">
                                <input type="hidden" name="_token" value={csrfToken} />
                                <button type="submit" className="h-11 w-full xl:w-auto bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-5 rounded-xl transition-colors shadow-sm whitespace-nowrap">
                                    Generate Backup
                                </button>
                            </form>
                        )}
                    </div>

                {/* Tab Content: Threats */}
                {activeTab === 'threats' && (
                    <>
                        <div className="absolute top-[68px] right-0 w-[8px] h-[49px] bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 z-20"></div>
                        <div className="overflow-x-auto h-[calc(100vh-420px)] overflow-y-auto custom-scrollbar flex flex-col">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                                <thead className="bg-gray-50/80 dark:bg-slate-800/80 backdrop-blur-md sticky top-0 z-10 ring-1 ring-gray-200 dark:ring-slate-700">
                                    <tr>
                                        <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 dark:text-gray-400 capitalize tracking-wider w-12">#</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 capitalize tracking-wider">Timestamp</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 capitalize tracking-wider">Event Type</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 capitalize tracking-wider">IP Address</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 capitalize tracking-wider">Description / Payload</th>
                                    </tr>
                                </thead>
                            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                                {logs
                                    .filter(log => {
                                        if (filterType !== 'all' && log.event_type !== filterType) return false;
                                        if (!searchQuery) return true;
                                        const q = searchQuery.toLowerCase();
                                        return (log.ip_address?.toLowerCase().includes(q) || 
                                                log.description?.toLowerCase().includes(q) ||
                                                JSON.stringify(log.payload).toLowerCase().includes(q));
                                    })
                                    .map((log, index) => (
                                    <tr key={log.id} className="hover:bg-blue-50 dark:hover:bg-slate-700/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold text-gray-400 dark:text-gray-500">
                                            {index + 1}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(log.created_at).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${getEventColor(log.event_type)}`}>
                                                {getEventLabel(log.event_type)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-mono text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700/50 px-2 py-1 rounded border border-gray-200 dark:border-slate-600" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                                                {log.ip_address || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 max-w-md whitespace-nowrap">
                                            <div className="truncate font-medium">{log.description}</div>
                                            {log.payload && (
                                                <div className="mt-1 text-xs font-mono text-gray-400 dark:text-gray-500 truncate max-w-xs" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                                                    {JSON.stringify(log.payload)}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {logs.filter(log => filterType === 'all' || log.event_type === filterType).length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center justify-center text-center">
                                                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">All Systems Clear</p>
                                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">No security logs recorded yet.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    </>
                )}
                {/* Tab Content: Audit */}
                {activeTab === 'audit' && (
                    <>
                        <div className="overflow-x-auto h-[calc(100vh-420px)] overflow-y-auto custom-scrollbar flex flex-col">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                                <thead className="bg-gray-50/80 dark:bg-slate-800/80 sticky top-0">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Time</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Target</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Changes</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                                    {auditLogs
                                        .filter(log => {
                                            if (filterType !== 'all' && log.action !== filterType) return false;
                                            if (!searchQuery) return true;
                                            const q = searchQuery.toLowerCase();
                                            return (log.user?.name?.toLowerCase().includes(q) ||
                                                    log.action?.toLowerCase().includes(q) ||
                                                    log.model_type?.toLowerCase().includes(q) ||
                                                    JSON.stringify(log.new_values).toLowerCase().includes(q));
                                        })
                                        .map((log) => (
                                        <tr key={log.id}>
                                            <td className="px-6 py-4 text-sm text-gray-500">{new Date(log.created_at).toLocaleString()}</td>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{log.user?.name || 'System'}</td>
                                            <td className="px-6 py-4 text-sm font-bold text-blue-600 uppercase">{log.action}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500 font-mono">{log.model_type.split('\\').pop()} #{log.model_id}</td>
                                            <td className="px-6 py-4 text-xs font-mono text-gray-400 max-w-xs truncate whitespace-nowrap">
                                                {log.new_values ? JSON.stringify(log.new_values) : 'N/A'}
                                            </td>
                                        </tr>
                                    ))}
                                    {auditLogs.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-gray-500">No audit logs found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
                    {/* Tab Content: Lockouts */}
                {activeTab === 'lockouts' && (
                    <>
                        <div className="overflow-y-auto h-[calc(100vh-420px)] custom-scrollbar p-6">
                        {lockedUsers.length > 0 ? (
                            <div className="space-y-4">
                                {lockedUsers.map((u) => (
                                    <div key={u.id} className="flex items-center justify-between p-4 border border-rose-200 bg-rose-50 rounded-xl">
                                        <div>
                                            <p className="font-bold text-gray-900">{u.name} <span className="text-xs text-gray-500 font-normal">({u.email})</span></p>
                                            <p className="text-xs text-rose-600 font-medium">Locked until {new Date(u.locked_until).toLocaleString()}</p>
                                        </div>
                                        <form method="POST" action={route('admin.security.unlock', u.id)}>
                                            <input type="hidden" name="_token" value={csrfToken} />
                                            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors">
                                                Unlock Account
                                            </button>
                                        </form>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-500">
                                <p className="font-semibold">No locked accounts.</p>
                            </div>
                        )}
                        </div>
                    </>
                )}
                    {/* Tab Content: Backups */}
                {activeTab === 'backups' && (
                    <>
                        <div className="overflow-y-auto h-[calc(100vh-420px)] custom-scrollbar p-6">
                        {backups.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {backups.map((b, idx) => (
                                    <div key={idx} className="p-4 border border-gray-100 dark:border-slate-700 rounded-xl hover:shadow-md transition-shadow">
                                        <div className="flex items-start justify-between mb-2">
                                            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"></path></svg>
                                            <a href={route('admin.backups.download', b.name)} className="text-xs font-bold text-blue-600 hover:text-blue-700 underline">Download</a>
                                        </div>
                                        <p className="font-mono text-xs text-gray-700 dark:text-gray-300 truncate" title={b.name}>{b.name}</p>
                                        <div className="mt-3 flex items-center justify-between text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                                            <span>{b.size}</span>
                                            <span>{b.date}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-500 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-gray-200">
                                <p className="font-semibold">No backups available.</p>
                            </div>
                        )}
                        </div>
                    </>
                )}
                </div>
            </div>
        </SidebarLayout>
    );
}
