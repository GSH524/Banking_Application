import React, { useState } from 'react';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import UserAnalytics from '../../components/user/UserAnalytics';
import { ArrowUpRight, Plus, Download, ShieldCheck, Wallet, GraphUpArrow, X, CheckCircle } from 'react-bootstrap-icons';

import { NavLink } from 'react-router-dom';

export default function UserDashboard() {
  const { currentUser, loading } = useCurrentUser();
  const [showModal, setShowModal] = useState(null); // 'transfer', 'statement', 'account'
  const [toast, setToast] = useState(null);

  const handleAction = (type) => {
    // Mock success for simple actions
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

  if (loading || !currentUser) return <div className="p-5">Loading your dashboard...</div>;

  return (
    <div className="dashboard-page" style={{ paddingBottom: '40px', position: 'relative' }}>

      {/* TOAST */}
      {toast && (
        <div style={{ position: 'fixed', top: '20px', right: '20px', background: '#10b981', color: 'white', padding: '12px 24px', borderRadius: '8px', zIndex: 1000, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', animation: 'fadeUp 0.3s ease' }}>
          <CheckCircle style={{ marginRight: '8px' }} /> {toast.msg}
        </div>
      )}

      {/* HEADER */}
      <div className="dashboard-header">
        <h1>
          Hello, {currentUser.firstName} <span>👋</span>
        </h1>
        <p>Here is your financial overview.</p>
      </div>

      {/* ROW 1: STATS */}
      <div className="stats-grid">

        {/* BALANCE CARD */}
        <div className="stat-card balance-card">
          <div className="stat-card-header">
            <div>
              <p className="stat-label">Total Balance</p>
              <h2 className="stat-value">₹{currentUser.balance.toLocaleString()}</h2>
            </div>
            <Wallet size={24} className="stat-icon" />
          </div>
          <div className="account-preview">
            **** **** 8892
          </div>
        </div>

        {/* GROWTH CARD */}
        <div className="stat-card growth-card">
          <div className="stat-card-header">
            <div>
              <p className="stat-label">Monthly Interest</p>
              <h3 className="stat-value growth">+₹{Math.round(currentUser.balance * 0.004).toLocaleString()}</h3>
            </div>
            <div className="icon-circle growth">
              <GraphUpArrow />
            </div>
          </div>
          <p className="stat-hint">Projected based on current balance</p>
        </div>

        {/* ACCOUNT STATUS */}
        <div className={`stat-card status-card ${currentUser.accountStatus === 'Active' ? 'active' : 'inactive'}`}>
          <p className="stat-label">Account Status</p>
          <h3 className="stat-value">{currentUser.accountStatus}</h3>
          <span className={`status-badge ${currentUser.accountStatus === 'Active' ? 'success' : 'danger'}`}>
            {currentUser.accountStatus === 'Active' ? 'Fully Operational' : 'Action Required'}
          </span>
        </div>

        {/* KYC STATUS */}
        <div className="stat-card kyc-card">
          <div className="stat-card-header">
            <div>
              <p className="stat-label">KYC Status</p>
              <h3 className="stat-value">{currentUser.kycStatus}</h3>
            </div>
            <div className="icon-circle kyc">
              <ShieldCheck />
            </div>
          </div>
          <p className="stat-hint">Identity Verification</p>
        </div>

      </div>

      {/* ROW 2: ACTIONS & TRANSACTIONS */}
      <div className="dashboard-main-grid">

        {/* LEFT COL: ACTIONS & INFO */}
        <div className="dashboard-left-col">

          {/* ACCOUNT DETAILS */}
          <div className="info-card">
            <div className="card-header">Account Details</div>
            <div className="card-body">
              <div className="info-row">
                <span className="info-label">Account Number</span>
                <span className="info-value">{currentUser.customerId}00892</span>
              </div>
              <div className="info-row">
                <span className="info-label">Account Type</span>
                <span className="info-value">{currentUser.accountType}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Branch</span>
                <span className="info-value">Main Street (IFSC: VJRA001)</span>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COL: RECENT TRANSACTIONS */}
        <div className="info-card">
          <div className="card-header">
            <span>Recent Transactions</span>
            <NavLink to="/user/transactions" className="view-all-link">View All</NavLink>
          </div>

          <div className="transaction-list">
            {currentUser.transactions && currentUser.transactions.length > 0 ? (
              currentUser.transactions.slice(0, 5).map((txn, i) => (
                <div key={i} className="transaction-item">
                  <div className="transaction-info">
                    <div className={`transaction-icon ${txn.type === 'Deposit' ? 'credit' : 'debit'}`}>
                      {txn.type === 'Deposit' ? '↓' : '↑'}
                    </div>
                    <div>
                      <strong className="transaction-reason">{txn.reason || (txn.type === 'Deposit' ? 'Deposit' : 'Withdrawal')}</strong>
                      <small className="transaction-date">{new Date(txn.date).toLocaleDateString()}</small>
                    </div>
                  </div>
                  <div className={`transaction-amount ${txn.type === 'Deposit' ? 'credit' : 'debit'}`}>
                    {txn.type === 'Deposit' ? '+' : '-'}₹{txn.amount.toLocaleString()}
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">No recent transactions found.</div>
            )}
          </div>
        </div>
      </div>

      {/* ANALYTICS SECTION */}
      <UserAnalytics />

      {/* TRANSFER MODAL */}
      {showModal === 'transfer' && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 999 }}>
          <div style={{ background: 'white', padding: '24px', borderRadius: '16px', width: '400px', maxWidth: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h3 style={{ margin: 0 }}>Transfer Money</h3>
              <X size={24} style={{ cursor: 'pointer' }} onClick={closeModal} />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#64748b' }}>Recipient Account</label>
              <input type="text" placeholder="Enter account number" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#64748b' }}>Amount</label>
              <input type="number" placeholder="₹ Enter amount" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
            </div>
            <button onClick={() => { closeModal(); showToast("Transfer Successful!", "success"); }} style={{ width: '100%', background: '#3b82f6', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: '500', cursor: 'pointer' }}>
              Send Securely
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
