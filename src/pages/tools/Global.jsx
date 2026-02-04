import React, { useState, useMemo } from 'react';
import {
    Globe, CashStack, Clock, ShieldCheck,
    ArrowLeftRight, InfoCircle, Airplane
} from 'react-bootstrap-icons';

export default function Global() {
    const [inrAmount, setInrAmount] = useState(100000);
    const [currency, setCurrency] = useState('USD');

    const rates = {
        USD: 0.012,
        EUR: 0.011,
        GBP: 0.0094,
        AED: 0.044,
        SGD: 0.016
    };

    const countries = [
        { name: 'USA', flag: '🇺🇸', currency: 'USD', time: '1-2 Days', fee: '₹500' },
        { name: 'UK', flag: '🇬🇧', currency: 'GBP', time: 'Instant', fee: '₹0' },
        { name: 'UAE', flag: '🇦🇪', currency: 'AED', time: '4 Hours', fee: '₹250' },
        { name: 'Europe', flag: '🇪🇺', currency: 'EUR', time: '1 Day', fee: '₹400' },
        { name: 'Singapore', flag: '🇸🇬', currency: 'SGD', time: 'Instant', fee: '₹0' }
    ];

    const converted = useMemo(() => {
        return (inrAmount * rates[currency]).toFixed(2);
    }, [inrAmount, currency]);

    return (
        <main style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>Global Banking & Forex</h1>
                <p style={styles.subtitle}>Borderless banking for the modern global citizen.</p>
            </div>

            <div style={styles.grid}>
                {/* RATE CALCULATOR */}
                <div className="glass-card" style={styles.calcCard}>
                    <div style={styles.calcHeader}>
                        <ArrowLeftRight size={24} color="#3b82f6" />
                        <h3 style={{ margin: 0, color:"white" }}>Exchange Rate Calculator</h3>
                    </div>

                    <div style={styles.calcBody}>
                        <div style={styles.inputBox}>
                            <label style={styles.label}>You send from India (INR)</label>
                            <div style={styles.inputContainer}>
                                <span style={styles.prefix}>₹</span>
                                <input
                                    type="number"
                                    value={inrAmount}
                                    onChange={(e) => setInrAmount(e.target.value)}
                                    style={styles.input}
                                />
                            </div>
                        </div>

                        <div style={styles.divider}>
                            <div style={styles.line} />
                            <div style={styles.rateBadge}>1 INR = {rates[currency]} {currency}</div>
                            <div style={styles.line} />
                        </div>

                        <div style={styles.inputBox}>
                            <label style={styles.label}>Recipient gets in {currency}</label>
                            <div style={styles.inputContainer}>
                                <select
                                    value={currency}
                                    onChange={(e) => setCurrency(e.target.value)}
                                    style={styles.select}
                                >
                                    {Object.keys(rates).map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <input
                                    type="text"
                                    readOnly
                                    value={converted}
                                    style={{ ...styles.input, color: '#10b981' }}
                                />
                            </div>
                        </div>

                        <div style={styles.feeBreakdown}>
                            <div style={styles.feeRow}>
                                <span>Transfer Fee</span>
                                <span style={{ color: '#10b981' }}>₹0 (Zero Fee promotion)</span>
                            </div>
                            <div style={styles.feeRow}>
                                <span>Exchange Rate</span>
                                <span>Standard Mid-Market</span>
                            </div>
                        </div>

                        {/* <button style={styles.primaryBtn}>Initialize Global Transfer</button> */}
                    </div>
                </div>

                {/* DETAILS SECTION */}
                <div style={styles.detailsColumn}>
                    <div className="glass-card" style={styles.countryList}>
                        <h4 style={styles.sectionTitle}> <span style={{ color: "white" }}>Supported Corridors</span></h4>
                        {countries.map(c => (
                            <div key={c.name} style={styles.countryItem}>
                                <div style={styles.countryInfo}>
                                    <span style={styles.flag}>{c.flag}</span>
                                    <div>
                                        <p style={styles.countryName}>{c.name}</p>
                                        <p style={styles.countrySub}>{c.currency} Corridor</p>
                                    </div>
                                </div>
                                <div style={styles.countryMeta}>
                                    <span style={styles.timeTag}><Clock size={12} /> {c.time}</span>
                                    <span style={styles.feeTag}>{c.fee} fee</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="glass-card" style={styles.securityFeature}>
                        <ShieldCheck size={28} color="#10b981" />
                        <div>
                            <h5 style={{ margin: '0 0 5px 0' }}>FEMA Compliant</h5>
                            <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>
                                All international transfers through VajraBank strictly adhere to RBI and FEMA regulations.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ADDITIONAL HIGHLIGHTS */}
            <div style={styles.highlightSection}>
                <div className="glass-card" style={styles.highlightCard}>
                    <Globe size={40} color="#3b82f6" />
                    <h3 style={{color:"white"}}>Multi-Currency Accounts</h3>
                    <p>Hold, manage, and spend in 10+ major global currencies without additional conversion fees.</p>
                </div>
                <div className="glass-card" style={styles.highlightCard}>
                    <Airplane size={40} color="#8b5cf6" />
                    <h3 style={{color:"white"}}>Waitless Forex</h3>
                    <p>Order physical currency or reload your Forex card instantly through the mobile app.</p>
                </div>
                <div className="glass-card" style={styles.highlightCard}>
                    <InfoCircle size={40} color="#10b981" />
                    <h3 style={{color:"white"}}>Global Assistance</h3>
                    <p>24/7 dedicated international concierge service for all your travel and banking needs.</p>
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
        gridTemplateColumns: 'minmax(450px, 1.2fr) 1fr',
        gap: '40px',
        marginBottom: '60px'
    },
    calcCard: {
        background: 'rgba(12, 20, 44, 0.6)',
        backdropFilter: 'blur(10px)',
        padding: '32px',
        borderRadius: '24px',
        border: '1px solid rgba(255,255,255,0.08)'
    },
    calcHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '32px'
    },
    inputBox: {
        background: 'rgba(0,0,0,0.2)',
        padding: '20px',
        borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.05)'
    },
    label: {
        fontSize: '13px',
        color: '#94a3b8',
        marginBottom: '12px',
        display: 'block'
    },
    inputContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px'
    },
    prefix: {
        fontSize: '24px',
        fontWeight: '700',
        color: '#94a3b8'
    },
    input: {
        background: 'none',
        border: 'none',
        color: '#fff',
        fontSize: '28px',
        fontWeight: '700',
        outline: 'none',
        width: '100%'
    },
    divider: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        margin: '20px 0'
    },
    line: {
        flex: 1,
        height: '1px',
        background: 'rgba(255,255,255,0.05)'
    },
    rateBadge: {
        fontSize: '11px',
        fontWeight: '800',
        padding: '6px 12px',
        background: 'rgba(59, 130, 246, 0.1)',
        color: '#3b82f6',
        borderRadius: '20px',
        whiteSpace: 'nowrap',
        border: '1px solid rgba(59, 130, 246, 0.2)'
    },
    select: {
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        color: '#fff',
        padding: '8px 12px',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: '700',
        outline: 'none'
    },
    feeBreakdown: {
        marginTop: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '0 10px'
    },
    feeRow: {
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '14px',
        color: '#94a3b8'
    },
    primaryBtn: {
        width: '100%',
        marginTop: '32px',
        background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
        border: 'none',
        color: '#fff',
        padding: '18px',
        borderRadius: '12px',
        fontSize: '16px',
        fontWeight: '700',
        cursor: 'pointer'
    },
    detailsColumn: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
    },
    countryList: {
        padding: '24px',
        background: 'rgba(12, 20, 44, 0.6)',
        borderRadius: '24px'
    },
    sectionTitle: {
        fontSize: '18px',
        fontWeight: '700',
        marginBottom: '20px'
    },
    countryItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 0',
        borderBottom: '1px solid rgba(255,255,255,0.05)'
    },
    countryInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
    },
    flag: {
        fontSize: '24px'
    },
    countryName: {
        margin: 0,
        fontWeight: '700',
        fontSize: '15px'
    },
    countrySub: {
        margin: 0,
        fontSize: '12px',
        color: '#64748b'
    },
    countryMeta: {
        textAlign: 'right',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
    },
    timeTag: {
        fontSize: '11px',
        color: '#94a3b8',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        justifyContent: 'flex-end'
    },
    feeTag: {
        fontSize: '11px',
        fontWeight: '700',
        color: '#10b981'
    },
    securityFeature: {
        padding: '20px',
        display: 'flex',
        gap: '16px',
        alignItems: 'center',
        background: 'rgba(16, 185, 129, 0.05)',
        border: '1px solid rgba(16, 185, 129, 0.1)',
        borderRadius: '20px'
    },
    highlightSection: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '30px'
    },
    highlightCard: {
        padding: '32px',
        textAlign: 'center',
        background: 'rgba(12, 20, 44, 0.4)',
        borderRadius: '24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '15px'
    }
};
