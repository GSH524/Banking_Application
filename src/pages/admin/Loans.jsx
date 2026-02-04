import React, { useMemo, useState, useEffect } from 'react';
import { useBankData } from '../../hooks/useBankData';
import { useAdminActions } from '../../hooks/useAdminActions';
import {
  collection, query, where, onSnapshot, doc,
  updateDoc, addDoc, serverTimestamp
} from 'firebase/firestore';
import { userDB } from '../../firebaseUser';
import {
  CashStack,
  CheckCircle,
  XCircle,
  Eye,
  CalendarWeek,
  Person,
  PatchCheck,
  ExclamationTriangle,
  Wallet2,
  ClockHistory
} from 'react-bootstrap-icons';

export default function AdminLoans() {
  const { data, loading: dataLoading } = useBankData();
  const { overrides, updateLoan } = useAdminActions();
  const [pendingLoans, setPendingLoans] = useState([]);
  const [loadingApps, setLoadingApps] = useState(true);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  // Listen for Pending Loan Applications
  useEffect(() => {
    const q = query(
      collection(userDB, 'loanApplications'),
      where('status', '==', 'pending')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const apps = [];
      snapshot.forEach(doc => apps.push({ id: doc.id, ...doc.data() }));
      setPendingLoans(apps);
      setLoadingApps(false);
    });
    return () => unsubscribe();
  }, []);

  const handleApprove = async (loan) => {
    const confirmApprove = window.confirm(`Approve loan of ₹${loan.amount.toLocaleString()} for ${loan.userName}?`);
    if (!confirmApprove) return;

    try {
      const disbursementDays = 3 + Math.floor(Math.random() * 5);

      // 1. Update Application Status
      await updateDoc(doc(userDB, 'loanApplications', loan.id), {
        status: 'approved',
        expectedDisbursementDays: disbursementDays,
        approvedAt: serverTimestamp()
      });

      // 2. Add to Overrides (for long-term tracking)
      updateLoan(loan.userId, 'Approved');

      // 3. Notify User
      await addDoc(collection(userDB, 'notifications'), {
        userId: loan.userId,
        role: 'user',
        type: 'loan',
        message: `Your loan of ₹${loan.amount.toLocaleString()} is approved! Disbursement in ${disbursementDays} days.`,
        read: false,
        redirectTo: '/user/loans',
        createdAt: serverTimestamp()
      });

      setSelectedLoan(null);
    } catch (err) {
      console.error(err);
      alert("Error approving loan: " + err.message);
    }
  };

  const handleReject = async (loan) => {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;

    try {
      await updateDoc(doc(userDB, 'loanApplications', loan.id), {
        status: 'rejected',
        rejectionReason: reason,
        rejectedAt: serverTimestamp()
      });

      updateLoan(loan.userId, 'Rejected');

      await addDoc(collection(userDB, 'notifications'), {
        userId: loan.userId,
        role: 'user',
        type: 'loan',
        message: `Your loan application was rejected: ${reason}`,
        read: false,
        redirectTo: '/user/loans',
        createdAt: serverTimestamp()
      });

      setSelectedLoan(null);
    } catch (err) {
      console.error(err);
      alert("Error rejecting loan");
    }
  };

  const activeLoans = useMemo(() => {
    return data.filter(c => c.raw['Loan Amount'] > 0 || overrides[c.customerId]?.loanStatus === 'Approved').map(item => ({
      ...item,
      loanId: item.raw['Loan ID'],
      loanAmount: item.raw['Loan Amount'],
      loanType: item.raw['Loan Type'],
      status: overrides[item.customerId]?.loanStatus || item.raw['Loan Status'],
      tenure: item.raw['Loan Term'] || 12
    }));
  }, [data, overrides]);

  const totalPages = Math.ceil(activeLoans.length / ITEMS_PER_PAGE);

  // Sync pagination if count changes
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [activeLoans.length, totalPages, currentPage]);

  const paginatedLoans = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return activeLoans.slice(start, start + ITEMS_PER_PAGE);
  }, [activeLoans, currentPage]);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, activeLoans.length);

  if (dataLoading || loadingApps) return <div className="p-10 text-center">Opening Loan Vault...</div>;

  return (
    <main style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '12px', margin: 0 }}>
            <CashStack className="text-emerald-600" /> Loan Management
          </h1>
          <p style={{ color: '#64748b', marginTop: '4px' }}>Analyze applications and monitor portfolio health.</p>
        </div>
        <div style={{ display: 'flex', gap: '24px' }}>
          <div className="stat-badge">
            <span className="label">Awaiting Vetting</span>
            <span className="value text-orange-600">{pendingLoans.length}</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '32px' }}>

        {/* PENDING APPLICATIONS */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>Vetting Queue</h3>
            <span style={{ fontSize: '12px', background: '#fef3c7', color: '#d97706', padding: '4px 8px', borderRadius: '4px', fontWeight: '700' }}>{pendingLoans.length} PENDING</span>
          </div>

          {pendingLoans.length === 0 ? (
            <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8'}}>
              <PatchCheck size={40} style={{ marginBottom: '12px' }} />
              <p>Queue is empty. All caught up!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {pendingLoans.map(loan => (
                <div
                  key={loan.id}
                  onClick={() => setSelectedLoan(loan)}
                  className={`admin-app-card ${selectedLoan?.id === loan.id ? 'active' : ''}`}
                >
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '15px', color: 'black' }}>{loan.userName}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{loan.loanType} • ₹{loan.amount.toLocaleString()}</div>
                  </div>
                  <Eye className="text-blue-500" />
                </div>
              ))}
            </div>
          )}

          {/* DETAIL PANEL */}
          {selectedLoan && (
            <div className="glass-card" style={{ marginTop: '24px', padding: '30px', background: '#f8fafc', border: '1px solid #10b981' }}>
              <h4 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: '800' }}>Application Review</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="info-box"><Person /> <span>{selectedLoan.userName}</span></div>
                <div className="info-box"><CashStack /> <span>₹{selectedLoan.amount.toLocaleString()}</span></div>
                <div className="info-box"><CalendarWeek /> <span>{selectedLoan.tenureMonths} Months</span></div>
                <div className="info-box"><ClockHistory /> <span>Purpose: {selectedLoan.reason}</span></div>
              </div>
              <div style={{ padding: '12px', background: '#ecfdf5', color: 'black', borderRadius: '8px', marginTop: '16px', fontSize: '13px', fontWeight: '600' }}>
                Interest Rate (Proposed): {selectedLoan.loanType === 'Home' ? '8.5%' : selectedLoan.loanType === 'Car' ? '9.2%' : '11.5%'}
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button onClick={() => handleApprove(selectedLoan)} style={{ flex: 1, padding: '10px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>Approve</button>
                <button onClick={() => handleReject(selectedLoan)} style={{ flex: 1, padding: '10px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>Reject</button>
              </div>
            </div>
          )}
        </section>

        {/* ACTIVE LOANS CONTROL */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>Portfolio Inventory</h3>
          </div>

          <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
                <tr>
                  <th className="th">Customer</th>
                  <th className="th">Product</th>
                  <th className="th">Principal</th>
                  <th className="th">Health</th>
                </tr>
              </thead>
              <tbody>
                {paginatedLoans.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="td" style={{ textAlign: 'center', color: '#94a3b8', padding: '40px' }}>No active loans found.</td>
                  </tr>
                ) : (
                  paginatedLoans.map(l => (
                    <tr key={l.customerId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td className="td">
                        <div style={{ fontWeight: '600' }}>{l.fullName}</div>
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>{l.loanId || 'PROV-' + l.customerId.slice(-5)}</div>
                      </td>
                      <td className="td">
                        <span style={{ fontSize: '12px', fontWeight: '600', padding: '4px 8px', borderRadius: '4px', background: '#f1f5f9' }}>{l.loanType}</span>
                      </td>
                      <td className="td">
                        <div style={{ fontWeight: '700' }}>₹{Number(l.loanAmount).toLocaleString()}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>{l.tenure} months</div>
                      </td>
                      <td className="td">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <div style={{
                            width: '8px', height: '8px', borderRadius: '50%',
                            background: l.status === 'Approved' ? '#10b981' : l.status === 'Defaulted' ? '#ef4444' : '#64748b'
                          }}></div>
                          <span style={{ fontSize: '12px', fontWeight: '600', color: l.status === 'Approved' ? '#059669' : '#1e293b' }}>
                            {l.status}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* PAGINATION CONTROLS */}
            <div style={{
              padding: '16px 24px',
              background: '#f8fafc',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              position: 'sticky',
              bottom: 0,
              zIndex: 10
            }}>
              <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>
                Showing <span style={{ color: '#0f172a', fontWeight: '700' }}>{activeLoans.length === 0 ? 0 : startIndex + 1}</span> to <span style={{ color: '#0f172a', fontWeight: '700' }}>{endIndex}</span> of <span style={{ color: '#0f172a', fontWeight: '700' }}>{activeLoans.length}</span> entries
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  disabled={currentPage === 1}
                  onClick={() => { setCurrentPage(1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="p-btn"
                >First</button>
                <button
                  disabled={currentPage === 1}
                  onClick={() => { setCurrentPage(p => p - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="p-btn"
                >Prev</button>

                <div style={{ display: 'flex', gap: '4px', margin: '0 8px' }}>
                  {[...Array(totalPages)].map((_, i) => {
                    const p = i + 1;
                    if (p === 1 || p === totalPages || (p >= currentPage - 1 && p <= currentPage + 1)) {
                      return (
                        <button
                          key={p}
                          onClick={() => { setCurrentPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                          className={`p-number ${currentPage === p ? 'active' : ''}`}
                        >{p}</button>
                      );
                    }
                    if (p === 2 || p === totalPages - 1) {
                      return <span key={p} style={{ color: '#94a3b8', padding: '0 4px' }}>...</span>;
                    }
                    return null;
                  })}
                </div>

                <button
                  disabled={currentPage === totalPages || totalPages === 0}
                  onClick={() => { setCurrentPage(p => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="p-btn"
                >Next</button>
                <button
                  disabled={currentPage === totalPages || totalPages === 0}
                  onClick={() => { setCurrentPage(totalPages); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="p-btn"
                >Last</button>
              </div>
            </div>
          </div>
        </section>
      </div>

      <style>{`
                .p-btn {
                    padding: 8px 14px;
                    border: 1px solid #e2e8f0;
                    background: white;
                    border-radius: 8px;
                    font-size: 13px;
                    font-weight: 600;
                    color: #475569;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .p-btn:hover:not(:disabled) { border-color: #3b82f6; color: #3b82f6; background: #eff6ff; }
                .p-btn:disabled { opacity: 0.5; cursor: not-allowed; }

                .p-number {
                    width: 36px;
                    height: 36px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 1px solid transparent;
                    background: none;
                    border-radius: 8px;
                    font-size: 13px;
                    font-weight: 700;
                    color: #64748b;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .p-number:hover { background: #f1f5f9; color: #0f172a; }
                .p-number.active { background: #3b82f6; color: white; border-color: #3b82f6; }

                .stat-badge {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                }
                .stat-badge .label { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; }
                .stat-badge .value { font-size: 24px; font-weight: 800; }
                
                .admin-app-card {
                    padding: 16px 20px;
                    background: white;
                    border: 1.5px solid #e2e8f0;
                    border-radius: 12px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .admin-app-card:hover { border-color: #3b82f6; background: #f0f7ff; }
                .admin-app-card.active { border-color: #3b82f6; background: #eff6ff; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1); }
                
                .info-box {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 13px;
                    color: #475569;
                    background: white;
                    padding: 8px 12px;
                    border-radius: 6px;
                    border: 1px solid #e2e8f0;
                }
                .th { text-align: left; padding: 12px 16px; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; }
                .td { padding: 16px; font-size: 14px; }
            `}</style>
    </main>
  );
}
