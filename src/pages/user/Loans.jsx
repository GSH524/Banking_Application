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
      // Sort by date (desc)
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
      // 1. Create Loan Application
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

      // 2. Create Admin Notification
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

  if (loading || !currentUser) return <div className="p-10 text-center">Loading Secure Data...</div>;

  return (
    <div className="loans-main">
      <div className="loans-hero">
        <h1><Bank className="mb-1" /> Loans & Credit</h1>
        <p style={{color:"white"}}>Manage your loans or apply for a new one with instant approval tracking.</p>
      </div>

      {/* RENDER ACTIVE/HISTORY APPLICATIONS */}
      <h3 className="section-title-loans"><ClockHistory /> My Applications</h3>
      {applications.length === 0 ? (
        <div className="loans-empty-state">
          <p className="empty-loan-text">No loan applications found. Start by applying below.</p>
        </div>
      ) : (
        <div className="apps-container">
          {applications.map(app => (
            <div key={app.id} className="loan-app-card">
              <div className="app-main-info">
                <div className="app-header-row">
                  <span className={`status-badge ${app.status}`}>
                    {app.status}
                  </span>
                  <strong className="app-type-pill">{app.loanType}</strong>
                </div>
                <p className="app-details-text">
                  Amount: ₹{app.amount.toLocaleString()} | Tenure: {app.tenureMonths} Months
                </p>
                {app.status === 'approved' && (
                  <p className="app-feedback-msg success">
                    <CheckCircle className="me-2" /> Approved! Expected disbursement in {app.expectedDisbursementDays || 2} days.
                  </p>
                )}
                {app.status === 'rejected' && (
                  <p className="app-feedback-msg error">
                    <XCircle className="me-2" /> Rejected: {app.rejectionReason}
                  </p>
                )}
              </div>
              <div className="app-meta-info">
                <p className="app-date">
                  <FileEarmarkText className="me-1" /> Applied on: {app.createdAt?.toDate().toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* NEW APPLICATION FORM */}
      <div className="loan-form-card">
        <h3><CashCoin className="text-blue-600 mb-1" /> Apply for a New Loan</h3>

        <form onSubmit={handleApply}>
          <div className="loan-input-grid">
            <div className="loan-field">
              <label className="loan-label">Loan Type</label>
              <select
                className="loan-select"
                value={formData.loanType}
                onChange={(e) => setFormData({ ...formData, loanType: e.target.value })}
              >
                <option value="Personal Loan">Personal Loan</option>
                <option value="Home Loan">Home Loan</option>
                <option value="Education Loan">Education Loan</option>
                <option value="Business Loan">Business Loan</option>
              </select>
            </div>
            <div className="loan-field">
              <label className="loan-label">Requested Amount (₹)</label>
              <input
                type="number"
                className="loan-input"
                placeholder="Enter amount"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
              />
            </div>
            <div className="loan-field">
              <label className="loan-label">Tenure (Months)</label>
              <select
                className="loan-select"
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
            <div className="loan-field">
              <label className="loan-label">Reason for Loan</label>
              <input
                type="text"
                className="loan-input"
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
            className="loan-submit-btn"
          >
            {submitting ? 'Submitting...' : 'Submit Application'}
          </button>
        </form>
      </div>
    </div>
  );
}
