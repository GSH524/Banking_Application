import React, { useState, useEffect, useMemo } from 'react';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import UserAnalytics from '../../components/user/UserAnalytics';
import {
  ArrowUpRight, Plus, ShieldCheck, Wallet, Activity, X, CheckCircle,
  ArrowDownLeft, CreditCard2Front, Gem, PieChart, CashStack,
  ArrowRightCircle, LightningCharge
} from 'react-bootstrap-icons';
import { NavLink } from 'react-router-dom';

export default function UserDashboard() {
  const { currentUser, loading: authLoading } = useCurrentUser();
  const [bankData, setBankData] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [showModal, setShowModal] = useState(null);
  const [toast, setToast] = useState(null);

  const [riskLevel, setRiskLevel] = useState("Analyzing...");
  const [rawLatestRecord, setRawLatestRecord] = useState(null);

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
  const handleApplyProduct = (productName) => {
    showToast(`Initializing secure application for ${productName}...`, "info");

    // Industrial Simulation: 1.5s delay for "Bank Verification"
    setTimeout(() => {
      const refId = Math.random().toString(36).substr(2, 9).toUpperCase();
      const successMsg = `Success! Application ${refId} submitted. Your request is under review. Your digital product will be generated and activated within 24 hours.`;

      setToast({ msg: successMsg, type: "success" });
      setShowModal(null); // Close modal on success
    }, 1500);
  };

  const handleDownloadBrochure = (product) => {
    const content = `
=========================================
OFFICIAL PRODUCT BROCHURE: ${product.title}
=========================================
Category: ${product.category}
Analysis: Pre-approved for ${userData?.fullName}

KEY BENEFITS (Notebook Verified):
${product.features.map(f => `• ${f}`).join('\n')}

TECHNICAL DATA:
${Object.entries(product.details).map(([k, v]) => `${k}: ${v}`).join('\n')}

ESTIMATED ACTIVATION: 24 Hours
=========================================`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${product.title.replace(/\s+/g, '_')}_Brochure.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  const userData = useMemo(() => {
    if (!currentUser || bankData.length === 0) return null;

    const userRecords = bankData.filter(
      (item) => item.Email?.toLowerCase() === currentUser.email?.toLowerCase()
    );

    if (userRecords.length === 0) return null;

    const latestRecord = userRecords[0];
    setRawLatestRecord(latestRecord);

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

    // LOGIC FROM NOTEBOOKS: SEGMENTATION
    const income = latestRecord["Account Balance"] * 0.12; // Estimating annual income for recommendation logic
    const segment = latestRecord["CIBIL_Score"] > 750 ? "High Value Customer" : "Mid Value Customer";

    return {
      fullName: `${latestRecord["First Name"]} ${latestRecord["Last Name"]}`,
      customerId: latestRecord["Customer ID"],
      accountNumber: latestRecord["Account_Number"],
      balance: latestRecord["Account Balance"],
      accountType: latestRecord["Account Type"],
      activeStatus: latestRecord["ActiveStatus"],
      cibil: latestRecord["CIBIL_Score"],
      panCard: latestRecord["PAN_Card"],
      transactions: uniqueTransactions,
      income: income,
      segment: segment
    };
  }, [bankData, currentUser]);

  // INDUSTRY LEVEL RECOMMENDATION ENGINE (BASED ON NOTEBOOKS)
  const recommendations = useMemo(() => {
    if (!userData) return [];

    const isHighValue = userData.segment === "High Value Customer";
    const recs = [];

    // CREDIT CARD (From Credit_card.ipynb)
    recs.push(isHighValue ? {
      title: "Premium Travel Card",
      category: "Credit Card",
      benefit: "Lounge Access & Air Miles",
      features: ["Complimentary airport lounge access", "Air miles on travel bookings", "Travel insurance", "Luxury hotel discounts", "Concierge services"],
      details: { "Monthly Limit": "₹3,00,000", "Annual Fee": "₹4,999", "Min Income": "₹8,00,000" },
      icon: <CreditCard2Front className="text-amber-400" />,
      color: "from-amber-500/20 to-orange-500/5",
      border: "border-amber-500/30"
    } : {
      title: "Smart Cashback Card",
      category: "Credit Card",
      benefit: "5% Cashback on Groceries",
      features: ["5% cashback on groceries", "2% cashback on fuel", "1% cashback on all other spends", "Annual fee waiver on ₹1.5L spend"],
      details: { "Monthly Limit": "₹75,000", "Annual Fee": "₹499", "Min Income": "₹3,00,000" },
      icon: <CreditCard2Front className="text-blue-400" />,
      color: "from-blue-500/20 to-indigo-500/5",
      border: "border-blue-500/30"
    });

    // SIP (From sips.ipynb)
    recs.push(isHighValue ? {
      title: "Wealth Maximizer SIP",
      category: "SIP Investment",
      benefit: "Expected 12% – 14% Returns",
      features: ["Accelerated wealth creation", "Strong compounding impact", "Inflation-beating potential", "Focus: Equity / Mid / Flexi-cap"],
      details: { "Range": "₹25,000 – ₹50,000", "15Yr Corpus": "₹1.4Cr – ₹1.7Cr" },
      icon: <LightningCharge className="text-purple-400" />,
      color: "from-purple-500/20 to-fuchsia-500/5",
      border: "border-purple-500/30"
    } : {
      title: "Balanced Growth SIP",
      category: "SIP Investment",
      benefit: "Expected 10% – 12% Returns",
      features: ["Balanced growth & stability", "Lower volatility vs equity-only", "Disciplined investing habit", "Focus: Hybrid / Large Cap"],
      details: { "Range": "₹5,000 – ₹10,000", "15Yr Corpus": "₹38L – ₹45L" },
      icon: <LightningCharge className="text-emerald-400" />,
      color: "from-emerald-500/20 to-teal-500/5",
      border: "border-emerald-500/30"
    });

    // MUTUAL FUND (From funds .ipynb)
    recs.push({
      title: isHighValue ? "Equity Growth Fund" : "Balanced Hybrid Fund",
      category: "Mutual Fund",
      benefit: isHighValue ? "14.2% Annual Return" : "10.5% Annual Return",
      features: isHighValue ?
        ["High long-term wealth potential", "Professionally managed portfolio", "SIP option available"] :
        ["Balanced risk and return", "Lower volatility", "Diversification across debt"],
      details: { "Last 1Y Return": isHighValue ? "14.2%" : "10.5%", "Min Investment": "₹5,000" },
      icon: <PieChart className="text-rose-400" />,
      color: "from-rose-500/20 to-orange-500/5",
      border: "border-rose-500/30"
    });

    return recs;
  }, [userData]);

  useEffect(() => {
    if (rawLatestRecord) {
      fetch("http://localhost:8000/api/predict-risk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rawLatestRecord)
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) setRiskLevel(data.predictedRisk);
          else setRiskLevel("Error calculating");
        })
        .catch(err => {
          console.error("Failed to fetch ML prediction:", err);
          setRiskLevel("Server Offline");
        });
    }
  }, [rawLatestRecord]);

  const handleAction = (type) => {
    if (type === 'ACCOUNT_REQ') showToast("New Account Request submitted.", "success");
    else setShowModal(type);
  };

  const showToast = (msg, type) => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const closeModal = () => setShowModal(null);

  // --- CRITICAL RECTIFICATION: ADD THIS BEFORE YOUR RETURN STATEMENT ---
  if (authLoading || dataLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 text-slate-400">
        <div className="animate-pulse font-mono tracking-widest uppercase text-sm">Synchronizing Secure Data...</div>
      </div>
    );
  }

  // Second Guard: If loading is finished but no user was found in the JSON
  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 text-slate-400">
        <div className="text-center">
          <p className="text-xl font-bold text-white mb-2">User Record Not Found</p>
          <p>Please check if your email matches the bank database.</p>
        </div>
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
      {/* HEADER RECTIFIED */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            {/* Use ?. and provide a fallback string */}
            Hello, {userData?.fullName?.split(' ')[0] || 'User'} <span className="animate-bounce">👋</span>
          </h1>
          <p className="text-slate-400 mt-1">
            Managed via ID: {userData?.customerId || 'N/A'} • {userData?.segment || 'Standard'}
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-900/50 p-2 rounded-2xl border border-slate-800">
          <div className="px-4 py-2 text-center">
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Segment</p>
            <p className="text-sm font-bold text-blue-400">{userData.segment.split(' ')[0]}</p>
          </div>
          <div className="w-px h-8 bg-slate-800"></div>
          <div className="px-4 py-2 text-center">
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Security</p>
            <p className="text-sm font-bold text-emerald-400">Verified</p>
          </div>
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="lg:col-span-2 bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-3xl shadow-xl shadow-blue-900/20 relative overflow-hidden">
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-blue-100 text-sm font-medium opacity-80">Available Balance</p>
              <h2 className="text-4xl font-black text-white mt-1">₹{userData.balance.toLocaleString()}</h2>
            </div>
            <Wallet size={28} className="text-blue-200 opacity-50" />
          </div>
          <div className="mt-8 flex justify-between items-center relative z-10">
            <span className="text-blue-100/60 font-mono tracking-widest text-sm">{userData.accountNumber}</span>
            <div className="bg-white/10 px-3 py-1 rounded-lg text-[10px] text-white font-bold backdrop-blur-md border border-white/10">VISA PLATINUM</div>
          </div>
          <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl relative overflow-hidden group">
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-purple-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                <Activity size={14} className="animate-pulse" /> AI Profile Risk
              </p>
              <h3 className={`text-2xl font-black mt-2 ${riskLevel === 'High' ? 'text-rose-500' : riskLevel === 'Low' ? 'text-emerald-400' : 'text-amber-400'
                }`}>
                {riskLevel}
              </h3>
            </div>
          </div>
          <p className="text-slate-500 text-[9px] mt-6 font-mono uppercase tracking-widest">ML: Gaussian Naive Bayes</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-sm font-medium">CIBIL Score</p>
              <h3 className="text-3xl font-bold text-white mt-1">{Math.round(userData.cibil)}</h3>
            </div>
            <ShieldCheck size={24} className="text-blue-500" />
          </div>
          <div className="w-full bg-slate-800 h-2 mt-6 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-full transition-all duration-1000" style={{ width: `${(userData.cibil / 900) * 100}%` }}></div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
          <p className="text-slate-400 text-sm font-medium">Account Status</p>
          <h3 className="text-2xl font-bold text-white mt-1">{userData.activeStatus}</h3>
          <span className={`inline-flex items-center gap-2 mt-4 px-3 py-1 rounded-full text-[10px] font-bold ${userData.activeStatus === 'Active' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
            }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
            {userData.activeStatus === 'Active' ? 'OPERATIONAL' : 'RESTRICTED'}
          </span>
        </div>
      </div>

      {/* 1. UPDATED RECOMMENDATION CARDS (Add onClick) */}
      <div className="mb-10">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Gem className="text-amber-400" /> Personalized For You
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recommendations.map((rec, idx) => (
            <div
              key={idx}
              onClick={() => setShowModal({ type: 'recommendation', data: rec })}
              className={`relative p-6 rounded-3xl border ${rec.border} bg-gradient-to-br ${rec.color} group cursor-pointer hover:scale-[1.02] transition-all`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-slate-950/50 rounded-2xl border border-white/5">
                  {rec.icon}
                </div>
                <ArrowRightCircle size={20} className="text-slate-500 group-hover:text-white transition-colors" />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{rec.category}</p>
              <h4 className="text-xl font-bold text-white mb-2">{rec.title}</h4>
              <p className="text-sm text-slate-400">{rec.benefit}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 2. ADD THIS NEW MODAL LOGIC (Place near your other modals) */}
      {showModal?.type === 'recommendation' && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-xl flex items-center justify-center z-[999] p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl border-t-blue-500/30 border-t-4">

            {/* Product Hero */}
            <div className={`p-8 bg-gradient-to-br ${showModal.data.color}`}>
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">{showModal.data.category}</span>
                  <h3 className="text-3xl font-black text-white mt-1 italic uppercase tracking-tighter">{showModal.data.title}</h3>
                </div>
                <X className="cursor-pointer text-white/50 hover:text-white" onClick={closeModal} size={28} />
              </div>
            </div>

            <div className="p-8 space-y-6">
              {/* Notebook Data Grid */}
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(showModal.data.details).map(([key, val]) => (
                  <div key={key} className="bg-slate-800/40 p-4 rounded-2xl border border-white/5">
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">{key}</p>
                    <p className="text-md font-bold text-blue-400">{val}</p>
                  </div>
                ))}
              </div>

              {/* Benefits List */}
              <div className="space-y-3">
                <p className="text-[10px] text-slate-500 font-bold uppercase">Notebook Verified Benefits</p>
                {showModal.data.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-slate-300">
                    <CheckCircle size={16} className="text-emerald-500" /> {f}
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex gap-4">
                <button
                  onClick={() => handleApplyProduct(showModal.data.title)}
                  className="flex-[2] bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-black uppercase text-xs transition-all shadow-lg shadow-blue-500/20"
                >
                  Apply Now
                </button>
                <button
                  onClick={() => handleDownloadBrochure(showModal.data)}
                  className="flex-1 border border-slate-700 text-white py-4 rounded-2xl font-black uppercase text-xs hover:bg-slate-800 transition-all"
                >
                  Brochure
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 font-bold text-slate-500 uppercase text-[10px] tracking-widest bg-slate-800/20">
              Identity & Profile
            </div>
            <div className="p-6 space-y-5">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Account Type</span>
                <span className="text-white font-semibold bg-slate-800 px-3 py-1 rounded-lg text-xs">{userData.accountType}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm flex items-center gap-2"><CreditCard2Front size={14} /> PAN Number</span>
                <span className="text-blue-400 font-mono text-xs font-bold bg-blue-500/10 px-2 py-1 rounded">{userData.panCard}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Primary Branch</span>
                <div className="text-right">
                  <p className="text-white text-xs font-bold leading-none">Ahmedabad Central</p>
                  <p className="text-[10px] text-slate-500 mt-1 font-mono">IFSC: UTIB000123</p>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => handleAction('transfer')}
            className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-500 text-white py-5 rounded-3xl transition-all shadow-xl shadow-blue-600/20 font-black uppercase tracking-widest text-sm"
          >
            <Plus size={24} /> New Transaction
          </button>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center">
              <span className="font-bold text-white uppercase tracking-widest text-[10px]">Recent Activity</span>
              <NavLink to="/user/transactions" className="text-blue-400 text-[10px] font-black hover:underline">VIEW ALL</NavLink>
            </div>
            <div className="divide-y divide-slate-800/50">
              {/* UPDATED: Showing only the most recent transaction */}
              {userData?.transactions?.slice(0, 1).map((txn, i) => (
                <div key={i} className="px-6 py-8 flex items-center justify-between hover:bg-slate-800/30 transition-colors">
                  <div className="flex items-center gap-5">
                    <div className={`p-4 rounded-2xl ${txn.type === 'Deposit' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                      {txn.type === 'Deposit' ? <ArrowDownLeft size={24} /> : <ArrowUpRight size={24} />}
                    </div>
                    <div>
                      <p className="text-white font-black text-sm uppercase">{txn.reason}</p>
                      <p className="text-slate-500 text-[10px] mt-1 font-mono">{txn.date} • ID: {txn.id}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-xl font-black font-mono ${txn.type === 'Deposit' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {txn.type === 'Deposit' ? '+' : '-'} ₹{txn.amount.toLocaleString()}
                    </div>
                    <p className="text-[9px] text-slate-600 font-bold uppercase mt-1">Settled</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <UserAnalytics />
      </div>

      {/* MODAL (UNCHANGED LOGIC) */}
      {
        showModal === 'transfer' && (
          <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center z-[999] p-4 animate-in fade-in duration-300">
            <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] w-full max-w-md p-10 shadow-2xl animate-in zoom-in slide-in-from-bottom-10 duration-300">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-3xl font-black text-white italic">SEND MONEY</h3>
                <div className="p-2 hover:bg-slate-800 rounded-full cursor-pointer transition" onClick={closeModal}>
                  <X size={24} className="text-slate-400 hover:text-white" />
                </div>
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase ml-2">Amount (INR)</label>
                  <input type="number" placeholder="0.00" className="w-full p-5 bg-slate-800/50 border border-slate-700 rounded-2xl text-white text-2xl font-black focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition shadow-inner" />
                </div>
                <button onClick={() => { closeModal(); showToast("Transaction Successful!", "success"); }} className="w-full bg-blue-600 hover:bg-blue-500 p-5 rounded-2xl font-black text-white transition-all transform active:scale-95 shadow-lg shadow-blue-900/40 tracking-widest">CONFIRM & SEND</button>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
}