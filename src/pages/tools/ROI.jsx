import React, { useState, useMemo } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { InfoCircle, Calculator, GraphUp, ArrowRight } from 'react-bootstrap-icons';

export default function ROI() {
    const [amount, setAmount] = useState(100000);
    const [rate, setRate] = useState(12);
    const [years, setYears] = useState(10);
    const [frequency, setFrequency] = useState(1); // 1 = Annual, 12 = Monthly

    const results = useMemo(() => {
        const f = Number(frequency);
        const r = (rate / 100) / f;
        const n = years * f;
        const maturity = amount * Math.pow(1 + r, n);
        const profit = maturity - amount;

        // Generate chart data
        const data = [];
        for (let i = 0; i <= years; i++) {
            const yearMaturity = amount * Math.pow(1 + r, i * f);
            data.push({
                year: `Year ${i}`,
                investment: amount,
                growth: Math.round(yearMaturity - amount),
                total: Math.round(yearMaturity)
            });
        }

        return {
            maturity: Math.round(maturity),
            profit: Math.round(profit),
            data
        };
    }, [amount, rate, years, frequency]);

    return (
        <main style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>Return on Investment (ROI) Calculator</h1>
                <p style={styles.subtitle}>Plan your wealth growth with our precision compounding engine.</p>
            </div>

            <div style={styles.grid}>
                {/* INPUTS */}
                <div className="glass-card" style={styles.inputCard}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Investment Amount (₹)</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(Number(e.target.value))}
                            style={styles.input}
                        />
                        <input
                            type="range"
                            min="5000"
                            max="10000000"
                            step="5000"
                            value={amount}
                            onChange={(e) => setAmount(Number(e.target.value))}
                            style={styles.range}
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Annual Interest Rate (%)</label>
                        <input
                            type="number"
                            value={rate}
                            onChange={(e) => setRate(Number(e.target.value))}
                            style={styles.input}
                        />
                        <input
                            type="range"
                            min="1"
                            max="30"
                            step="0.1"
                            value={rate}
                            onChange={(e) => setRate(Number(e.target.value))}
                            style={styles.range}
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Time Period (Years)</label>
                        <input
                            type="number"
                            max="40"
                            value={years}
                            onChange={(e) => setYears(Number(e.target.value))}
                            style={styles.input}
                        />
                        <input
                            type="range"
                            min="1"
                            max="40"
                            value={years}
                            onChange={(e) => setYears(Number(e.target.value))}
                            style={styles.range}
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Compounding Frequency</label>
                        <select
                            value={frequency}
                            onChange={(e) => setFrequency(Number(e.target.value))}
                            style={styles.select}
                        >
                            <option value={1}>Annually</option>
                            <option value={2}>Half-Yearly</option>
                            <option value={4}>Quarterly</option>
                            <option value={12}>Monthly</option>
                        </select>
                    </div>
                </div>

                {/* RESULTS & CHART */}
                <div style={styles.resultsColumn}>
                    <div style={styles.summaryGrid}>
                        <div className="glass-card" style={{ ...styles.summaryCard, borderLeft: '4px solid #d9ebe5ff'}}>
                            <p style={styles.summaryLabel}>Total Investment</p>
                            <h2 style={{ ...styles.summaryValue, color: '#f6f8fbff' }}> ₹{amount.toLocaleString()}</h2>
                        </div>
                        <div className="glass-card" style={{ ...styles.summaryCard, borderLeft: '4px solid #10b981' }}>
                            <p style={styles.summaryLabel}>Estimated Growth</p>
                            <h2 style={{ ...styles.summaryValue, color: '#10b981' }}>₹{results.profit.toLocaleString()}</h2>
                        </div>
                        <div className="glass-card" style={{ ...styles.summaryCard, borderLeft: '4px solid #3b82f6' }}>
                            <p style={styles.summaryLabel}>Total Maturity</p>
                            <h2 style={{ ...styles.summaryValue, color: '#3b82f6', fontSize: '32px' }}>₹{results.maturity.toLocaleString()}</h2>
                        </div>
                    </div>

                    <div className="glass-card" style={styles.chartCard}>
                        <h3 style={styles.chartTitle}>Wealth Growth Perspective</h3>
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <AreaChart data={results.data}>
                                    <defs>
                                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                    <XAxis dataKey="year" stroke="#94a3b8" fontSize={12} tickLine={false} />
                                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} tickFormatter={(val) => `₹${val / 1000}k`} />
                                    <Tooltip
                                        contentStyle={{ background: '#0f172a', border: '1px solid #1f2f4aff', borderRadius: '8px' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Area type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="glass-card" style={styles.insightCard}>
                        <div style={styles.insightHeader}>
                            <GraphUp style={{ color: '#10b981' }} size={20} />
                            <h4 style={{ margin: 0, fontSize: '16px' }}>Financial Insights</h4>
                        </div>
                        <p style={styles.insightText}>
                            Did you know? By extending your investment by just 5 extra years, your maturity amount could increase by approximately
                            <span style={{ color: '#10b981', fontWeight: 'bold' }}> ₹{Math.round(amount * Math.pow(1 + (rate / 100), years + 5) - results.maturity).toLocaleString()}</span> due to the power of compounding.
                            Time is your greatest ally in wealth creation.
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}

const styles = {
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '60px 20px',
        color: '#fff'
    },
    header: {
        textAlign: 'center',
        marginBottom: '50px'
    },
    title: {
        fontSize: '36px',
        fontWeight: '800',
        marginBottom: '10px',
        background: 'linear-gradient(135deg, #fff 0%, #94a3b8 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
    },
    subtitle: {
        color: '#94a3b8',
        fontSize: '18px'
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: '1fr 2fr',
        gap: '30px'
    },
    inputCard: {
        background: 'rgba(12, 20, 44, 0.6)',
        backdropFilter: 'blur(10px)',
        padding: '30px',
        borderRadius: '20px',
        border: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        height: 'fit-content'
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
    },
    label: {
        fontSize: '14px',
        color: '#94a3b8',
        fontWeight: '600'
    },
    input: {
        background: 'rgba(0,0,0,0.2)',
        border: '1px solid rgba(255,255,255,0.1)',
        padding: '12px 16px',
        borderRadius: '10px',
        color: '#fff',
        fontSize: '18px',
        fontWeight: '700',
        outline: 'none'
    },
    select: {
        background: 'rgba(0,0,0,0.2)',
        border: '1px solid rgba(255,255,255,0.1)',
        padding: '12px 16px',
        borderRadius: '10px',
        color: '#fff',
        fontSize: '16px',
        outline: 'none',
        cursor: 'pointer'
    },
    range: {
        width: '100%',
        accentColor: '#3b82f6',
        cursor: 'pointer'
    },
    resultsColumn: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
    },
    summaryGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '16px'
    },
    summaryCard: {
        padding: '20px',
        background: 'rgba(12, 20, 44, 0.6)',
        borderRadius: '16px',
        textAlign: 'center'
    },
    summaryLabel: {
        fontSize: '12px',
        color: '#94a3b8',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        marginBottom: '8px'
    },
    summaryValue: {
        margin: 0,
        fontSize: '24px',
        fontWeight: '800'
    },
    chartCard: {
        padding: '30px',
        background: 'rgba(12, 20, 44, 0.6)',
        borderRadius: '20px',
        border: '1px solid rgba(255,255,255,0.08)'
    },
    chartTitle: {
        fontSize: '18px',
        fontWeight: '700',
        marginBottom: '24px',
        color: '#f8fafc'
    },
    insightCard: {
        padding: '24px',
        background: 'rgba(16, 185, 129, 0.05)',
        borderRadius: '16px',
        border: '1px solid rgba(16, 185, 129, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
    },
    insightHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
    },
    insightText: {
        fontSize: '14px',
        color: '#94a3b8',
        lineHeight: '1.6',
        margin: 0
    }
};
