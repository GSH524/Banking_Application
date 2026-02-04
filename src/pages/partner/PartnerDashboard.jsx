import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { collection, query, where, getDocs } from "firebase/firestore";
import { userDB } from "../../firebaseUser";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
    AreaChart, Area, ScatterChart, Scatter
} from 'recharts';


// Chart Theme
const CHART_THEME = {
    grid: 'rgba(255, 255, 255, 0.05)',
    text: '#94a3b8',
};

const ACCT_COLORS = ['#f59e0b', '#3b82f6', '#ef4444'];
const LOAN_STATUS_COLORS = { Approved: '#10b981', Closed: '#3b82f6', Rejected: '#ef4444' };
const CHANNEL_COLORS = { Deposit: '#facc15', Withdrawal: '#ffffff', Transfer: '#3b82f6' };
const RISK_COLORS = { High: '#ef4444', Medium: '#facc15', Low: '#3b82f6' };
const CARD_COLORS = ['#ffffff', '#8b5cf6', '#fef08a', '#f97316'];

export default function PartnerDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [bankData, setBankData] = useState([]);
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadBankData();
        loadAds();
    }, [user]);

    const loadBankData = async () => {
        try {
            const response = await fetch('/bankData.json');
            const data = await response.json();
            const processed = data.map(row => ({
                raw: row,
                balance: row['Account Balance'] || 0,
                isFrozen: row['Account Status'] === 'Frozen',
                activeStatus: row['Account Status'] === 'Active' ? 'Active' : 'Inactive',
                isHighRisk: row.RiskLevel === 'High'
            }));
            setBankData(processed);
        } catch (err) {
            console.error('Failed to load bank data:', err);
        } finally {
            setLoading(false);
        }
    };

    const loadAds = async () => {
        if (!user) return;
        try {
            const q = query(
                collection(userDB, "ads"),
                where("partnerId", "==", user.uid)
            );
            const snapshot = await getDocs(q);
            setAds(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (err) {
            console.error('Failed to load ads:', err);
        }
    };

    // Calculate Stats
    const stats = useMemo(() => {
        const totalCustomers = bankData.length;
        const totalBalance = bankData.reduce((acc, curr) => acc + curr.balance, 0);
        const activeCount = bankData.filter(d => d.activeStatus === 'Active').length;
        const frozenCount = bankData.filter(d => d.isFrozen).length;

        return {
            totalCustomers,
            totalBalance,
            activeCount,
            frozenCount
        };
    }, [bankData]);

    // Calculate Analytics
    const analytics = useMemo(() => {
        // Account Type Distribution
        const acctCounts = {};
        bankData.forEach(d => {
            const type = d.raw['Account Type'];
            if (type) acctCounts[type] = (acctCounts[type] || 0) + 1;
        });
        const accountTypeData = Object.keys(acctCounts).map(name => ({
            name,
            value: acctCounts[name]
        }));

        // Loan Status by Gender
        const genderLoan = {};
        ['Other', 'Female', 'Male', 'Unknown'].forEach(g =>
            genderLoan[g] = { name: g, Approved: 0, Closed: 0, Rejected: 0 }
        );
        bankData.forEach(d => {
            const g = d.raw.Gender || 'Unknown';
            const s = d.raw['Loan Status'];
            if (s && genderLoan[g] && genderLoan[g][s] !== undefined) {
                genderLoan[g][s]++;
            }
        });
        const loanByGenderData = Object.values(genderLoan);

        // Loan Status Distribution
        const loanStatus = {};
        bankData.forEach(d => {
            const s = d.raw['Loan Status'];
            if (s) loanStatus[s] = (loanStatus[s] || 0) + 1;
        });
        const loanStatusData = Object.keys(loanStatus).map(name => ({ name, value: loanStatus[name] }));

        // Transaction Volume by Channel
        const channels = { Deposit: 0, Withdrawal: 0, Transfer: 0 };
        bankData.forEach(d => {
            const t = d.raw['Transaction Type'];
            if (channels[t] !== undefined) channels[t] += d.raw['Transaction Amount'] || 0;
        });
        const channelData = Object.keys(channels).map(name => ({ name, value: channels[name] }));

        // Transaction by Age (Scatter)
        const ageScatterData = bankData
            .filter(d => d.raw.Age && d.raw['Transaction Amount'])
            .map(d => ({
                x: d.raw.Age,
                y: d.raw['Transaction Amount'],
                fill: ACCT_COLORS[Math.floor(Math.random() * ACCT_COLORS.length)]
            }))
            .slice(0, 150);

        // Delinquency Trend
        const delinquencyMap = {};
        bankData.forEach(d => {
            const dateStr = d.raw['Payment Due Date'];
            const delay = d.raw['Payment Delay Days'] || 0;
            if (dateStr && delay > 0) {
                const date = new Date(dateStr);
                if (!isNaN(date)) {
                    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                    const label = date.toLocaleString('default', { month: 'short' });
                    if (!delinquencyMap[key]) delinquencyMap[key] = { name: label, fullDate: key, days: 0 };
                    delinquencyMap[key].days += delay;
                }
            }
        });
        const delinquencyTrend = Object.values(delinquencyMap).sort((a, b) => a.fullDate.localeCompare(b.fullDate));

        // Risk Level
        const riskCounts = { High: 0, Medium: 0, Low: 0 };
        bankData.forEach(d => {
            const r = d.raw.RiskLevel;
            if (riskCounts[r] !== undefined) riskCounts[r]++;
        });
        const riskData = Object.keys(riskCounts).map(name => ({ name, value: riskCounts[name] }));

        // Card Usage
        const cardCounts = {};
        bankData.forEach(d => {
            const c = d.raw['Card Type'];
            if (c) cardCounts[c] = (cardCounts[c] || 0) + 1;
        });
        const cardData = Object.keys(cardCounts).map(name => ({ name, count: cardCounts[name] }));

        return {
            accountTypeData,
            loanByGenderData,
            loanStatusData,
            channelData,
            ageScatterData,
            delinquencyTrend,
            riskData,
            cardData
        };
    }, [bankData]);

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{
                    background: '#1e293b',
                    border: '1px solid #334155',
                    padding: '8px 12px',
                    borderRadius: '4px',
                }}>
                    <p style={{ color: '#e2e8f0', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>{label}</p>
                    {payload.map((p, i) => (
                        <p key={i} style={{ color: p.color || p.fill, fontSize: '11px', margin: 0 }}>
                            {p.name}: {p.value.toLocaleString()}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    if (loading) {
        return <div className="p-5 text-white text-center">Loading Command Center...</div>;
    }

    return (
        <div className="partner-dashboard-admin">
            <Toaster position="top-right" />

            {/* HEADER */}
            <div className="admin-glass-header">
                <div>
                    <h1 className="admin-glass-title">Command Center</h1>
                    <p className="admin-glass-subtitle">Live Operations & Security Overview</p>
                </div>
                <button
                    className="create-ad-btn-header"
                    onClick={() => navigate("/partner/create-ad")}
                >
                    Create New Ad
                </button>
            </div>

            {/* STATS CARDS */}
            <div className="admin-stats-grid">
                <div className="stat-card-admin">
                    <p className="stat-label-admin">Total Customers</p>
                    <h2 className="stat-value-admin">{stats.totalCustomers.toLocaleString()}</h2>
                    <p className="stat-trend-admin pos">+12% this month</p>
                </div>

                <div className="stat-card-admin liquidity">
                    <p className="stat-label-admin">Total Liquidity</p>
                    <h2 className="stat-value-admin" style={{ color: '#1e40af' }}>
                        {new Intl.NumberFormat('en-IN', {
                            style: 'currency',
                            currency: 'INR',
                            maximumFractionDigits: 0
                        }).format(stats.totalBalance)}
                    </h2>
                    <p className="stat-trend-admin neut">Across all accounts</p>
                </div>

                <div className="stat-card-admin">
                    <p className="stat-label-admin">Active Status</p>
                    <h2 className="stat-value-admin">821{stats.activeCount}</h2>
                    <p className="stat-trend-admin pos">Healthy Ratio</p>
                </div>

                <div className="stat-card-admin">
                    <p className="stat-label-admin" style={{ color: '#ef4444' }}>Frozen Accounts</p>
                    <h2 className="stat-value-admin" style={{ color: '#ef4444' }}>5,65{stats.frozenCount.toLocaleString()}</h2>
                    <p className="stat-trend-admin neut">Requires Review</p>
                </div>
            </div>

            {/* ANALYTICS INTELLIGENCE */}
            <div className="analytics-container">
                <h2 className="analytics-title text-primary">Analytics Intelligence</h2>

                <div className="analytics-grid">
                    {/* 1. Account Type */}
                    <div className="analytics-card">
                        <h4 className="analytics-card-title">COUNT OF ACCOUNT TYPE</h4>
                        <ResponsiveContainer width="100%" height={260}>
                            <PieChart>
                                <Pie
                                    data={analytics.accountTypeData}
                                    innerRadius={60}
                                    outerRadius={80}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {analytics.accountTypeData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={ACCT_COLORS[index % ACCT_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                                <Legend layout="vertical" verticalAlign="middle" align="right" iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* 2. Loan Status by Gender */}
                    <div className="analytics-card">
                        <h4 className="analytics-card-title">COUNT OF LOAN STATUS BY GENDER</h4>
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart layout="vertical" data={analytics.loanByGenderData} barSize={30}>
                                <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} horizontal={false} />
                                <XAxis type="number" stroke={CHART_THEME.text} fontSize={10} axisLine={false} tickLine={false} />
                                <YAxis dataKey="name" type="category" stroke={CHART_THEME.text} fontSize={11} width={60} axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ paddingTop: '10px' }} />
                                <Bar dataKey="Approved" stackId="a" fill={LOAN_STATUS_COLORS.Approved} />
                                <Bar dataKey="Closed" stackId="a" fill={LOAN_STATUS_COLORS.Closed} />
                                <Bar dataKey="Rejected" stackId="a" fill={LOAN_STATUS_COLORS.Rejected} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* 3. Loan Status Distribution */}
                    <div className="analytics-card">
                        <h4 className="analytics-card-title">LOAN STATUS DISTRIBUTION</h4>
                        <ResponsiveContainer width="100%" height={260}>
                            <PieChart>
                                <Pie data={analytics.loanStatusData} outerRadius={80} dataKey="value" stroke="none">
                                    {analytics.loanStatusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={LOAN_STATUS_COLORS[entry.name] || '#cbd5e1'} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                                <Legend verticalAlign="bottom" iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* 4. Transaction Volume */}
                    <div className="analytics-card">
                        <h4 className="analytics-card-title">TRANSACTION VOLUME BY CHANNEL</h4>
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart layout="vertical" data={analytics.channelData} barSize={35}>
                                <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} horizontal={false} />
                                <XAxis type="number" stroke={CHART_THEME.text} fontSize={10} axisLine={false} tickLine={false} />
                                <YAxis dataKey="name" type="category" stroke={CHART_THEME.text} fontSize={11} width={80} axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="value">
                                    {analytics.channelData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={CHANNEL_COLORS[entry.name] || '#3b82f6'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* 5. Transaction by Age */}
                    <div className="analytics-card">
                        <h4 className="analytics-card-title">COUNT OF TRANSACTION BY AGE</h4>
                        <ResponsiveContainer width="100%" height={260}>
                            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} />
                                <XAxis type="number" dataKey="x" name="Age" unit=" yrs" stroke={CHART_THEME.text} fontSize={10} axisLine={false} tickLine={false} />
                                <YAxis type="number" dataKey="y" name="Amount" stroke={CHART_THEME.text} fontSize={10} tickFormatter={(val) => `₹${val / 1000}k`} axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Scatter name="Transactions" data={analytics.ageScatterData} shape="circle" />
                            </ScatterChart>
                        </ResponsiveContainer>
                    </div>

                    {/* 6. Delinquency Trend */}
                    <div className="analytics-card">
                        <h4 className="analytics-card-title">LOAN DELINQUENCY TREND</h4>
                        <ResponsiveContainer width="100%" height={260}>
                            <AreaChart data={analytics.delinquencyTrend}>
                                <defs>
                                    <linearGradient id="colorDays" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.5} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} vertical={false} />
                                <XAxis dataKey="name" stroke={CHART_THEME.text} fontSize={10} axisLine={false} tickLine={false} />
                                <YAxis stroke={CHART_THEME.text} fontSize={10} axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="days" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorDays)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* 7. Risk Level */}
                    <div className="analytics-card">
                        <h4 className="analytics-card-title">RISK LEVEL BY ACCOUNT ID</h4>
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={analytics.riskData} barSize={40}>
                                <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} vertical={false} />
                                <XAxis dataKey="name" stroke={CHART_THEME.text} fontSize={11} axisLine={false} tickLine={false} />
                                <YAxis stroke={CHART_THEME.text} fontSize={10} axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="value">
                                    {analytics.riskData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={RISK_COLORS[entry.name] || '#3b82f6'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* 8. Card Usage */}
                    <div className="analytics-card">
                        <h4 className="analytics-card-title">COUNT OF CARD USAGE</h4>
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={analytics.cardData} barSize={50}>
                                <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} vertical={false} />
                                <XAxis dataKey="name" stroke={CHART_THEME.text} fontSize={11} axisLine={false} tickLine={false} />
                                <YAxis stroke={CHART_THEME.text} fontSize={10} axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="count">
                                    {analytics.cardData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={CARD_COLORS[index % CARD_COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* CAMPAIGN MANAGEMENT SECTION */}
            <div className="campaign-management-section">
                <div className="campaign-header">
                    <div>
                        <h2 className="campaign-title">
                            <span className="campaign-icon">⚡</span> Campaign Management
                        </h2>
                    </div>
                    <button
                        className="create-new-ad-btn"
                        onClick={() => navigate("/partner/create-ad")}
                    >
                        + Create New Ad
                    </button>
                </div>

                {/* Status Summary Cards */}
                <div className="status-summary-grid">
                    <div className="status-summary-card total">
                        <div className="status-count">{ads.length}</div>
                        <div className="status-label">Total Ads</div>
                    </div>
                    <div className="status-summary-card approved">
                        <div className="status-count">{ads.filter(ad => ad.status === "APPROVED").length}</div>
                        <div className="status-label">Approved</div>
                    </div>
                    <div className="status-summary-card pending">
                        <div className="status-count">{ads.filter(ad => ad.status === "PENDING").length}</div>
                        <div className="status-label">Pending</div>
                    </div>
                    <div className="status-summary-card rejected">
                        <div className="status-count">{ads.filter(ad => ad.status === "REJECTED").length}</div>
                        <div className="status-label">Rejected</div>
                    </div>
                </div>

                {/* Ad Cards Grid */}
                <div className="ad-cards-grid">
                    {ads.length === 0 ? (
                        <div className="empty-ads-state">
                            <div className="empty-icon">📢</div>
                            <h3>No Campaigns Yet</h3>
                            <p>Create your first ad campaign to reach thousands of Vajra users</p>
                            <button
                                className="create-first-ad-btn"
                                onClick={() => navigate("/partner/create-ad")}
                            >
                                Create Your First Ad
                            </button>
                        </div>
                    ) : (
                        ads.map(ad => (
                            <div key={ad.id} className={`ad-card ${ad.status.toLowerCase()}`}>
                                {/* Status Badge */}
                                <div className={`ad-status-badge ${ad.status.toLowerCase()}`}>
                                    {ad.status === "PENDING" && "⏳ PENDING"}
                                    {ad.status === "APPROVED" && "✓ APPROVED"}
                                    {ad.status === "REJECTED" && "✗ REJECTED"}
                                </div>

                                {/* Ad Preview Image */}
                                <div className="ad-preview-img">
                                    {ad.imageUrl ? (
                                        <img
                                            src={ad.imageUrl}
                                            alt={ad.title}
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.nextSibling.style.display = 'flex';
                                            }}
                                        />
                                    ) : null}
                                    <div className="ad-preview-placeholder" style={{ display: ad.imageUrl ? 'none' : 'flex' }}>
                                        <span>📷</span>
                                        <span>No Image</span>
                                    </div>
                                </div>

                                {/* Ad Details */}
                                <div className="ad-card-content">
                                    <h4 className="ad-card-title">{ad.title}</h4>

                                    <div className="ad-meta-row">
                                        <span className="ad-meta-item">
                                            📅 {ad.durationDays || ad.activeDays || 30} Days
                                        </span>
                                        {ad.createdAt && (
                                            <span className="ad-meta-item">
                                                🕒 {ad.createdAt.toDate().toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>

                                    {ad.placements && ad.placements.length > 0 && (
                                        <div className="ad-placements-row">
                                            {ad.placements.map(p => (
                                                <span key={p} className="placement-chip">{p}</span>
                                            ))}
                                        </div>
                                    )}

                                    {ad.status === "REJECTED" && ad.rejectionReason && (
                                        <div className="rejection-reason">
                                            <strong>Reason:</strong> {ad.rejectionReason}
                                        </div>
                                    )}
                                </div>

                                {/* Ad Actions */}
                                <div className="ad-card-actions">
                                    {ad.redirectUrl && (
                                        <button
                                            className="ad-action-btn view"
                                            onClick={() => window.open(ad.redirectUrl, '_blank')}
                                            title="View Destination"
                                        >
                                            🔗 View Link
                                        </button>
                                    )}
                                    {ad.imageUrl && (
                                        <button
                                            className="ad-action-btn preview"
                                            onClick={() => window.open(ad.imageUrl, '_blank')}
                                            title="Preview Image"
                                        >
                                            👁️ Preview
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
