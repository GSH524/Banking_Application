import React, { useState, useMemo } from 'react';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { Download, Filter, X, ArrowDownLeft, ArrowUpRight } from 'react-bootstrap-icons';

export default function Transactions() {
  const { currentUser, loading } = useCurrentUser();
  const [filterType, setFilterType] = useState('All');
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [page, setPage] = useState(1);

  // GET REAL TRANSACTIONS
  const allTransactions = useMemo(() => {
    if (!currentUser || !currentUser.transactions) return [];

    return currentUser.transactions.map(t => ({
      ...t,
      description: t.reason || (t.type === 'Credit' ? 'Deposit' : 'Withdrawal'),
      date: new Date(t.date).toLocaleDateString(),
      status: 'Success'
    }));
  }, [currentUser]);

  // FILTER & PAGINATE
  const filteredTxns = useMemo(() => {
    return allTransactions.filter(t => filterType === 'All' || t.type === filterType);
  }, [allTransactions, filterType]);

  const pagedTxns = filteredTxns.slice((page - 1) * 10, page * 10);
  const totalPages = Math.ceil(filteredTxns.length / 10) || 1;

  if (loading || !currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="text-slate-400 animate-pulse font-medium">Loading Ledger...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8">
      
      {/* HEADER & FILTERS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Transaction History</h1>
          <p className="text-slate-400 mt-1">Monitor your incoming and outgoing activity.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={filterType}
              onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
              className="appearance-none bg-slate-900 border border-slate-800 text-slate-300 py-2.5 pl-4 pr-10 rounded-xl focus:outline-none focus:border-blue-500 transition cursor-pointer"
            >
              <option value="All">All Transactions</option>
              <option value="Credit">Credits Only</option>
              <option value="Debit">Debits Only</option>
            </select>
            <Filter className="absolute right-3 top-3.5 text-slate-500 pointer-events-none" size={16} />
          </div>
          
          <button className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-xl transition border border-slate-700">
            <Download size={18} /> <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* CONTENT */}
      {filteredTxns.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-16 text-center">
          <div className="text-6xl mb-4">💸</div>
          <h3 className="text-xl font-bold text-white">No Transactions Yet</h3>
          <p className="text-slate-500 max-w-xs mx-auto mt-2">Your transaction history will appear here once you start using your account.</p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-800/50 border-b border-slate-800">
                  <th className="px-6 py-4 text-slate-400 font-medium text-sm">Date</th>
                  <th className="px-6 py-4 text-slate-400 font-medium text-sm">Description</th>
                  <th className="px-6 py-4 text-slate-400 font-medium text-sm hidden md:table-cell">Ref ID</th>
                  <th className="px-6 py-4 text-slate-400 font-medium text-sm text-right">Amount</th>
                  <th className="px-6 py-4 text-slate-400 font-medium text-sm text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {pagedTxns.map((txn) => (
                  <tr 
                    key={txn.id} 
                    onClick={() => setSelectedTxn(txn)}
                    className="group hover:bg-slate-800/40 transition cursor-pointer"
                  >
                    <td className="px-6 py-4 text-sm text-slate-300 whitespace-nowrap">{txn.date}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          txn.type === 'Credit' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                        }`}>
                          {txn.type === 'Credit' ? <ArrowDownLeft size={14}/> : <ArrowUpRight size={14}/>}
                        </div>
                        <span className="text-white font-medium group-hover:text-blue-400 transition">{txn.description}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 font-mono hidden md:table-cell">{txn.id}</td>
                    <td className={`px-6 py-4 text-right font-bold ${
                      txn.type === 'Credit' ? 'text-emerald-400' : 'text-slate-200'
                    }`}>
                      {txn.type === 'Credit' ? '+' : '-'}₹{txn.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="bg-emerald-500/10 text-emerald-500 text-[10px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-full border border-emerald-500/20">
                        {txn.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div className="px-6 py-4 bg-slate-800/30 border-t border-slate-800 flex items-center justify-between">
            <button 
              disabled={page === 1} 
              onClick={() => setPage(p => p - 1)} 
              className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              Previous
            </button>
            <span className="text-sm text-slate-500">
              Page <span className="text-white">{page}</span> of {totalPages}
            </span>
            <button 
              disabled={page === totalPages} 
              onClick={() => setPage(p => p + 1)} 
              className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {selectedTxn && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-[999] p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
              <h3 className="font-bold text-white">Transaction Details</h3>
              <button onClick={() => setSelectedTxn(null)} className="p-2 text-slate-400 hover:text-white transition">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-8">
              <div className="text-center mb-8">
                <h2 className={`text-4xl font-black mb-2 ${selectedTxn.type === 'Credit' ? 'text-emerald-400' : 'text-white'}`}>
                  {selectedTxn.type === 'Credit' ? '+' : '-'}₹{selectedTxn.amount.toLocaleString()}
                </h2>
                <span className="bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter">
                  {selectedTxn.status}
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <span className="text-slate-500 text-sm">Date</span>
                  <span className="text-white font-medium">{selectedTxn.date}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <span className="text-slate-500 text-sm">Description</span>
                  <span className="text-white font-medium">{selectedTxn.description}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <span className="text-slate-500 text-sm">Reference ID</span>
                  <span className="text-slate-300 font-mono text-xs">{selectedTxn.id}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-slate-500 text-sm font-semibold">Closing Balance</span>
                  <span className="text-blue-400 font-bold">₹{(selectedTxn.balanceAfter || 0).toLocaleString()}</span>
                </div>
              </div>
              
              <button className="w-full mt-8 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-2xl transition-all shadow-lg shadow-blue-900/20 active:scale-[0.98]">
                Download Receipt
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}