import React, { useState, useEffect } from 'react';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { collection, addDoc, query, where, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { userDB } from '../../firebaseUser';
import { Bank, CashCoin, CheckCircle, XCircle, ClockHistory, FileEarmarkText } from 'react-bootstrap-icons';

export default function Loans() {
  const { currentUser, loading } = useCurrentUser();
  const [applications, setApplications] = useState([]);
  const [formData, setFormData] = useState({
    loanType: 'Personal Loan',
    amount: '',
    tenure: '12',
    reason: ''
  });
  const [submitting, setSubmitting] = useState(false);

  // Fetch applications for current user
  useEffect(() => {
    if (!currentUser?.uid) return;

    const q = query(
      collection(userDB, 'loanApplications'),
      where('userId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const apps = [];
      snapshot.forEach((doc) => {
        apps.push({ id: doc.id, ...doc.data() });
      });
      apps.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setApplications(apps);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleApply = async (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.reason) {
      alert("Please fill all fields");
      return;
    }

    setSubmitting(true);
    try {
      await addDoc(collection(userDB, 'loanApplications'), {
        userId: currentUser.uid,
        userEmail: currentUser.email,
        userName: currentUser.displayName,
        loanType: formData.loanType,
        amount: Number(formData.amount),
        tenureMonths: Number(formData.tenure),
        reason: formData.reason,
        status: 'pending',
        createdAt: serverTimestamp()
      });

      await addDoc(collection(userDB, 'notifications'), {
        role: 'admin',
        type: 'loan',
        message: `New loan application from ${currentUser.email}`,
        userId: currentUser.uid,
        read: false,
        redirectTo: '/admin/loans',
        createdAt: serverTimestamp()
      });

      alert("Application submitted successfully!");
      setFormData({ loanType: 'Personal Loan', amount: '', tenure: '12', reason: '' });
    } catch (err) {
      console.error("Error applying for loan:", err);
      alert("Failed to submit application");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 text-slate-400 font-medium animate-pulse">
        Loading Secure Data...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8">
      
      {/* HERO SECTION */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Bank className="text-blue-500" /> Loans & Credit
        </h1>
        <p className="text-slate-400 mt-2 max-w-2xl">
          Manage your financial growth. Apply for a new loan with instant tracking and transparent approval processes.
        </p>
      </div>

      {/* APPLICATIONS LIST */}
      <div className="mb-12">
        <h3 className="text-lg font-semibold text-slate-300 mb-6 flex items-center gap-2">
          <ClockHistory className="text-blue-400" /> My Application History
        </h3>

        {applications.length === 0 ? (
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-10 text-center">
            <p className="text-slate-500 italic">No loan applications found. Start by applying below.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {applications.map(app => (
              <div key={app.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row justify-between gap-4 transition-hover hover:border-slate-700">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      app.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                      app.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                      'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                    }`}>
                      {app.status}
                    </span>
                    <strong className="text-white font-semibold">{app.loanType}</strong>
                  </div>
                  
                  <p className="text-slate-300 text-lg font-medium">
                    ₹{app.amount.toLocaleString()} <span className="text-slate-500 text-sm font-normal mx-2">|</span> 
                    <span className="text-sm font-normal text-slate-400">{app.tenureMonths} Months Tenure</span>
                  </p>

                  {app.status === 'approved' && (
                    <div className="mt-4 flex items-center gap-2 text-emerald-400 text-sm bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/10">
                      <CheckCircle /> Approved! Expected disbursement in {app.expectedDisbursementDays || 2} days.
                    </div>
                  )}
                  {app.status === 'rejected' && (
                    <div className="mt-4 flex items-center gap-2 text-rose-400 text-sm bg-rose-500/5 p-3 rounded-xl border border-rose-500/10">
                      <XCircle /> Rejected: {app.rejectionReason}
                    </div>
                  )}
                </div>

                <div className="md:text-right flex flex-col justify-end">
                  <p className="text-slate-500 text-xs flex items-center md:justify-end gap-1">
                    <FileEarmarkText /> Applied: {app.createdAt?.toDate().toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* NEW APPLICATION FORM */}
      <div className="max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
        <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
          <CashCoin className="text-blue-500" /> Apply for a New Loan
        </h3>

        <form onSubmit={handleApply} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400 ml-1">Loan Type</label>
              <select
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition cursor-pointer"
                value={formData.loanType}
                onChange={(e) => setFormData({ ...formData, loanType: e.target.value })}
              >
                <option value="Personal Loan">Personal Loan</option>
                <option value="Home Loan">Home Loan</option>
                <option value="Education Loan">Education Loan</option>
                <option value="Business Loan">Business Loan</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400 ml-1">Requested Amount (₹)</label>
              <input
                type="number"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                placeholder="Enter amount"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400 ml-1">Tenure (Months)</label>
              <select
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition cursor-pointer"
                value={formData.tenure}
                onChange={(e) => setFormData({ ...formData, tenure: e.target.value })}
              >
                <option value="12">12 Months</option>
                <option value="24">24 Months</option>
                <option value="36">36 Months</option>
                <option value="48">48 Months</option>
                <option value="60">60 Months</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400 ml-1">Reason for Loan</label>
              <input
                type="text"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                placeholder="e.g. Home renovation"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full md:w-auto px-10 py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-900/20 active:scale-[0.98]"
          >
            {submitting ? 'Processing...' : 'Submit Application'}
          </button>
        </form>
      </div>
    </div>
  );
}