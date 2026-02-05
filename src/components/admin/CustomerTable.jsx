import React, { useState } from 'react';
import { Eye, ChevronLeft, ChevronRight, Snow, ShieldExclamation } from 'react-bootstrap-icons';

export default function CustomerTable({ data, onView }) {
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 50;

    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRows = data.slice(indexOfFirstRow, indexOfLastRow);
    const totalPages = Math.ceil(data.length / rowsPerPage);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    if (data.length === 0) {
        return (
            <div className="bg-[#0f1218]/50 border border-white/5 rounded-[2.5rem] p-24 text-center backdrop-blur-xl">
                <div className="w-20 h-20 bg-slate-800/50 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-white/5">
                    <ShieldExclamation size={40} className="text-slate-600" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No Matching Entities</h3>
                <p className="text-sm text-slate-500 max-w-xs mx-auto leading-relaxed">
                    The surveillance filter returned zero results. Please verify your query parameters.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-[#0f1218]/30 backdrop-blur-2xl border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl">
            {/* SCROLLABLE DATA GRID */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white/[0.02] border-b border-white/5">
                            <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Entity ID</th>
                            <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Customer Identity</th>
                            <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Class</th>
                            <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Total Balance</th>
                            <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Risk Profile</th>
                            <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Telemetry</th>
                            <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">Protocol</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.03]">
                        {currentRows.map((customer) => (
                            <tr 
                                key={customer.customerId}
                                className={`group transition-all duration-200 hover:bg-blue-500/[0.03] ${
                                    customer.isHighRisk ? 'bg-rose-500/[0.02]' : ''
                                }`}
                            >
                                <td className="px-6 py-5">
                                    <code className="text-[10px] font-mono font-bold text-slate-500 group-hover:text-blue-400 transition-colors bg-white/5 px-2 py-1 rounded">
                                        {customer.customerId.slice(0, 12)}...
                                    </code>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="text-sm font-bold text-white group-hover:translate-x-1 transition-transform">{customer.fullName}</div>
                                    <div className="text-[10px] text-slate-500 font-medium uppercase tracking-tighter opacity-70">{customer.email}</div>
                                </td>
                                <td className="px-6 py-5">
                                    <span className="text-[10px] font-black text-slate-400 bg-white/5 border border-white/5 px-2 py-0.5 rounded uppercase">
                                        {customer.accountType}
                                    </span>
                                </td>
                                <td className="px-6 py-5 text-sm font-mono font-bold text-white">
                                    <span className="text-blue-500/50 mr-1">₹</span>
                                    {customer.balance.toLocaleString('en-IN')}
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-3">
                                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border ${
                                            customer.riskLevel === 'High' 
                                            ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' 
                                            : customer.riskLevel === 'Medium' 
                                            ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' 
                                            : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                        }`}>
                                            {customer.riskLevel}
                                        </span>
                                        {customer.isFrozen && (
                                            <div className="text-blue-400 animate-pulse" title="Security Freeze Active">
                                                <Snow size={14} />
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-2">
                                        <div className={`h-1 w-1 rounded-full ${customer.activeStatus === 'Active' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-slate-700'}`}></div>
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${customer.activeStatus === 'Active' ? 'text-emerald-500' : 'text-slate-600'}`}>
                                            {customer.activeStatus}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-5 text-right">
                                    <button 
                                        onClick={() => onView(customer)}
                                        className="inline-flex items-center gap-2 bg-white/5 hover:bg-blue-600 text-white text-[10px] font-black px-4 py-2 rounded-xl transition-all border border-white/10 hover:border-blue-500 hover:shadow-[0_0_20px_rgba(37,99,235,0.3)] active:scale-95 uppercase tracking-[0.1em]"
                                    >
                                        <Eye size={14} /> Inspect
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ANALYTICS PAGINATION */}
            <div className="px-8 py-5 bg-white/[0.01] border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex flex-col gap-1">
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">
                        Showing Records <span className="text-white">{indexOfFirstRow + 1}—{Math.min(indexOfLastRow, data.length)}</span>
                    </p>
                    <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                        <div 
                            className="bg-blue-600 h-full transition-all duration-500" 
                            style={{ width: `${(Math.min(indexOfLastRow, data.length) / data.length) * 100}%` }}
                        ></div>
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="w-10 h-10 flex items-center justify-center rounded-xl border border-white/5 text-slate-500 hover:text-white hover:bg-white/10 disabled:opacity-20 transition-all"
                    >
                        <ChevronLeft size={18} />
                    </button>
                    
                    <div className="flex items-center px-4 py-2 bg-white/5 rounded-xl border border-white/5 gap-3">
                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Page</span>
                        <span className="text-sm font-mono font-black text-white">{currentPage}</span>
                        <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">/</span>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{totalPages}</span>
                    </div>

                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="w-10 h-10 flex items-center justify-center rounded-xl border border-white/5 text-slate-500 hover:text-white hover:bg-white/10 disabled:opacity-20 transition-all"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}