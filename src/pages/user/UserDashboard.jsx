import React, { useState, useEffect, useMemo } from 'react';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import UserAnalytics from '../../components/user/UserAnalytics';
import { ArrowUpRight, Plus, ShieldCheck, Wallet, GraphUpArrow, X, CheckCircle, ArrowDownLeft, CreditCard2Front, Activity } from 'react-bootstrap-icons';
import { NavLink } from 'react-router-dom';

export default function UserDashboard() {
  const { currentUser, loading: authLoading } = useCurrentUser();
  const [bankData, setBankData] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [showModal, setShowModal] = useState(null);
  const [toast, setToast] = useState(null);
  
  // NEW STATE FOR AI PREDICTION
  const [riskLevel, setRiskLevel] = useState("Analyzing...");
  const [rawLatestRecord, setRawLatestRecord] = useState(null); // Keep the raw data to send to backend

  // 1. FETCH BANK DATA FROM PUBLIC FOLDER
  useEffect(() => {
    fetch('/bankData.json')
      .then((res) => res.json())
      .then((json) => {
        setBankData(json);
        setDataLoading(false);
      })
      .catch((err) => {
        console.error("Error loading bank data:", err);
        setDataLoading(false);
      });
  }, []);

  // 2. FILTER DATA & GET RAW RECORD
  const userData = useMemo(() => {
    if (!currentUser || bankData.length === 0) return null;
    
    const userRecords = bankData.filter(
      (item) => item.Email?.toLowerCase() === currentUser.email?.toLowerCase()
    );

    if (userRecords.length === 0) return null;

    const latestRecord = userRecords[0];
    setRawLatestRecord(latestRecord); // Save this to send to Python

    const uniqueTransactions = [];
    const seenTxnIds = new Set();

    userRecords.forEach(record => {
        const txnId = record["TransactionID"];
        if (txnId && !seenTxnIds.has(txnId)) {
            seenTxnIds.add(txnId);
            uniqueTransactions.push({
                id: txnId,
                type: record["Transaction Type"],
                amount: record["Transaction Amount"],
                date: record["Transaction Date"],
                reason: record["Transaction_Reason"] || record["Transaction Type"]
            });
        }
    });

    uniqueTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

    return {
      fullName: `${latestRecord["First Name"]} ${latestRecord["Last Name"]}`,
      customerId: latestRecord["Customer ID"],
      accountNumber: latestRecord["Account_Number"],
      balance: latestRecord["Account Balance"],
      accountType: latestRecord["Account Type"],
      activeStatus: latestRecord["ActiveStatus"],
      cibil: latestRecord["CIBIL_Score"],
      panCard: latestRecord["PAN_Card"], 
      transactions: uniqueTransactions
    };
  }, [bankData, currentUser]);

  // 3. SEND DATA TO PYTHON BACKEND FOR AI PREDICTION
  useEffect(() => {
    if (rawLatestRecord) {
      // Send the exact row to your FastAPI backend
      fetch("http://localhost:8000/api/predict-risk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rawLatestRecord)
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setRiskLevel(data.predictedRisk);
        } else {
          setRiskLevel("Error calculating");
        }
      })
      .catch(err => {
        console.error("Failed to fetch ML prediction:", err);
        setRiskLevel("Server Offline");
      });
    }
  }, [rawLatestRecord]);

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

  if (authLoading || dataLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 text-slate-400">
        <div className="animate-pulse font-mono tracking-widest uppercase text-sm">Synchronizing Secure Data...</div>
      </div>
    );
  }

  if (!userData) {
    return (
        <div className="p-20 text-center text-slate-500">
            User profile not found in bank records.
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8">
      
      {toast && (
        <div className="fixed top-5 right-5 bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-2xl z-[1000] flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <CheckCircle size={20} />
          <span className="font-medium">{toast.msg}</span>
        </div>
      )}

      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          Hello, {userData.fullName.split(' ')[0]} <span className="animate-bounce">👋</span>
        </h1>
        <p className="text-slate-400 mt-1">Managed via ID: {userData.customerId}</p>
      </div>

      {/* ROW 1: STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        
        {/* BALANCE CARD (Takes 2 columns now) */}
        <div className="lg:col-span-2 bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-2xl shadow-xl shadow-blue-900/20 relative overflow-hidden">
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-blue-100 text-sm font-medium opacity-80">Account Balance</p>
              <h2 className="text-3xl font-bold text-white mt-1">₹{userData.balance.toLocaleString()}</h2>
            </div>
            <Wallet size={24} className="text-blue-200 opacity-50" />
          </div>
          <div className="mt-6 text-blue-100/60 font-mono tracking-widest text-sm relative z-10">
            {userData.accountNumber}
          </div>
          <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
        </div>

        {/* AI RISK PREDICITON CARD (NEW!) */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-purple-400 text-sm font-medium tracking-wider flex items-center gap-2">
                <Activity size={14} className="animate-pulse" /> AI Profile Risk
              </p>
              <h3 className={`text-2xl font-black mt-1 ${
                riskLevel === 'High' ? 'text-rose-500' : riskLevel === 'Low' ? 'text-emerald-400' : 'text-amber-400'
              }`}>
                {riskLevel}
              </h3>
            </div>
          </div>
          <p className="text-slate-500 text-[10px] mt-4 font-mono uppercase tracking-widest relative z-10">Gaussian Navie Bayes</p>
        </div>

        {/* CIBIL SCORE CARD */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-sm font-medium">CIBIL Score</p>
              <h3 className="text-2xl font-bold text-white mt-1">
                {Math.round(userData.cibil)}
              </h3>
            </div>
            <div className="bg-blue-500/10 p-2 rounded-lg text-blue-500">
              <ShieldCheck size={20} />
            </div>
          </div>
          <div className="w-full bg-slate-800 h-1.5 mt-4 rounded-full">
             <div className="bg-blue-500 h-full rounded-full" style={{ width: `${(userData.cibil / 900) * 100}%` }}></div>
          </div>
        </div>

        {/* ACCOUNT STATUS */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <p className="text-slate-400 text-sm font-medium">Account Status</p>
          <h3 className="text-2xl font-bold text-white mt-1">{userData.activeStatus}</h3>
          <span className={`inline-block mt-3 px-3 py-1 rounded-full text-[10px] font-bold ${
            userData.activeStatus === 'Active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
          }`}>
            {userData.activeStatus === 'Active' ? '● Fully Operational' : '● Restricted'}
          </span>
        </div>

      </div>

      {/* ROW 2: MAIN CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COL: ACCOUNT DETAILS */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 font-semibold text-white bg-slate-800/50 uppercase text-[10px] tracking-widest">
              Account Metadata
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Type</span>
                <span className="text-white font-medium">{userData.accountType}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Customer ID</span>
                <span className="text-white font-mono text-xs">{userData.customerId}</span>
              </div>
              
              {/* PAN CARD DISPLAY */}
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm flex items-center gap-2">
                    <CreditCard2Front size={14} /> PAN Number
                </span>
                <span className="text-blue-400 font-mono text-xs tracking-wider font-bold bg-blue-500/10 px-2 py-1 rounded">
                    {userData.panCard}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Primary Branch</span>
                <span className="text-white font-medium text-right">Ahmedabad Central<br/><small className="text-slate-500">Code: GJ13036</small></span>
              </div>
            </div>
          </div>

          <button 
            onClick={() => handleAction('transfer')}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl transition-all shadow-lg shadow-blue-600/20 font-bold"
          >
            <Plus size={24} /> New Transaction
          </button>
        </div>

        {/* RIGHT COL: RECENT TRANSACTIONS */}
        <div className="lg:col-span-2">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
              <span className="font-semibold text-white">Transaction History</span>
              <NavLink to="/user/transactions" className="text-blue-400 text-sm hover:underline">Full Statement</NavLink>
            </div>

            <div className="divide-y divide-slate-800 max-h-[400px] overflow-y-auto custom-scrollbar">
              {userData.transactions.length > 0 ? (
                userData.transactions.slice(0, 1).map((txn, i) => (
                  <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-slate-800/30 transition group">
                    <div className="flex items-center gap-4">
                      <div className={`p-2.5 rounded-xl transition-colors ${
                        txn.type === 'Deposit' ? 'bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500/20' : 'bg-rose-500/10 text-rose-500 group-hover:bg-rose-500/20'
                      }`}>
                        {txn.type === 'Deposit' ? <ArrowDownLeft size={18}/> : <ArrowUpRight size={18}/>}
                      </div>
                      <div>
                        <p className="text-white font-medium leading-tight">{txn.reason || txn.type}</p>
                        <p className="text-slate-500 text-xs mt-1">{txn.date}</p>
                      </div>
                    </div>
                    <div className={`font-mono font-bold ${txn.type === 'Deposit' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {txn.type === 'Deposit' ? '+' : '-'}₹{txn.amount.toLocaleString()}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-10 text-center text-slate-500">No transaction logs available.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ANALYTICS SECTION */}
      <div className="mt-8">
        <UserAnalytics />
      </div>

      {/* MODAL */}
      {showModal === 'transfer' && (
         <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-[999] p-4 animate-in fade-in duration-200">
             <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-8 shadow-2xl animate-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-bold text-white">Transfer</h3>
                    <X className="cursor-pointer text-slate-400 hover:text-white" onClick={closeModal} />
                </div>
                <input type="number" placeholder="Amount" className="w-full p-4 bg-slate-800 border border-slate-700 rounded-xl mb-4 text-white focus:outline-none focus:border-blue-500 transition" />
                <button onClick={() => { closeModal(); showToast("Transfer Sent!", "success"); }} className="w-full bg-blue-600 hover:bg-blue-500 p-4 rounded-xl font-bold text-white transition shadow-lg shadow-blue-900/20">Send Money</button>
             </div>
         </div>
      )}
    </div>
  );
}