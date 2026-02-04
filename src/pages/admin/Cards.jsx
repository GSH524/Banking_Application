import React, { useMemo, useState, useEffect } from 'react';
import { useBankData } from '../../hooks/useBankData';
import { useAdminActions } from '../../hooks/useAdminActions';
import {
  collection, query, where, onSnapshot, doc,
  updateDoc, addDoc, serverTimestamp, getDoc, setDoc
} from 'firebase/firestore';
import { userDB } from '../../firebaseUser';
import {
  CreditCard,
  CheckCircle,
  XCircle,
  Eye,
  Briefcase,
  Cash,
  Person,
  PatchCheck,
  ExclamationTriangle,
  ShieldLock
} from 'react-bootstrap-icons';
import { getCardDetailsByType, generateCardNumber, generateCardSecurity } from '../../utils/cardUtils';

export default function AdminCards() {
  const { data, loading: dataLoading } = useBankData();
  const { overrides, toggleCardBlock } = useAdminActions();
  const [pendingApps, setPendingApps] = useState([]);
  const [loadingApps, setLoadingApps] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
    const q = query(
      collection(userDB, 'creditCardApplications'),
      where('status', '==', 'pending')
    );
    const unsubscribe = onSnapshot(q,
      (snapshot) => {
        const apps = [];
        snapshot.forEach(doc => apps.push({ id: doc.id, ...doc.data() }));
        setPendingApps(apps);
        setLoadingApps(false);
      },
      (error) => {
        console.error("Firestore Applications Listener Error:", error);
        setLoadingApps(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleApproveApp = async (app) => {
    const confirmApprove = window.confirm(`Approve ${app.cardType} for ${app.fullName}?`);
    if (!confirmApprove) return;

    try {
      const cardDetails = getCardDetailsByType(app.cardType);
      const newCardNumber = generateCardNumber();
      const { expiry, cvv } = generateCardSecurity();

      // 1. Update Application Status
      await updateDoc(doc(userDB, 'creditCardApplications', app.id), {
        status: 'approved',
        cardId: newCardNumber,
        approvedAt: serverTimestamp()
      });

      // 2. Provision User Card (In user metadata/overrides)
      // Note: In this system, we store card info in the user profile override
      await setDoc(doc(userDB, 'overrides', app.userId), {
        cardId: newCardNumber,
        cardType: app.cardType,
        creditLimit: cardDetails.limit,
        creditBalance: 0,
        minPaymentDue: 0,
        paymentDueDate: 'N/A',
        creditUtilization: 0,
        rewardPoints: 0,
        updatedAt: serverTimestamp()
      }, { merge: true });

      // 3. Notify User
      await addDoc(collection(userDB, 'notifications'), {
        userId: app.userId,
        role: 'user',
        type: 'creditCard',
        message: `Congratulations! Your ${app.cardType} has been approved and activated.`,
        read: false,
        redirectTo: '/user/cards',
        createdAt: serverTimestamp()
      });

      setSelectedApp(null);
    } catch (err) {
      console.error(err);
      alert("Error provisioning card: " + err.message);
    }
  };

  const handleRejectApp = async (app) => {
    const reason = prompt("Enter rejection reason (User will see this):");
    if (!reason) return;

    try {
      await updateDoc(doc(userDB, 'creditCardApplications', app.id), {
        status: 'rejected',
        rejectionReason: reason,
        rejectedAt: serverTimestamp()
      });

      await addDoc(collection(userDB, 'notifications'), {
        userId: app.userId,
        role: 'user',
        type: 'creditCard',
        message: `Your credit card application was rejected: ${reason}`,
        read: false,
        redirectTo: '/user/cards',
        createdAt: serverTimestamp()
      });

      setSelectedApp(null);
    } catch (err) {
      console.error(err);
      alert("Error rejecting application");
    }
  };

  const activeCards = useMemo(() => {
    return data.filter(c => c.raw['Credit Limit'] > 0 || overrides[c.customerId]?.cardId).map(item => ({
      ...item,
      cardId: overrides[item.customerId]?.cardId || item.raw['CardID'],
      cardType: overrides[item.customerId]?.cardType || item.raw['Card Type'],
      isBlocked: overrides[item.customerId]?.cardBlocked || false,
      utilization: overrides[item.customerId]?.creditUtilization || item.raw['Credit Utilization']
    }));
  }, [data, overrides]);

  const totalPages = Math.ceil(activeCards.length / ITEMS_PER_PAGE);

  // Sync pagination if count changes
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [activeCards.length, totalPages, currentPage]);

  const paginatedCards = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return activeCards.slice(start, start + ITEMS_PER_PAGE);
  }, [activeCards, currentPage]);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, activeCards.length);

  if (dataLoading || loadingApps) return <div className="p-10 text-center">Synchronizing Card Vault...</div>;

  return (
    <main style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '12px', margin: 0 }}>
            <CreditCard className="text-blue-600" /> Card Management
          </h1>
          <p style={{ color: '#64748b', marginTop: '4px' }}>Review applications and control active card products.</p>
        </div>
        <div style={{ display: 'flex', gap: '24px' }}>
          <div className="stat-badge">
            <span className="label">Pending</span>
            <span className="value text-amber-600">{pendingApps.length}</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '32px' }}>

        {/* PENDING APPLICATIONS */}
        <section>
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>Incoming Applications</h3>
          {pendingApps.length === 0 ? (
            <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
              <PatchCheck size={40} style={{ marginBottom: '12px' }} />
              <p>Queue is empty. Excellent!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {pendingApps.map(app => (
                <div
                  key={app.id}
                  onClick={() => setSelectedApp(app)}
                  className={`admin-app-card ${selectedApp?.id === app.id ? 'active' : ''}`}
                >
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '15px', color: 'black'}}>{app.fullName}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{app.cardType} • ₹{Number(app.income).toLocaleString()}</div>
                  </div>
                  <Eye className="text-blue-500" />
                </div>
              ))}
            </div>
          )}

          {/* DETAIL PANEL */}
          {selectedApp && (
            <div className="glass-card" style={{ marginTop: '24px', padding: '30px', background: '#beecfdff', border: '1px solid #3b82f6' }}>
              <h4 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: '800' }}>Application Review</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="info-box"><Person /> <span>{selectedApp.fullName}</span></div>
                <div className="info-box"><Briefcase /> <span>{selectedApp.employment}</span></div>
                <div className="info-box"><Cash /> <span>₹{Number(selectedApp.income).toLocaleString()}</span></div>
                <div className="info-box"><ShieldLock /> <span>{selectedApp.pan}</span></div>
              </div>
              <div style={{ padding: '12px', background: '#63abf3ff', color: 'black', borderRadius: '8px', marginTop: '16px', fontSize: '13px', fontWeight: '600' }}>
                Requested: {selectedApp.cardType}
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button onClick={() => handleApproveApp(selectedApp)} style={{ flex: 1, padding: '10px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>Approve</button>
                <button onClick={() => handleRejectApp(selectedApp)} style={{ flex: 1, padding: '10px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>Reject</button>
              </div>
            </div>
          )}
        </section>

        {/* ACTIVE CARDS CONTROL */}
        <section>
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>Inventory Control</h3>
          <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
                <tr>
                  <th className="th">Holder</th>
                  <th className="th">Product</th>
                  <th className="th">Utilization</th>
                  <th className="th">Security</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCards.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="td" style={{ textAlign: 'center', color: '#94a3b8', padding: '40px' }}>No active cards found.</td>
                  </tr>
                ) : (
                  paginatedCards.map(c => (
                    <tr key={c.customerId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td className="td">
                        <div style={{ fontWeight: '600' }}>{c.fullName}</div>
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>{c.cardId}</div>
                      </td>
                      <td className="td">
                        <span style={{ fontSize: '12px', fontWeight: '600', padding: '4px 8px', borderRadius: '4px', background: '#f1f5f9' }}>{c.cardType}</span>
                      </td>
                      <td className="td">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ flex: 1, height: '6px', background: '#e2e8f0', borderRadius: '3px' }}>
                            <div style={{ width: `${(c.utilization || 0) * 100}%`, height: '100%', background: (c.utilization || 0) > 0.8 ? '#ef4444' : '#3b82f6', borderRadius: '3px' }}></div>
                          </div>
                          <span style={{ fontSize: '12px', fontWeight: '600' }}>{Math.round((c.utilization || 0) * 100)}%</span>
                        </div>
                      </td>
                      <td className="td">
                        <button
                          onClick={() => toggleCardBlock(c.customerId, c.isBlocked)}
                          style={{
                            padding: '6px 12px', fontSize: '12px', fontWeight: '700',
                            borderRadius: '6px', cursor: 'pointer', border: 'none',
                            background: c.isBlocked ? '#ecfdf5' : '#fef2f2',
                            color: c.isBlocked ? '#10b981' : '#ef4444'
                          }}
                        >
                          {c.isBlocked ? 'Release' : 'Secure'}
                        </button>
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
                Showing <span style={{ color: '#0f172a', fontWeight: '700' }}>{activeCards.length === 0 ? 0 : startIndex + 1}</span> to <span style={{ color: '#0f172a', fontWeight: '700' }}>{endIndex}</span> of <span style={{ color: '#0f172a', fontWeight: '700' }}>{activeCards.length}</span> entries
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  disabled={currentPage === 1}
                  onClick={() => {
                    setCurrentPage(1);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="p-btn"
                  title="First Page"
                >First</button>
                <button
                  disabled={currentPage === 1}
                  onClick={() => {
                    setCurrentPage(p => p - 1);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="p-btn"
                >Prev</button>

                <div style={{ display: 'flex', gap: '4px', margin: '0 8px' }}>
                  {[...Array(totalPages)].map((_, i) => {
                    const p = i + 1;
                    // Intelligent page numbering (First, Last, and around current)
                    if (p === 1 || p === totalPages || (p >= currentPage - 1 && p <= currentPage + 1)) {
                      return (
                        <button
                          key={p}
                          onClick={() => {
                            setCurrentPage(p);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
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
                  onClick={() => {
                    setCurrentPage(p => p + 1);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="p-btn"
                >Next</button>
                <button
                  disabled={currentPage === totalPages || totalPages === 0}
                  onClick={() => {
                    setCurrentPage(totalPages);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="p-btn"
                  title="Last Page"
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
