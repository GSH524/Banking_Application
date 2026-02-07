import React, { useState } from 'react';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import UserAnalytics from '../../components/user/UserAnalytics';
import { ArrowUpRight, Plus, Download, ShieldCheck, Wallet, GraphUpArrow, X, CheckCircle, ArrowDownLeft } from 'react-bootstrap-icons';
import { NavLink } from 'react-router-dom';

export default function UserDashboard() {
  const { currentUser, loading } = useCurrentUser();
  const [showModal, setShowModal] = useState(null); 
  const [toast, setToast] = useState(null);

  const handleAction = (type) => {
    if (type === 'ACCOUNT_REQ') {
      showToast("New Account Request submitted to Admin.", "success");
    } else {
      setShowModal(type);
    }
  };

  const showToast = (msg, type) => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const closeModal = () => setShowModal(null);

  if (loading || !currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 text-slate-400">
        <div className="animate-pulse">Loading your dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8">
      
      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className="fixed top-5 right-5 bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-2xl z-[1000] flex items-center gap-3 animate-bounce">
          <CheckCircle size={20} />
          <span className="font-medium">{toast.msg}</span>
        </div>
      )}

      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          Hello, {currentUser.firstName} <span className="animate-bounce">👋</span>
        </h1>
        <p className="text-slate-400 mt-1">Here is your financial overview.</p>
      </div>

      {/* ROW 1: STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        {/* BALANCE CARD */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-2xl shadow-xl shadow-blue-900/20 relative overflow-hidden">
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-blue-100 text-sm font-medium opacity-80">Total Balance</p>
              <h2 className="text-3xl font-bold text-white mt-1">₹{currentUser.balance.toLocaleString()}</h2>
            </div>
            <Wallet size={24} className="text-blue-200 opacity-50" />
          </div>
          <div className="mt-6 text-blue-100/60 font-mono tracking-widest text-sm relative z-10">
            **** **** 8892
          </div>
          {/* Decorative circle */}
          <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
        </div>

        {/* GROWTH CARD */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-sm font-medium">Monthly Interest</p>
              <h3 className="text-2xl font-bold text-emerald-400 mt-1">
                +₹{Math.round(currentUser.balance * 0.004).toLocaleString()}
              </h3>
            </div>
            <div className="bg-emerald-500/10 p-2 rounded-lg text-emerald-500">
              <GraphUpArrow size={20} />
            </div>
          </div>
          <p className="text-slate-500 text-xs mt-4 italic">Projected based on current balance</p>
        </div>

        {/* ACCOUNT STATUS */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <p className="text-slate-400 text-sm font-medium">Account Status</p>
          <h3 className="text-2xl font-bold text-white mt-1">{currentUser.accountStatus}</h3>
          <span className={`inline-block mt-3 px-3 py-1 rounded-full text-xs font-bold ${
            currentUser.accountStatus === 'Active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
          }`}>
            {currentUser.accountStatus === 'Active' ? '● Fully Operational' : '● Action Required'}
          </span>
        </div>

        {/* KYC STATUS */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-sm font-medium">KYC Status</p>
              <h3 className="text-2xl font-bold text-white mt-1">{currentUser.kycStatus}</h3>
            </div>
            <div className="bg-amber-500/10 p-2 rounded-lg text-amber-500">
              <ShieldCheck size={20} />
            </div>
          </div>
          <p className="text-slate-500 text-xs mt-4">Identity Verification</p>
        </div>
      </div>

      {/* ROW 2: MAIN CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COL: ACCOUNT DETAILS */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 font-semibold text-white bg-slate-800/50">
              Account Details
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Account Number</span>
                <span className="text-white font-medium">{currentUser.customerId}00892</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Account Type</span>
                <span className="text-white font-medium">{currentUser.accountType}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Branch</span>
                <span className="text-white font-medium text-right">Main Street<br/><small className="text-slate-500 underline decoration-blue-500/50">IFSC: VJRA001</small></span>
              </div>
            </div>
          </div>

          <button 
            onClick={() => handleAction('transfer')}
            className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white py-4 rounded-2xl transition-all border border-slate-700 group"
          >
            <Plus className="group-hover:rotate-90 transition-transform" /> Quick Money Transfer
          </button>
        </div>

        {/* RIGHT COL: RECENT TRANSACTIONS */}
        <div className="lg:col-span-2">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
              <span className="font-semibold text-white">Recent Transactions</span>
              <NavLink to="/user/transactions" className="text-blue-400 text-sm hover:underline">View All</NavLink>
            </div>

            <div className="divide-y divide-slate-800">
              {currentUser.transactions && currentUser.transactions.length > 0 ? (
                currentUser.transactions.slice(0, 5).map((txn, i) => (
                  <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-slate-800/30 transition">
                    <div className="flex items-center gap-4">
                      <div className={`p-2.5 rounded-xl ${
                        txn.type === 'Deposit' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                      }`}>
                        {txn.type === 'Deposit' ? <ArrowDownLeft size={18}/> : <ArrowUpRight size={18}/>}
                      </div>
                      <div>
                        <p className="text-white font-medium leading-tight">
                          {txn.reason || (txn.type === 'Deposit' ? 'Deposit' : 'Withdrawal')}
                        </p>
                        <p className="text-slate-500 text-xs mt-1">{new Date(txn.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className={`font-bold ${txn.type === 'Deposit' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {txn.type === 'Deposit' ? '+' : '-'}₹{txn.amount.toLocaleString()}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-10 text-center text-slate-500">No recent transactions found.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ANALYTICS SECTION */}
      <div className="mt-8">
        <UserAnalytics />
      </div>

      {/* TRANSFER MODAL */}
      {showModal === 'transfer' && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-[999] p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-8 shadow-2xl animate-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-2xl font-bold text-white">Transfer Money</h3>
                <p className="text-slate-400 text-sm">Send funds instantly to any account.</p>
              </div>
              <button 
                onClick={closeModal}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2 ml-1">Recipient Account</label>
                <input 
                  type="text" 
                  placeholder="Enter account number" 
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2 ml-1">Amount</label>
                <div className="relative">
                   <span className="absolute left-4 top-3.5 text-slate-400 font-medium">₹</span>
                   <input 
                    type="number" 
                    placeholder="0.00" 
                    className="w-full pl-8 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                  />
                </div>
              </div>
              <button 
                onClick={() => { closeModal(); showToast("Transfer Successful!", "success"); }} 
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-95 mt-4"
              >
                Confirm Transfer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}