import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../../context/AuthContext";
import { userDB } from "../../firebaseUser";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { 
  ArrowLeft, Send, Bank, Person, Hash, 
  CashCoin, CheckCircleFill, ExclamationTriangle, 
  Wallet, ChatDots // Added ChatDots icon for Reason
} from 'react-bootstrap-icons';

export default function TransferMoney() {
  const navigate = useNavigate();
  const { user } = useAuth(); 
  
  const [bankData, setBankData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  // Updated State with TransactionID and Reason
  const [formData, setFormData] = useState({
    transactionId: `TXN${Math.floor(10000000000 + Math.random() * 90000000000)}`,
    receiverAcc: '',
    receiverName: '',
    ifsc: 'VAJR000524',
    amount: '',
    reason: '' // New Field
  });

  useEffect(() => {
    fetch('/bankData.json')
      .then(res => res.json())
      .then(data => setBankData(data))
      .catch(() => setError("Unable to load banking network."));
  }, []);

  const handleAccountChange = (e) => {
    const acc = e.target.value;
    setFormData({ ...formData, receiverAcc: acc });

    if (acc.length > 5) {
      const match = bankData.find(u => String(u.Account_Number) === String(acc));
      if (match) {
        setFormData(prev => ({ ...prev, receiverName: `${match["First Name"]} ${match["Last Name"]}` }));
        setError(null);
      } else {
        setFormData(prev => ({ ...prev, receiverName: '' }));
        setError("Account number not recognized.");
      }
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    setError(null);

    const amount = parseFloat(formData.amount);
    const availableBalance = user?.balance || 0;

    if (amount > availableBalance) {
      setError(`Insufficient Balance. Your available funds: ₹${availableBalance.toLocaleString()}`);
      return;
    }

    if (!formData.receiverName) {
      setError("Please enter a valid receiver account number.");
      return;
    }

    setLoading(true);

    try {
      // Image of the sequence of steps for a bank fund transfer transaction
      await addDoc(collection(userDB, "transfer"), {
        transactionId: formData.transactionId, // Storing custom ID
        senderUid: user.uid,
        senderEmail: user.email,
        senderAccount: user.accountNumber,
        receiverAccount: formData.receiverAcc,
        receiverName: formData.receiverName,
        amount: amount,
        reason: formData.reason, // Storing Reason
        ifsc: formData.ifsc,
        transactionType: "Transfer",
        status: "Success",
        timestamp: serverTimestamp()
      });

      setSuccess(true);
      setTimeout(() => navigate('/user/dashboard'), 3500);
    } catch (err) {
      setError("Gateway Error. Transaction could not be completed.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-center">
        <div className="animate-in zoom-in duration-300">
          <CheckCircleFill size={64} className="text-emerald-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-white">Transfer Success</h2>
          <p className="text-slate-400 mt-2 font-mono">ID: {formData.transactionId}</p>
          <p className="text-slate-500 mt-1">Funds are being settled in the receiver's account.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6 flex flex-col items-center">
      <div className="w-full max-w-lg">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-white mb-8 transition">
          <ArrowLeft /> Back to Dashboard
        </button>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white">Fund Transfer</h1>
            <p className="text-slate-500 text-[10px] font-mono mt-1 tracking-widest">REF: {formData.transactionId}</p>
            <div className="mt-4 p-4 bg-slate-800/50 border border-slate-700 rounded-2xl flex justify-between items-center">
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Available Balance</p>
                <p className="text-xl font-bold text-emerald-400">₹{user?.balance?.toLocaleString()}</p>
              </div>
              <Wallet size={24} className="text-slate-600" />
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 text-xs flex items-center gap-3">
              <ExclamationTriangle size={18} /> {error}
            </div>
          )}

          <form onSubmit={handleTransfer} className="space-y-6">
            {/* Receiver Account */}
            <div>
              <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2">Receiver Account Number</label>
              <div className="relative">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input required type="number" value={formData.receiverAcc} onChange={handleAccountChange} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 pl-12 text-white focus:border-indigo-500 outline-none transition" />
              </div>
            </div>

            {/* Receiver Name */}
            <div>
              <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2">Receiver Name</label>
              <div className="relative">
                <Person className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input readOnly type="text" value={formData.receiverName} placeholder="Verification Required" className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-4 pl-12 text-slate-400 cursor-not-allowed" />
              </div>
            </div>

            {/* Amount */}
            <div>
              <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2">Amount (₹)</label>
              <div className="relative">
                <CashCoin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input required type="number" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 pl-12 text-white focus:border-indigo-500 outline-none transition" />
              </div>
            </div>

            {/* Reason for Transfer */}
            <div>
              <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2">Reason for Transfer</label>
              <div className="relative">
                <ChatDots className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input required type="text" placeholder="e.g. Rent, Gift, Business" value={formData.reason} onChange={(e) => setFormData({...formData, reason: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 pl-12 text-white focus:border-indigo-500 outline-none transition" />
              </div>
            </div>

            <button disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-2xl shadow-xl shadow-indigo-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
              {loading ? "Processing Encryption..." : <><Send /> Authorize Transfer</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}