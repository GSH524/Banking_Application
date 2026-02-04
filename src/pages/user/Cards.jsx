import React, { useState, useEffect, useMemo } from 'react';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { collection, query, where, onSnapshot, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { userDB } from '../../firebaseUser';
import {
  CreditCard as CardIcon,
  PlusLg,
  ArrowUpRight,
  Wallet2,
  ShieldCheck,
  Lock,
  ClockHistory,
  PieChartFill,
  CheckCircleFill,
  XCircleFill,
  InfoCircle,
  HourglassSplit,
  Check2Circle,
  ChevronDown
} from 'react-bootstrap-icons';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
} from 'recharts';
import CardVisual from '../../components/user/CardVisual';
import CardApplicationForm from '../../components/user/CardApplicationForm';


const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function Cards() {
  const { currentUser } = useCurrentUser();
  const [applications, setApplications] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isBlocked, setIsBlocked] = useState(false);

  const hasCard = !!currentUser?.cardId;

  useEffect(() => {
    if (!currentUser?.uid) return;
    const q = query(
      collection(userDB, 'creditCardApplications'),
      where('userId', '==', currentUser.uid)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const apps = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => (b.createdAt?.toDate?.() || new Date(0)) - (a.createdAt?.toDate?.() || new Date(0)));
      setApplications(apps);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [currentUser]);

  const analytics = useMemo(() => {
    if (!currentUser?.cardTransactions) return null;
    const categories = {};
    currentUser.cardTransactions.forEach(tx => {
      const cat = mapTransactionCategory(tx.reason);
      categories[cat] = (categories[cat] || 0) + tx.amount;
    });
    return {
      pieData: Object.entries(categories).map(([name, value]) => ({ name, value }))
    };
  }, [currentUser]);

  const handleApply = async (data) => {
    try {
      await addDoc(collection(userDB, 'creditCardApplications'), {
        userId: currentUser.uid,
        userEmail: currentUser.email,
        userName: currentUser.fullName,
        ...data,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      setShowForm(false);
    } catch (err) {
      console.error(err);
      alert("Application failed. Please try again.");
    }
  };

  const mapTransactionCategory = (reason) => {
    const r = reason.toLowerCase();
    if (r.includes('amazon') || r.includes('flipkart') || r.includes('shopping')) return 'Shopping';
    if (r.includes('swiggy') || r.includes('zomato') || r.includes('restaurant') || r.includes('food')) return 'Food';
    if (r.includes('uber') || r.includes('ola') || r.includes('fuel') || r.includes('travel')) return 'Travel';
    if (r.includes('netflix') || r.includes('prime') || r.includes('movies')) return 'Entertainment';
    if (r.includes('bill') || r.includes('recharge') || r.includes('electricity')) return 'Bills';
    return 'Others';
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip" style={{ background: 'white', padding: '10px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
          <p className="label" style={{ fontWeight: '700', color: '#1e293b' }}>{`${payload[0].name}: ₹${payload[0].value.toLocaleString()}`}</p>
        </div>
      );
    }
    return null;
  };

  if (loading) return <div className="p-10 text-center text-slate-500">Syncing with secure vault...</div>;

  return (
    <main className="cards-main">
      {/* HEADER */}
      <div className="cards-header">
        <h1>
          <CardIcon /> Credit Portfolios
        </h1>
        <p>Analyze, manage and apply for your credit products.</p>
      </div>

      {!hasCard ? (
        showForm ? (
          <CardApplicationForm
            user={currentUser}
            onSubmit={handleApply}
            onCancel={() => setShowForm(false)}
          />
        ) : (
          <>
            {applications.length > 0 && applications[0].status === 'pending' ? (
              <PendingState app={applications[0]} />
            ) : (
              <EmptyState onApply={() => setShowForm(true)} />
            )}
          </>
        )
      ) : (
        <div className="cards-view-wrapper">
          {/* WELCOME BANNER */}
          <div className="welcome-banner">
            <div>
              <h2>🎊 Welcome to VajraBank Credit Cards</h2>
              <p>Spend Smart, Pay Smart! Your {currentUser.cardType} is now active.</p>
            </div>
            <div className="banner-emoji">🚀</div>
          </div>

          <div className="cards-main-grid">
            {/* LEFT COLUMN: VISUAL & QUICK ACTIONS */}
            <section className="cards-left-col">
              <CardVisual
                type={currentUser.cardType || 'Vajra Classic'}
                number={currentUser.cardId}
                holder={currentUser.fullName}
                expiry="12/28"
                blocked={isBlocked}
              />

              {/* UTILS RING CARD */}
              <div className="glass-card utilization-card">
                <div className="util-ring-wrapper">
                  <svg width="100" height="100" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#f1f5f9" strokeWidth="8" />
                    <circle
                      cx="50" cy="50" r="40" fill="none" stroke={currentUser.creditUtilization > 0.7 ? "#ef4444" : "#3b82f6"}
                      strokeWidth="8" strokeDasharray={`${(currentUser.creditUtilization || 0) * 251.2} 251.2`}
                      strokeLinecap="round" transform="rotate(-90 50 50)"
                      style={{ transition: 'stroke-dasharray 1s ease-out' }}
                    />
                  </svg>
                  <div className="util-ring-text">
                    <span className="util-percentage">{Math.round((currentUser.creditUtilization || 0) * 100)}%</span>
                  </div>
                </div>
                <div className="util-info">
                  <h4 className="util-label">Credit Utilization</h4>
                  <div className="util-amount">₹{(currentUser.creditBalance || 0).toLocaleString()}</div>
                  <p className="util-hint">
                    <CheckCircleFill className="text-emerald-500" /> Available Limit: ₹{((currentUser.creditLimit || 0) - (currentUser.creditBalance || 0)).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* INFORMATION HUB */}
              <div className="card-hub-section">
                <h3 className="section-title">Card Features & Hub</h3>
                <CardAccordion
                  title="Card Benefits & Rewards"
                  icon={<Check2Circle />}
                  content={
                    <ul className="accordion-list">
                      <li><strong>Cashback:</strong> Up to 5% on all online spends.</li>
                      <li><strong>Lounge Access:</strong> {currentUser.cardType === 'Vajra Platinum' ? 'Unlimited International & Domestic.' : '2 Domestic visits per quarter.'}</li>
                      <li><strong>Rewards:</strong> 4X points on every ₹100 spent.</li>
                    </ul>
                  }
                />
                <CardAccordion
                  title="Usage Rules & Safety"
                  icon={<ShieldCheck />}
                  content={
                    <ul className="accordion-list">
                      <li><strong>Billing:</strong> Statement generated on 15th of month.</li>
                      <li><strong>Utilization:</strong> Keep under 30% for score benefits.</li>
                    </ul>
                  }
                />
              </div>

              {/* QUICK ACTIONS */}
              <div className="card-quick-actions">
                <button
                  className="nav-btn-action"
                  onClick={() => setIsBlocked(!isBlocked)}
                  style={{ background: isBlocked ? '#10b981' : '#ef4444' }}
                >
                  {isBlocked ? <ShieldCheck /> : <Lock />} {isBlocked ? 'Unblock' : 'Block Card'}
                </button>
                {/* <button className="nav-btn-action secure-btn">
                  <ArrowUpRight /> Pay Dues
                </button> */}
              </div>

              {/* BILLING INFO */}
              <div className="glass-card billing-card">
                <h4 className="billing-title">
                  <ClockHistory /> Upcoming Statement
                </h4>
                <div className="billing-row">
                  <span className="billing-label">Minimum Due</span>
                  <span className="billing-value">₹{currentUser.minPaymentDue?.toLocaleString()}</span>
                </div>
                <div className="billing-row">
                  <span className="billing-label">Due Date</span>
                  <span className="billing-value danger">{currentUser.paymentDueDate || '25th Oct'}</span>
                </div>
              </div>
            </section>

            {/* RIGHT COLUMN: ANALYTICS & HISTORY */}
            <section className="cards-right-col">
              <div className="glass-card analytics-card">
                <h4 className="analytics-title">
                  <PieChartFill className="text-blue-500" /> Spending Distribution
                </h4>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics?.pieData}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {analytics?.pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="glass-card transaction-history-card">
                <div className="history-header">
                  <h4>Recent Card Swipes</h4>
                  <button className="see-all-btn">See All</button>
                </div>
                <div className="history-list">
                  {(currentUser.cardTransactions || []).length === 0 ? (
                    <div className="empty-history" style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>No transactions recorded.</div>
                  ) : (
                    currentUser.cardTransactions?.map((tx, idx) => (
                      <div key={idx} className="history-item">
                        <div className="history-item-info">
                          <div className="history-item-icon">
                            <Wallet2 />
                          </div>
                          <div className="history-item-details">
                            <div className="tx-reason">{tx.reason}</div>
                            <div className="tx-date">{tx.date}</div>
                          </div>
                        </div>
                        <div className="tx-amount">- ₹{tx.amount.toLocaleString()}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>
      )}
    </main>
  );
}

const EmptyState = ({ onApply }) => (
  <div className="glass-card" style={{ padding: '80px 40px', textAlign: 'center', maxWidth: '600px', margin: '40px auto' }}>
    <div style={{ width: '80px', height: '80px', background: '#dbeafe', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
      <CardIcon size={40} className="text-blue-600" />
    </div>
    <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', marginBottom: '12px' }}>Unlock Premium Benefits</h2>
    <p style={{ color: '#64748b', marginBottom: '32px' }}>Elevate your lifestyle with Vajra Credit Cards.</p>
    <button onClick={onApply} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '16px 40px', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', fontSize: '16px', boxShadow: '0 4px 6px rgba(59, 130, 246, 0.2)' }}>Start Application</button>
  </div>
);

const PendingState = ({ app }) => (
  <div className="glass-card" style={{ padding: '60px 40px', textAlign: 'center', maxWidth: '600px', margin: '40px auto' }}>
    <div style={{ width: '80px', height: '80px', background: '#fef3c7', color: '#f59e0b', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
      <HourglassSplit size={40} className="animate-spin-slow" />
    </div>
    <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '12px', color: '#0f172a' }}>Review in Progress</h2>
    <p style={{ color: '#64748b' }}>Your application for {app.cardType} is being vetted.</p>
    <style>{` .animate-spin-slow { animation: spin 3s linear infinite; } @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } `}</style>
  </div>
);

const CardAccordion = ({ title, icon, content }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="glass-card feature-accordion">
      <button onClick={() => setIsOpen(!isOpen)} className="accordion-trigger">
        <div className="accordion-label">
          {icon} <span>{title}</span>
        </div>
        <ChevronDown className="accordion-chevron" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)' }} />
      </button>
      {isOpen && <div className="accordion-content">{content}</div>}
    </div>
  );
};
