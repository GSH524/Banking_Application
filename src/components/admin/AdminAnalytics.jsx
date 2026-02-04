import React, { useMemo } from 'react';
import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
    AreaChart, Area, ScatterChart, Scatter
} from 'recharts';

// ================= THEME ADAPTATION (DARK MODE) =================
const CHART_THEME = {
    grid: 'rgba(255, 255, 255, 0.05)',
    text: '#94a3b8',
    tooltipBg: '#0f172a',
    tooltipBorder: 'rgba(59, 130, 246, 0.2)',
};

const ACCT_COLORS = ['#f59e0b', '#3b82f6', '#ef4444']; // Amer/Blue/Red
const LOAN_STATUS_COLORS = { Approved: '#10b981', Closed: '#3b82f6', Rejected: '#ef4444', Default: '#94a3b8' };
const GENDER_COLORS = { Male: '#3b82f6', Female: '#ec4899', Other: '#10b981' };
const CHANNEL_COLORS = { Deposit: '#facc15', Withdrawal: '#ffffff', Transfer: '#3b82f6' }; // Yellow/White/Blue
const RISK_COLORS = { High: '#ef4444', Medium: '#facc15', Low: '#3b82f6' }; // Red/Yellow/Blue
const CARD_COLORS = ['#ffffff', '#8b5cf6', '#fef08a', '#f97316'];

