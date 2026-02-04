import React, { useState, useEffect } from 'react';
import {
    Send, Phone, Bank, QrCode, CheckCircleFill, ClockHistory,
    ExclamationTriangle, ArrowRight, ShieldCheck
} from 'react-bootstrap-icons';

export default function Transfers() {
    const [mode, setMode] = useState('upi'); // upi, bank
    const [amount, setAmount] = useState('');
    const [recipient, setRecipient] = useState('');
    const [ifsc, setIfsc] = useState('');
    const [status, setStatus] = useState('idle'); // idle, processing, success
    const [recent, setRecent] = useState([
        { id: 1, name: 'Rahul Sharma', info: 'rahul@upi', amount: 1500, date: '2 hours ago', type: 'upi' },
        { id: 2, name: 'Aditya Birla', info: 'Acc: ...9921', amount: 12500, date: 'Yesterday', type: 'bank' },
        { id: 3, name: 'Priya Iyer', info: 'priya.i@okaxis', amount: 450, date: '3 Jan', type: 'upi' }
    ]);

    const handleTransfer = (e) => {
        e.preventDefault();
        if (!amount || !recipient) return;

        setStatus('processing');

        // Simulate network delay
        setTimeout(() => {
            setStatus('success');
            const newTransfer = {
                id: Date.now(),
                name: recipient.includes('@') ? recipient.split('@')[0] : recipient,
                info: recipient,
                amount: Number(amount),
                date: 'Just now',
                type: mode
            };
            setRecent([newTransfer, ...recent]);
        }, 2000);
    };

    const resetForm = () => {
        setStatus('idle');
        setAmount('');
        setRecipient('');
        setIfsc('');
    };

    if (status === 'success') {
        return (
            <main style={styles.container}>
                <div className="glass-card" style={styles.successCard}>
                    <div style={styles.successAnimation}>
                        <CheckCircleFill size={80} color="#10b981" />
                    </div>
                    <h2 style={{ fontSize: '32px', fontWeight: '800', margin: '20px 0 10px 0' }}>Transfer Successful!</h2>
                    <p style={{ color: '#94a3b8', fontSize: '18px', marginBottom: '30px' }}>
                        ₹{Number(amount).toLocaleString()} sent to {recipient}
                    </p>
                    <div style={styles.receiptLine}>
                        <span>Transaction ID</span>
                        <span style={{ color: '#fff' }}>#VJRA{Math.floor(Math.random() * 900000 + 100000)}</span>
                    </div>
                    <button onClick={resetForm} style={styles.primaryBtn}>Make Another Transfer</button>
                </div>
            </main>
        );
    }

    return (
        <main style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>Instant Transfers</h1>
                <p style={styles.subtitle}>Send money anywhere in India instantly, 24/7, with zero fees.</p>
            </div>

            <div style={styles.grid}>
                {/* TRANSFER FORM */}
                <div className="glass-card" style={styles.formCard}>
                    <div style={styles.modeTabs}>
                        <button
                            onClick={() => setMode('upi')}
                            style={{ ...styles.tab, ...(mode === 'upi' ? styles.activeTab : {}) }}
                        >
                            <Phone size={18} /> UPI Transfer
                        </button>
                        <button
                            onClick={() => setMode('bank')}
                            style={{ ...styles.tab, ...(mode === 'bank' ? styles.activeTab : {}) }}
                        >
                            <Bank size={18} /> Bank Transfer
                        </button>
                    </div>

                    <form onSubmit={handleTransfer} style={styles.form}>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>{mode === 'upi' ? 'UPI ID / Mobile Number' : 'Account Number'}</label>
                            <div style={styles.inputWrapper}>
                                <input
                                    type="text"
                                    required
                                    placeholder={mode === 'upi' ? 'e.g. name@upi' : 'e.g. 9876543210'}
                                    value={recipient}
                                    onChange={(e) => setRecipient(e.target.value)}
                                    style={styles.input}
                                />
                            </div>
                        </div>

                        {mode === 'bank' && (
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>IFSC Code</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. VAJR0000123"
                                    value={ifsc}
                                    onChange={(e) => setIfsc(e.target.value)}
                                    style={styles.input}
                                />
                            </div>
                        )}

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Amount (₹)</label>
                            <input
                                type="number"
                                required
                                min="1"
                                placeholder="0.00"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                style={{ ...styles.input, fontSize: '24px', fontWeight: '800', color: '#3b82f6' }}
                            />
                        </div>

                        <div style={styles.securityNote}>
                            <ShieldCheck size={16} color="#10b981" />
                            <span>Secure 256-bit encrypted transaction</span>
                        </div>

                        <button
                            type="submit"
                            disabled={status === 'processing'}
                            style={styles.primaryBtn}
                        >
                            {status === 'processing' ? 'Processing...' : 'Send Money Now'}
                        </button>
                    </form>
                </div>

                {/* RECENT TRANSFERS */}
                <div style={styles.recentSection}>
                    <div style={styles.listHeader}>
                        <ClockHistory />
                        <h3 style={{ margin: 0, fontSize: '18px', color: "white" }}>Recent Recipients</h3>
                    </div>

                    <div style={styles.recentList}>
                        {recent.map(item => (
                            <div key={item.id} className="glass-card" style={styles.recentItem} onClick={() => setRecipient(item.info)}>
                                <div style={styles.avatar}>
                                    {item.name.charAt(0)}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={styles.recentName}>{item.name}</p>
                                    <p style={styles.recentInfo}>{item.info}</p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={styles.recentAmount}>₹{item.amount.toLocaleString()}</p>
                                    <p style={styles.recentDate}>{item.date}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="glass-card" style={styles.transferLimit}>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <ExclamationTriangle color="#f59e0b" />
                            <div>
                                <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color:"white" }}>Daily Transfer Limit</p>
                                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>
                                    Your current daily limit is ₹2,00,000 for UPI transfers.
                                </p>
                            </div>
                        </div>
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
        gridTemplateColumns: 'minmax(400px, 1.2fr) 1fr',
        gap: '40px'
    },
    formCard: {
        background: 'rgba(12, 20, 44, 0.6)',
        backdropFilter: 'blur(10px)',
        padding: '32px',
        borderRadius: '24px',
        border: '1px solid rgba(255,255,255,0.08)'
    },
    modeTabs: {
        display: 'flex',
        background: 'rgba(0,0,0,0.2)',
        padding: '6px',
        borderRadius: '12px',
        marginBottom: '32px'
    },
    tab: {
        flex: 1,
        padding: '12px',
        border: 'none',
        background: 'none',
        color: '#94a3b8',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        transition: 'all 0.2s'
    },
    activeTab: {
        background: 'rgba(59, 130, 246, 0.1)',
        color: '#3b82f6',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
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
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.1)',
        padding: '16px',
        borderRadius: '12px',
        color: '#fff',
        fontSize: '16px',
        outline: 'none',
        width: '100%',
        boxSizing: 'border-box'
    },
    securityNote: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '12px',
        color: '#64748b',
        justifyContent: 'center'
    },
    primaryBtn: {
        background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
        border: 'none',
        color: '#fff',
        padding: '18px',
        borderRadius: '12px',
        fontSize: '16px',
        fontWeight: '700',
        cursor: 'pointer',
        boxShadow: '0 10px 20px -5px rgba(37, 99, 235, 0.4)',
        transition: 'transform 0.2s, box-shadow 0.2s'
    },
    recentSection: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
    },
    listHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        color: '#f8fafc'
    },
    recentList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
    },
    recentItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '16px',
        background: 'rgba(12, 20, 44, 0.4)',
        borderRadius: '16px',
        cursor: 'pointer',
        transition: 'all 0.2s'
    },
    avatar: {
        width: '44px',
        height: '44px',
        borderRadius: '12px',
        background: 'linear-gradient(135deg, #3b82f633, #7c3aed33)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '18px',
        fontWeight: '700',
        color: '#3b82f6',
        border: '1px solid rgba(59, 130, 246, 0.2)'
    },
    recentName: {
        margin: 0,
        fontSize: '15px',
        fontWeight: '700'
    },
    recentInfo: {
        margin: '2px 0 0 0',
        fontSize: '12px',
        color: '#64748b'
    },
    recentAmount: {
        margin: 0,
        fontSize: '14px',
        fontWeight: '700',
        color: '#10b981'
    },
    recentDate: {
        margin: '2px 0 0 0',
        fontSize: '11px',
        color: '#64748b'
    },
    transferLimit: {
        padding: '20px',
        background: 'rgba(245, 158, 11, 0.05)',
        border: '1px solid rgba(245, 158, 11, 0.1)',
        borderRadius: '16px'
    },
    successCard: {
        maxWidth: '500px',
        margin: '60px auto',
        padding: '60px 40px',
        textAlign: 'center',
        background: 'rgba(12, 20, 44, 0.6)'
    },
    successAnimation: {
        marginBottom: '30px',
        animation: 'bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
    },
    receiptLine: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '16px 0',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        marginBottom: '32px',
        fontSize: '14px',
        color: '#64748b'
    }
};
