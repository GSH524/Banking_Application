import React, { useMemo } from 'react';
import { useBankData } from '../../hooks/useBankData';
import { useAdminActions } from '../../hooks/useAdminActions';

export default function Accounts() {
  const { data, loading } = useBankData();
  const { overrides, toggleFreeze } = useAdminActions();

  const processedData = useMemo(() => {
    return data.slice(0, 100).map(item => {
      const override = overrides[item.customerId];
      return { ...item, isFrozen: override?.isFrozen ?? item.isFrozen };
    });
  }, [data, overrides]);

  if (loading) return (
    <div className="min-h-screen bg-[#0a0c10] flex items-center justify-center">
       <div className="text-blue-500 font-mono animate-pulse uppercase tracking-[0.3em]">Syncing Ledger...</div>
    </div>
  );

  return (
    // Explicit background color to ensure no "blending"
    <div className="min-h-screen bg-[#0a0c10] text-slate-100 p-4 md:p-10">
      
      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase">
            Account <span className="text-blue-600">Terminal</span>
          </h1>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Status: Surveillance Active</p>
        </div>
        <div className="bg-[#161b22] border border-white/10 px-6 py-3 rounded-2xl shadow-xl">
          <span className="text-[10px] font-black text-slate-500 uppercase block tracking-widest mb-1">Active Nodes</span>
          <span className="text-xl font-mono text-blue-500 font-bold">{processedData.length}</span>
        </div>
      </div>

      {/* Table with forced background and hover effects */}
      <div className="rounded-[2rem] border border-white/10 bg-[#0f1218] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.03] border-b border-white/10">
                <th className="px-8 py-6 text-[11px] font-black uppercase text-slate-400 tracking-widest">Account Identity</th>
                <th className="px-8 py-6 text-[11px] font-black uppercase text-slate-400 tracking-widest">Balance</th>
                <th className="px-8 py-6 text-[11px] font-black uppercase text-slate-400 tracking-widest text-center">Status</th>
                <th className="px-8 py-6 text-[11px] font-black uppercase text-slate-400 tracking-widest text-right">Action Protocol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {processedData.map((acc) => (
                <tr 
                  key={acc.customerId} 
                  // HOVER EFFECT: Changes background and adds a subtle blue left border
                  className="group hover:bg-blue-600/[0.04] transition-all duration-200 cursor-default border-l-4 border-l-transparent hover:border-l-blue-600"
                >
                  <td className="px-8 py-5">
                    <div className="font-bold text-white text-base group-hover:text-blue-400 transition-colors">
                      {acc.fullName}
                    </div>
                    <div className="text-[10px] font-mono text-slate-500 mt-0.5 tracking-tighter">
                      ID-{acc.customerId.toUpperCase()}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="font-mono text-sm text-emerald-400 font-bold">
                      ₹{acc.balance.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                      acc.isFrozen 
                      ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' 
                      : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                    }`}>
                      {acc.isFrozen ? 'Locked' : 'Active'}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button
                      onClick={() => toggleFreeze(acc.customerId, acc.isFrozen)}
                      // DYNAMIC BUTTON COLORS
                      className={`
                        px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg
                        ${acc.isFrozen 
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20' 
                          : 'bg-white/5 text-rose-500 border border-white/10 hover:bg-rose-600 hover:text-white hover:border-rose-600'}
                      `}
                    >
                      {acc.isFrozen ? 'Release' : 'Freeze'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}