export default function AdminAnalytics({ data }) {

    const stats = useMemo(() => {
        // 1. COUNT OF ACCOUNT TYPE
        const acctCounts = {};
        let totalAccts = 0;
        data.forEach(d => {
            const type = d.raw['Account Type'];
            if (type) {
                acctCounts[type] = (acctCounts[type] || 0) + 1;
                totalAccts++;
            }
        });
        const accountTypeData = Object.keys(acctCounts).map(name => ({
            name,
            value: acctCounts[name],
            percent: totalAccts ? ((acctCounts[name] / totalAccts) * 100).toFixed(1) : 0
        }));

        // 2. COUNT OF LOAN STATUS BY GENDER
        const genderLoan = {};
        const genders = ['Other', 'Female', 'Male', 'Unknown'];
        genders.forEach(g => genderLoan[g] = { name: g, Approved: 0, Closed: 0, Rejected: 0 });

        data.forEach(d => {
            const g = d.raw.Gender || 'Unknown';
            const s = d.raw['Loan Status'];
            if (s && genderLoan[g]) {
                if (genderLoan[g][s] !== undefined) genderLoan[g][s]++;
            }
        });
        const loanByGenderData = Object.values(genderLoan);

        // 3. LOAN STATUS DISTRIBUTION
        const loanStatus = {};
        data.forEach(d => {
            const s = d.raw['Loan Status'];
            if (s) loanStatus[s] = (loanStatus[s] || 0) + 1;
        });
        const loanStatusData = Object.keys(loanStatus).map(name => ({ name, value: loanStatus[name] }));

        // 4. TRANSACTION VOLUME BY CHANNEL
        const channels = { Deposit: 0, Withdrawal: 0, Transfer: 0 };
        data.forEach(d => {
            const t = d.raw['Transaction Type'];
            if (channels[t] !== undefined) channels[t] += d.raw['Transaction Amount'] || 0;
        });
        const channelData = Object.keys(channels).map(name => ({ name, value: channels[name] }));

        // 5. COUNT OF TRANSACTION BY AGE
        const ageScatterData = data
            .filter(d => d.raw.Age && d.raw['Transaction Amount'])
            .map(d => ({
                x: d.raw.Age,
                y: d.raw['Transaction Amount'],
                fill: ACCT_COLORS[Math.floor(Math.random() * ACCT_COLORS.length)] // Random color for visual match
            }))
            .slice(0, 150);

        // 6. LOAN DELINQUENCY TREND (Proxy: Payment Delay Days over time)
        const delinquencyMap = {};
        data.forEach(d => {
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

        // 7. RISK LEVEL BY ACCOUNT ID (Aggregated count logic retained as per visual)
        const riskCounts = { High: 0, Medium: 0, Low: 0 };
        data.forEach(d => {
            const r = d.raw.RiskLevel;
            if (riskCounts[r] !== undefined) riskCounts[r]++;
        });
        const riskData = Object.keys(riskCounts).map(name => ({ name, value: riskCounts[name] }));

        // 8. COUNT OF CARD USAGE
        const cardCounts = {};
        data.forEach(d => {
            const c = d.raw['Card Type'];
            if (c) cardCounts[c] = (cardCounts[c] || 0) + 1;
        });
        const cardData = Object.keys(cardCounts).map(name => ({ name, count: cardCounts[name] }));

        return { accountTypeData, loanByGenderData, loanStatusData, channelData, ageScatterData, delinquencyTrend, riskData, cardData };
    }, [data]);

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

    return (
        <div className="analytics-container">
            <h2 className="analytics-title">Analytics Intelligence</h2>

            <div className="analytics-grid">
                {/* 1. COUNT OF ACCOUNT TYPE */}
                <div className="analytics-card">
                    <h4 className="analytics-card-title">COUNT OF ACCOUNT TYPE</h4>
                    <ResponsiveContainer width="100%" height={260}>
                        <PieChart>
                            <Pie
                                data={stats.accountTypeData}
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={0}
                                dataKey="value"
                                stroke="none"
                            >
                                {stats.accountTypeData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={ACCT_COLORS[index % ACCT_COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend layout="vertical" verticalAlign="middle" align="right" iconType="circle" />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* 2. COUNT OF LOAN STATUS BY GENDER */}
                <div className="analytics-card">
                    <h4 className="analytics-card-title">COUNT OF LOAN STATUS BY GENDER</h4>
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart layout="vertical" data={stats.loanByGenderData} barSize={30}>
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

                {/* 3. LOAN STATUS DISTRIBUTION */}
                <div className="analytics-card">
                    <h4 className="analytics-card-title">LOAN STATUS DISTRIBUTION</h4>
                    <ResponsiveContainer width="100%" height={260}>
                        <PieChart>
                            <Pie data={stats.loanStatusData} outerRadius={80} dataKey="value" stroke="none">
                                {stats.loanStatusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={LOAN_STATUS_COLORS[entry.name] || '#cbd5e1'} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend verticalAlign="bottom" iconType="circle" />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* 4. TRANSACTION VOLUME BY CHANNEL */}
                <div className="analytics-card">
                    <h4 className="analytics-card-title">TRANSACTION VOLUME BY CHANNEL</h4>
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart layout="vertical" data={stats.channelData} barSize={35}>
                            <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} horizontal={false} />
                            <XAxis type="number" stroke={CHART_THEME.text} fontSize={10} axisLine={false} tickLine={false} />
                            <YAxis dataKey="name" type="category" stroke={CHART_THEME.text} fontSize={11} width={80} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="value">
                                {stats.channelData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={CHANNEL_COLORS[entry.name] || '#3b82f6'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* 5. COUNT OF TRANSACTION BY AGE */}
                <div className="analytics-card">
                    <h4 className="analytics-card-title">COUNT OF TRANSACTION BY AGE</h4>
                    <ResponsiveContainer width="100%" height={260}>
                        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} />
                            <XAxis type="number" dataKey="x" name="Age" unit=" yrs" stroke={CHART_THEME.text} fontSize={10} axisLine={false} tickLine={false} />
                            <YAxis type="number" dataKey="y" name="Amount" stroke={CHART_THEME.text} fontSize={10} tickFormatter={(val) => `₹${val / 1000}k`} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Scatter name="Transactions" data={stats.ageScatterData} shape="circle" />
                        </ScatterChart>
                    </ResponsiveContainer>
                </div>

                {/* 6. LOAN DELINQUENCY TREND */}
                <div className="analytics-card">
                    <h4 className="analytics-card-title">LOAN DELINQUENCY TREND</h4>
                    <ResponsiveContainer width="100%" height={260}>
                        <AreaChart data={stats.delinquencyTrend}>
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
                            <Area type="monotone" dataKey="days" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorDays)" animationDuration={2000} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* 7. RISK LEVEL BY ACCOUNT ID */}
                <div className="analytics-card">
                    <h4 className="analytics-card-title">RISK LEVEL BY ACCOUNT ID</h4>
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={stats.riskData} barSize={40}>
                            <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} vertical={false} />
                            <XAxis dataKey="name" stroke={CHART_THEME.text} fontSize={11} axisLine={false} tickLine={false} />
                            <YAxis stroke={CHART_THEME.text} fontSize={10} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="value">
                                {stats.riskData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={RISK_COLORS[entry.name] || '#3b82f6'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* 8. COUNT OF CARD USAGE */}
                <div className="analytics-card">
                    <h4 className="analytics-card-title">COUNT OF CARD USAGE</h4>
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={stats.cardData} barSize={50}>
                            <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} vertical={false} />
                            <XAxis dataKey="name" stroke={CHART_THEME.text} fontSize={11} axisLine={false} tickLine={false} />
                            <YAxis stroke={CHART_THEME.text} fontSize={10} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="count">
                                {stats.cardData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={CARD_COLORS[index % CARD_COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
            <style>{`
                .analytics-container {
                    padding-bottom: 40px;
                }
                .analytics-title {
                    margin-bottom: 24px;
                    font-size: 24px;
                    font-weight: 800;
                    background: linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .analytics-title::before {
                    content: '⚡';
                    font-size: 24px;
                    -webkit-text-fill-color: initial;
                    filter: drop-shadow(0 0 8px rgba(250, 204, 21, 0.5));
                }

                .analytics-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
                    gap: 24px;
                }

                .analytics-card {
                    background: rgba(15, 23, 42, 0.6);
                    backdrop-filter: blur(16px);
                    border: 1px solid rgba(255, 255, 255, 0.06);
                    border-radius: 20px;
                    padding: 24px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2);
                    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    animation: fadeInUp 0.8s ease-out backwards;
                }
                
                .analytics-card:nth-child(1) { animation-delay: 0.1s; }
                .analytics-card:nth-child(2) { animation-delay: 0.15s; }
                .analytics-card:nth-child(3) { animation-delay: 0.2s; }
                .analytics-card:nth-child(4) { animation-delay: 0.25s; }
                .analytics-card:nth-child(5) { animation-delay: 0.3s; }
                .analytics-card:nth-child(6) { animation-delay: 0.35s; }
                .analytics-card:nth-child(7) { animation-delay: 0.4s; }
                .analytics-card:nth-child(8) { animation-delay: 0.45s; }

                .analytics-card:hover {
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 0 15px rgba(59, 130, 246, 0.2);
                    border-color: rgba(59, 130, 246, 0.4);
                    transform: translateY(-6px);
                    background: rgba(30, 41, 59, 0.8);
                }

                .analytics-card-title {
                    font-size: 14px;
                    font-weight: 700;
                    color: #94a3b8;
                    margin-bottom: 24px;
                    text-transform: uppercase;
                    letter-spacing: 0.8px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
}
