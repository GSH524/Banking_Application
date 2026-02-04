import React, { useMemo } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, AreaChart, Area, ComposedChart, Line
} from 'recharts';
import { useBankData } from '../../hooks/useBankData';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import CreditUtilization from './CreditUtilization';

// ================= THEME CONSTANTS (FINTECH DARK) =================
const THEME = {
    bg: '#080f25',        // Extremely Dark Blue Background
    card: '#0c142c',      // Darker Card Background
    cardBorder: 'rgba(255,255,255,0.08)',
    textMain: '#f8fafc',
    textSub: '#94a3b8',
    success: '#3b82f6',   // Electric Blue
    line: '#6366f1',      // Indigo Line
    warning: '#f59e0b',   // Amber (EMI)
    danger: '#ef4444',    // Expense
    others: '#d946ef',    // Magenta
    cyan: '#06b6d4',      // Cyan
    purple: '#8b5cf6',    // Purple
    grid: 'rgba(255,255,255,0.1)'
};

const PIE_COLORS = [THEME.success, '#1e3a8a', '#f97316', '#a21caf', '#db2777', '#4ade80'];

export default function UserAnalytics() {
    const { data } = useBankData();
    const { currentUser } = useCurrentUser();

    // Helper: Map transaction reason to standardized category
    const mapCategory = (reason) => {
        const r = (reason || '').toLowerCase();
        if (r.includes('shop')) return 'Shopping';
        if (r.includes('bill')) return 'Bills';
        if (r.includes('emi')) return 'EMI';
        if (r.includes('recharge')) return 'Recharge';
        if (r.includes('transfer')) return 'Transfer';
        if (r.includes('rent')) return 'Rent';
        return 'Others';
    };

    const metrics = useMemo(() => {
        if (!data || !currentUser) return null;

        const userEmail = currentUser.email.toLowerCase();
        const userTxns = data.filter(d => d.email && d.email.toLowerCase() === userEmail);

        if (userTxns.length === 0) return null;

        console.log('=== USER ANALYTICS DATA AGGREGATION ===');
        console.log('User Email:', userEmail);
        console.log('Total Records:', userTxns.length);

        // Sort chronologically
        userTxns.sort((a, b) => new Date(a.raw['Transaction Date']) - new Date(b.raw['Transaction Date']));

        // STEP 1: Normalize Transactions
        const normalizedTxns = userTxns.map(t => {
            const raw = t.raw;
            const dateObj = new Date(raw['Transaction Date']);
            const amt = Number(raw['Transaction Amount']);
            const typeValue = (raw['Transaction Type'] || '').toLowerCase();
            const reason = (raw['Transaction_Reason'] || '');

            // Skip if invalid
            if (isNaN(dateObj) || isNaN(amt) || amt === 0) return null;

            // Normalize type
            let txType = 'other';
            if (typeValue === 'deposit') txType = 'deposit';
            else if (typeValue === 'withdrawal' || typeValue === 'transfer') txType = 'withdrawal';

            // If reason includes EMI, treat as EMI regardless of type
            if (reason.toUpperCase().includes('EMI')) txType = 'emi';

            return {
                date: dateObj,
                amount: amt,
                type: txType,
                reason: reason,
                balanceAfter: Number(raw['Account Balance After Transaction']) || 0,
                month: dateObj.toLocaleString('default', { month: 'long' }),
                monthYear: `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`,
                day: dateObj.getDate(),
                dueDate: raw['Payment Due Date'] ? new Date(raw['Payment Due Date']) : null,
                minPaymentDue: Number(raw['Minimum Payment Due']) || 0,
                creditLimit: Number(raw['Credit Limit']) || 0,
                creditUsed: Number(raw['Credit Card Balance']) || 0
            };
        }).filter(t => t !== null);

        console.log('Normalized Transactions:', normalizedTxns.length);

        // STEP 2: Monthly Cash Flow = sum(deposits) - sum(withdrawals) - sum(emi)
        const monthFlowMap = {};
        normalizedTxns.forEach(t => {
            if (!monthFlowMap[t.month]) {
                monthFlowMap[t.month] = {
                    name: t.month,
                    deposits: 0,
                    withdrawals: 0,
                    emi: 0,
                    NetFlow: 0,
                    sortId: t.monthYear
                };
            }

            if (t.type === 'deposit') {
                monthFlowMap[t.month].deposits += t.amount;
            } else if (t.type === 'withdrawal') {
                monthFlowMap[t.month].withdrawals += t.amount;
            } else if (t.type === 'emi') {
                monthFlowMap[t.month].emi += t.amount;
            }
        });

        // Calculate NetFlow
        Object.values(monthFlowMap).forEach(m => {
            m.NetFlow = m.deposits - m.withdrawals - m.emi;
        });

        console.log('Monthly Cash Flow:', Object.values(monthFlowMap).map(m => ({
            month: m.name,
            deposits: m.deposits,
            withdrawals: m.withdrawals,
            emi: m.emi,
            netFlow: m.NetFlow
        })));

        // STEP 3: Spending Distribution (Withdrawals + EMI ONLY, NO DEPOSITS)
        const spendingMap = {};
        normalizedTxns.forEach(t => {
            if (t.type === 'deposit') return; // SKIP DEPOSITS

            const category = mapCategory(t.reason);
            spendingMap[category] = (spendingMap[category] || 0) + t.amount;
        });

        const spending = Object.keys(spendingMap).map(k => ({ name: k, value: spendingMap[k] }));
        console.log('Spending Distribution:', spending);

        // STEP 4: Credit Utilization
        let latestCreditLimit = 0;
        let latestCreditUsed = 0;
        for (let i = normalizedTxns.length - 1; i >= 0; i--) {
            if (normalizedTxns[i].creditLimit > 0) {
                latestCreditLimit = normalizedTxns[i].creditLimit;
                latestCreditUsed = normalizedTxns[i].creditUsed;
                break;
            }
        }

        const utilization = latestCreditLimit > 0 ? (latestCreditUsed / latestCreditLimit) * 100 : 0;
        console.log('Credit Utilization:', {
            used: latestCreditUsed,
            limit: latestCreditLimit,
            percent: utilization.toFixed(2)
        });

        // Use Firebase user values if available as they are more "live"
        const finalUsed = currentUser.creditBalance !== undefined ? currentUser.creditBalance : latestCreditUsed;
        const finalLimit = currentUser.creditLimit !== undefined ? currentUser.creditLimit : latestCreditLimit;

        // STEP 5: Balance Trend (Use actual balance from transactions)
        const balanceTrend = normalizedTxns.map(t => ({
            name: `${t.day} ${t.month.slice(0, 3)}`,
            balance: t.balanceAfter,
            sortKey: `${t.monthYear}-${String(t.day).padStart(2, '0')}-${Math.random()}`
        }));

        console.log('Balance Trend Points:', balanceTrend.length);

        // STEP 6: Upcoming Payments (EMI ONLY, Future Dates)
        const today = new Date();
        const upcomingMap = {};
        normalizedTxns.forEach(t => {
            if (t.type !== 'emi') return; // EMI ONLY
            if (!t.dueDate || isNaN(t.dueDate) || t.dueDate <= today) return; // Future dates only
            if (t.minPaymentDue === 0) return;

            const dueMonth = t.dueDate.toLocaleString('default', { month: 'long' });
            const dueSortKey = `${t.dueDate.getFullYear()}-${String(t.dueDate.getMonth() + 1).padStart(2, '0')}`;

            if (!upcomingMap[dueSortKey]) {
                upcomingMap[dueSortKey] = {
                    name: dueMonth,
                    Amount: 0,
                    sortId: dueSortKey
                };
            }
            upcomingMap[dueSortKey].Amount = Math.max(upcomingMap[dueSortKey].Amount, t.minPaymentDue);
        });

        const upcoming = Object.values(upcomingMap).sort((a, b) => a.sortId.localeCompare(b.sortId)).slice(-4);
        console.log('Upcoming Payments:', upcoming);

        // STEP 7: EMI vs Other Spending
        const monthlyEMIMap = {};
        normalizedTxns.forEach(t => {
            if (t.type === 'deposit') return; // Exclude deposits

            if (!monthlyEMIMap[t.month]) {
                monthlyEMIMap[t.month] = {
                    name: t.month,
                    EMI: 0,
                    Others: 0,
                    sortId: t.monthYear
                };
            }

            if (t.type === 'emi') {
                monthlyEMIMap[t.month].EMI += t.amount;
            } else if (t.type === 'withdrawal') {
                monthlyEMIMap[t.month].Others += t.amount;
            }
        });

        const emiVsOthers = Object.values(monthlyEMIMap).filter(v => (v.EMI + v.Others) > 0).sort((a, b) => a.sortId.localeCompare(b.sortId));
        console.log('EMI vs Others:', emiVsOthers);

        console.log('=== END DATA AGGREGATION ===');

        return {
            cashFlow: Object.values(monthFlowMap).sort((a, b) => a.sortId.localeCompare(b.sortId)),
            spending: spending.length > 0 ? spending : [{ name: 'No Spending Record', value: 1 }],
            balance: balanceTrend.sort((a, b) => a.sortKey.localeCompare(b.sortKey)).slice(-30),
            utilization: utilization.toFixed(2),
            creditUsed: finalUsed,
            creditLimit: finalLimit,
            utilizationColor: utilization < 30 ? '#10b981' : utilization < 70 ? '#f59e0b' : '#ef4444',
            upcoming: upcoming,
            emiVsOthers: emiVsOthers
        };
    }, [data, currentUser]);

    if (!metrics) return <div style={{ color: THEME.textSub, padding: 40 }}>Gathering data...</div>;

    // Currency formatting helper
    const formatCurrency = (value) => {
        if (value >= 1000000) return `₹${(value / 1000000).toFixed(1)}M`;
        if (value >= 1000) return `₹${(value / 1000).toFixed(0)}k`;
        return `₹${value.toFixed(0)}`;
    };

    // Calculate total spending for donut center
    const totalSpend = metrics.spending.reduce((sum, item) => sum + item.value, 0);

    const CardBase = {
        background: 'rgba(12, 20, 44, 0.6)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid rgba(59, 130, 246, 0.2)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        display: 'flex',
        flexDirection: 'column',
        height: '350px',
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease'
    };

    const HeaderStyle = {
        color: 'white',
        fontSize: '18px',
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: '20px',
        letterSpacing: '0.5px'
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{ background: '#0c142c', border: '1px solid #1e293b', padding: '12px', borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
                    <p style={{ color: '#fff', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>{label}</p>
                    {payload.map((p, i) => (
                        <p key={i} style={{ color: p.color || '#fff', fontSize: '12px', margin: '4px 0' }}>
                            {p.name}: ₹{Number(p.value).toLocaleString()}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div style={{ background: THEME.bg, padding: '40px', borderRadius: '24px', marginTop: '40px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>

                {/* 1. Monthly Cash Flow - Stacked Bars */}
                <div style={CardBase}>
                    <h4 style={HeaderStyle}>Monthly Cash Flow</h4>
                    <div style={{ flex: 1, height: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={metrics.cashFlow}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={THEME.grid} />
                                <XAxis dataKey="name" stroke={THEME.textSub} fontSize={10} axisLine={false} tickLine={false} />
                                <YAxis stroke={THEME.textSub} fontSize={10} axisLine={false} tickLine={false} tickFormatter={formatCurrency} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#fff' }} />
                                <Bar dataKey="deposits" stackId="a" fill="#10b981" name="Deposits" radius={[0, 0, 0, 0]} />
                                <Bar dataKey="withdrawals" stackId="a" fill="#ef4444" name="Withdrawals" radius={[0, 0, 0, 0]} />
                                <Bar dataKey="emi" stackId="a" fill="#f59e0b" name="EMI" radius={[2, 2, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 2. Spending Distribution - Donut Chart */}
                <div style={CardBase}>
                    <h4 style={HeaderStyle}>Spending Distribution</h4>
                    <div style={{ flex: 1, height: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={metrics.spending}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    dataKey="value"
                                    stroke="none"
                                    label={(entry) => `${((entry.value / totalSpend) * 100).toFixed(0)}%`}
                                    labelLine={false}
                                >
                                    {metrics.spending.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                                <Legend iconType="circle" layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{ paddingLeft: '20px', color: '#fff', fontSize: '11px' }} />
                                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: '18px', fontWeight: 'bold', fill: '#fff' }}>
                                    {formatCurrency(totalSpend)}
                                </text>
                                <text x="50%" y="58%" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: '11px', fill: THEME.textSub }}>
                                    Total Spend
                                </text>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 3. Credit Utilization */}
                <CreditUtilization used={metrics.creditUsed} limit={metrics.creditLimit} />

                {/* 4. Balance Trend - Enhanced Area Chart */}
                <div style={CardBase}>
                    <h4 style={HeaderStyle}>Balance Trend</h4>
                    <div style={{ flex: 1, height: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={metrics.balance}>
                                <defs>
                                    <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={THEME.grid} />
                                <XAxis dataKey="name" stroke={THEME.textSub} fontSize={9} />
                                <YAxis stroke={THEME.textSub} fontSize={10} tickFormatter={formatCurrency} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="balance" stroke="#3b82f6" strokeWidth={2} fill="url(#balanceGradient)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 5. Upcoming Payments - Horizontal Timeline */}
                <div style={CardBase}>
                    <h4 style={HeaderStyle}>Upcoming Payments</h4>
                    <div style={{ flex: 1, padding: '10px 0', overflowY: 'auto' }}>
                        {metrics.upcoming.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {metrics.upcoming.map(payment => {
                                    const maxAmount = Math.max(...metrics.upcoming.map(p => p.Amount));
                                    const widthPercent = (payment.Amount / maxAmount) * 100;
                                    // Determine color based on urgency (using month as proxy)
                                    const urgencyColor = '#3b82f6'; // Default blue for all future payments

                                    return (
                                        <div key={payment.sortId}>
                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                marginBottom: '6px',
                                                color: THEME.textMain,
                                                fontSize: '12px'
                                            }}>
                                                <span style={{ fontWeight: '600' }}>{payment.name}</span>
                                                <span style={{ color: urgencyColor, fontWeight: '700' }}>
                                                    ₹{payment.Amount.toLocaleString()}
                                                </span>
                                            </div>
                                            <div style={{
                                                height: '10px',
                                                background: '#1e293b',
                                                borderRadius: '5px',
                                                overflow: 'hidden',
                                                position: 'relative'
                                            }}>
                                                <div style={{
                                                    width: `${widthPercent}%`,
                                                    height: '100%',
                                                    background: urgencyColor,
                                                    borderRadius: '5px',
                                                    transition: 'width 0.3s ease'
                                                }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: '100%',
                                color: THEME.textSub,
                                fontSize: '14px'
                            }}>
                                No upcoming payments
                            </div>
                        )}
                    </div>
                </div>

                {/* 6. EMI vs Other Spending - Grouped Bars */}
                <div style={CardBase}>
                    <h4 style={HeaderStyle}>EMI vs Other Spending</h4>
                    <div style={{ flex: 1, height: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={metrics.emiVsOthers}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={THEME.grid} />
                                <XAxis dataKey="name" stroke={THEME.textSub} fontSize={10} axisLine={false} tickLine={false} />
                                <YAxis stroke={THEME.textSub} fontSize={10} axisLine={false} tickLine={false} tickFormatter={formatCurrency} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#fff' }} />
                                <Bar dataKey="EMI" fill="#f59e0b" name="EMI" barSize={20} radius={[2, 2, 0, 0]} />
                                <Bar dataKey="Others" fill="#3b82f6" name="Others" barSize={20} radius={[2, 2, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>
        </div>
    );
}
