import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from "../../context/AuthContext";
import UserAnalytics from '../../components/user/UserAnalytics';
import RecommendationSection from "../../pages/user/Recommendations";
import { 
  ArrowUpRight, Plus, ShieldCheck, Wallet, 
  CheckCircle, ArrowDownLeft, Activity,
  PersonBadge, GeoAlt, Telephone, CalendarEvent, Hash
} from 'react-bootstrap-icons';

// Firebase Imports
import { userDB } from "../../firebaseUser";
import { collection, query, where, onSnapshot } from "firebase/firestore";

export default function UserDashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth(); 
  
  const [bankData, setBankData] = useState([]);
  const [firebaseTxns, setFirebaseTxns] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  // AI Risk Prediction States
  const [riskLevel, setRiskLevel] = useState("Analyzing...");
  const [displayRisk, setDisplayRisk] = useState("Analyzing...");
  const [rawLatestRecord, setRawLatestRecord] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // 1. FETCH STATIC BANK DATA (Legacy Support)
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

  // 2. FETCH REAL-TIME FIREBASE TRANSACTIONS
  useEffect(() => {
    if (!user?.email) return;

    const q = query(
      collection(userDB, "transfer"),
      where("senderEmail", "==", user.email.toLowerCase())
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const txns = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: data.transactionId || doc.id,
          type: "Transfer",
          amount: data.amount,
          date: data.timestamp?.toDate().toLocaleDateString() || new Date().toLocaleDateString(),
          reason: data.reason || "Fund Transfer",
          isFirebase: true 
        };
      });
      setFirebaseTxns(txns);
    });

    return () => unsubscribe();
  }, [user]);

  // 3. MERGED DATA PROCESSING (Legacy JSON + Firebase Auth/Firestore)
  const userData = useMemo(() => {
    if (!user || (bankData.length === 0 && dataLoading)) return null;
    
    // Check if user exists in legacy JSON
    const legacyRecord = bankData.find(
      (item) => item.Email?.toLowerCase() === user.email?.toLowerCase()
    );

    // Merge: Use Legacy JSON if found, otherwise use Firestore data from AuthContext
    const source = legacyRecord || user;

    // Handle Transaction Merging
    const staticTransactions = [];
    if (legacyRecord) {
        bankData.filter(r => r.Email === user.email).forEach(record => {
            staticTransactions.push({
                id: record["TransactionID"],
                type: record["Transaction Type"],
                amount: record["Transaction Amount"],
                date: record["Transaction Date"],
                reason: record["Transaction_Reason"] || record["Transaction Type"]
            });
        });
    }

    const combinedTransactions = [...firebaseTxns, ...staticTransactions.slice(0,1)];
    combinedTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Set raw record for AI Prediction (only if legacy data exists for the model)
    if (legacyRecord && (!rawLatestRecord || rawLatestRecord["Customer ID"] !== legacyRecord["Customer ID"])) {
        setRawLatestRecord(legacyRecord);
    }

    return {
      firstName: source.firstName || source["First Name"] || "User",
      lastName: source.lastName || source["Last Name"] || "",
      fullName: source.displayName || `${source["First Name"]} ${source["Last Name"]}`,
      age: source.age || source["Age"] || "N/A",
      gender: source.gender || source["Gender"] || "N/A",
      address: source.address || source["Address"] || "Update your address",
      contact: source.mobile || source["Contact Number"] || "N/A",
      email: source.email || source["Email"],
      dateOpened: source.dateOpened || source["Date Of Account Opening"] || "Recent",
      branchId: source.branchId || source["Branch ID"] || "VAJRA-Main",
      ifsc: "VAJR000524",
      customerId: source.uid || source["Customer ID"],
      accountNumber: source.accountNumber || source["Account_Number"] || "Pending KYC",
      balance: source.balance !== undefined ? source.balance : source["Account Balance"],
      accountType: source.accountType || source["Account Type"] || "Savings",
      status: source.status || source["ActiveStatus"] || "Active",
      cibil: source.cibil || source["CIBIL_Score"] || 750,
      panCard: source.idProofNumber || source["PAN_Card"] || "N/A",
      profilePic: source.profilePic || null, // For Base64 images from Firestore
      transactions: combinedTransactions
    };
  }, [bankData, user, firebaseTxns, dataLoading]);

  // 4. AI RISK LOGIC (Keep existing)
  useEffect(() => {
    if (rawLatestRecord) {
      setIsAnalyzing(true);
      fetch("http://localhost:8000/api/predict-risk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rawLatestRecord)
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) setRiskLevel(data.predictedRisk);
        else setRiskLevel("Low"); // Default for new users
      })
      .catch(() => setRiskLevel("Offline"));

      const timer = setTimeout(() => setIsAnalyzing(false), 3000);
      return () => clearTimeout(timer);
    } else if (user) {
        setRiskLevel("Safe"); // New users start with a clean slate
        setIsAnalyzing(false);
    }
  }, [rawLatestRecord, user]);

  useEffect(() => {
    if (!isAnalyzing) setDisplayRisk(riskLevel);
    else setDisplayRisk("Analyzing...");
  }, [isAnalyzing, riskLevel]);

  if (authLoading || dataLoading || !userData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 text-slate-400">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-indigo-500"></div>
          <p className="animate-pulse font-mono text-xs uppercase tracking-widest">Synchronizing Vault...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8">
      
      {/* HEADER WITH PROFILE PIC SUPPORT */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
            {userData.profilePic ? (
                <img src={userData.profilePic} alt="Profile" className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-500/50 shadow-lg shadow-indigo-500/20" />
            ) : (
                <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-2xl">
                    {userData.firstName[0]}
                </div>
            )}
            <div>
                <h1 className="text-3xl font-bold text-white uppercase tracking-tight">
                    Hello, {userData.firstName}
                </h1>
                <p className="text-slate-500 font-mono text-sm tracking-widest">ID: {userData.customerId}</p>
            </div>
        </div>
        <div className="flex gap-3">
             <button onClick={() => navigate('/user/transfer')} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl transition-all font-bold text-sm shadow-lg">
                <Plus size={20} /> Transfer
            </button>
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="lg:col-span-2 bg-gradient-to-br from-indigo-600 to-blue-700 p-6 rounded-[2rem] shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-indigo-100/70 text-xs font-bold uppercase tracking-widest">Total Balance</p>
            <h2 className="text-4xl font-black text-white mt-2">₹{userData.balance?.toLocaleString()}</h2>
            <p className="mt-4 text-white/50 font-mono text-xs tracking-widest">{userData.accountNumber}</p>
          </div>
          <Wallet size={100} className="absolute -bottom-6 -right-6 text-white/10" />
        </div>

        <div className="bg-slate-900 border border-white/5 p-6 rounded-[2rem]">
          <p className="text-purple-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
            <Activity className={isAnalyzing ? "animate-spin" : ""} size={14} /> Risk Profile
          </p>
          <h3 className={`text-2xl font-black mt-2 ${displayRisk === 'High' ? 'text-rose-500' : 'text-emerald-400'}`}>
            {displayRisk}
          </h3>
          <p className="text-[10px] text-slate-500 mt-2 uppercase font-bold tracking-tighter">AI Analysis Active</p>
        </div>

        <div className="bg-slate-900 border border-white/5 p-6 rounded-[2rem]">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Trust Score</p>
          <h3 className="text-2xl font-black text-white mt-2">{Math.round(userData.cibil)}</h3>
          <div className="w-full bg-slate-800 h-1 mt-4 rounded-full">
            <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${(userData.cibil / 900) * 100}%` }}></div>
          </div>
        </div>

        <div className="bg-slate-900 border border-white/5 p-6 rounded-[2rem] flex flex-col items-center justify-center">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Status</p>
          <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-black rounded-full uppercase tracking-widest border border-emerald-500/20">
            {userData.status}
          </span>
          <ShieldCheck size={24} className="mt-3 text-emerald-500 opacity-50" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Details */}
        <div className="lg:col-span-1">
          <div className="bg-slate-900 border border-white/5 rounded-[2rem] p-6">
            <h4 className="text-white font-bold mb-6 uppercase text-[10px] tracking-[0.2em] opacity-40 flex items-center gap-2">
              <PersonBadge size={14}/> Verified Credentials
            </h4>
            <div className="space-y-4 text-xs">
              <div className="flex justify-between border-b border-white/5 pb-2"><span className="text-slate-500 uppercase">Age / Gender</span><span className="text-white font-bold">{userData.age} / {userData.gender}</span></div>
              <div className="flex flex-col border-b border-white/5 pb-2 gap-1"><span className="text-slate-500 uppercase flex items-center gap-1"><GeoAlt size={10}/> Location</span><span className="text-white leading-relaxed">{userData.address}</span></div>
              <div className="flex justify-between border-b border-white/5 pb-2"><span className="text-slate-500 uppercase">Phone</span><span className="text-white">{userData.contact}</span></div>
              <div className="flex justify-between border-b border-white/5 pb-2"><span className="text-slate-500 uppercase">Account Type</span><span className="text-white">{userData.accountType}</span></div>
              <div className="flex justify-between border-b border-white/5 pb-2"><span className="text-slate-500 uppercase">PAN / ID</span><span className="text-indigo-400 font-mono font-bold">{userData.panCard}</span></div>
              <div className="flex justify-between border-b border-white/5 pb-2"><span className="text-slate-500 uppercase">IFSC</span><span className="text-white font-mono">{userData.ifsc}</span></div>
              <div className="flex justify-between pt-1"><span className="text-slate-500 uppercase">Member Since</span><span className="text-white">{userData.dateOpened}</span></div>
            </div>
          </div>
        </div>

        {/* Transactions */}
        <div className="lg:col-span-2">
          <div className="bg-slate-900 border border-white/5 rounded-[2rem] overflow-hidden">
            <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-white/5">
              <span className="font-black text-white uppercase text-xs tracking-widest">Recent Activity</span>
              <NavLink to="/user/transactions" className="text-indigo-400 text-[10px] hover:underline uppercase font-bold tracking-widest">Statements</NavLink>
            </div>
            <div className="divide-y divide-white/5 max-h-[400px] overflow-y-auto custom-scrollbar">
              {userData.transactions.length > 0 ? (
                userData.transactions.map((txn, i) => (
                  <div key={i} className="px-8 py-5 flex items-center justify-between hover:bg-white/5 transition">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${txn.type === 'Deposit' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                        {txn.type === 'Deposit' ? <ArrowDownLeft size={20}/> : <ArrowUpRight size={20}/>}
                      </div>
                      <div>
                        <p className="text-white text-sm font-bold">{txn.reason}</p>
                        <p className="text-slate-500 text-[10px] mt-0.5 uppercase tracking-tighter">{txn.date} {txn.isFirebase && "• Secure"}</p>
                      </div>
                    </div>
                    <div className={`font-mono font-bold text-sm ${txn.type === 'Deposit' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {txn.type === 'Deposit' ? '+' : '-'}₹{txn.amount?.toLocaleString()}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-20 text-center text-slate-600 font-mono text-xs uppercase tracking-widest">No transaction history detected</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <RecommendationSection riskLevel={displayRisk} />
      </div>

      <div className="mt-8">
        <UserAnalytics />
      </div>
    </div>
  );
}