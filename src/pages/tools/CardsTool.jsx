import React, { useState, useEffect } from 'react';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import CardVisual from '../../components/user/CardVisual';
import {
    ShieldLock, ShieldCheck, PlusCircle, InfoCircle, StarFill,
    X, Wallet2, GraphUp, ShieldShaded, LockFill
} from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';

export default function CardsTool() {
    const { currentUser, updateUserProfile } = useCurrentUser();
    const navigate = useNavigate();
    const [selectedCard, setSelectedCard] = useState(null);
    const [loading, setLoading] = useState(false);

    // Mock cards matched to user or demo
    const cards = [
        {
            id: "primary",
            name: currentUser?.cardType || "Vajra Platinum",
            type: "Credit",
            number: currentUser?.cardId || "4532 1211 8842 1024",
            holder: currentUser?.fullName || "AUTHORIZED USER",
            expiry: "12/28",
            isBlocked: currentUser?.isBlocked || false,
            benefits: ["5% Unlimited Cashback", "Airport Lounge Access", "Zero Forex Markup"],
            limits: { daily: "₹2,00,000", monthly: "₹10,00,000" }
        },
        {
            id: "secondary",
            name: "Vajra Gold",
            type: "Debit",
            number: "5421 8890 1024 9921",
            holder: currentUser?.fullName || "AUTHORIZED USER",
            expiry: "08/29",
            isBlocked: false,
            benefits: ["2% Rewards on Fuel", "Dining Discounts", "Fraud Liability Cover"],
            limits: { daily: "₹50,000", monthly: "₹2,00,000" }
        }
    ];

    const handleFreezeToggle = async (card) => {
        if (card.id !== "primary") {
            alert("Only primary card can be managed in demo mode.");
            return;
        }
        setLoading(true);
        try {
            await updateUserProfile({ isBlocked: !card.isBlocked });
        } catch (err) {
            console.error("Freeze failed", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>Card Management Suite</h1>
                <p style={styles.subtitle}>Full control over your physical and virtual cards with military-grade security.</p>
            </div>

            <div style={styles.grid}>
                {/* CARD LIST */}
                <div style={styles.cardList}>
                    {cards.map((card) => (
                        <div key={card.id} className="glass-card" style={styles.cardWrapper}>
                            <div style={styles.visualSection}>
                                <CardVisual
                                    type={card.name}
                                    number={card.number}
                                    holder={card.holder}
                                    expiry={card.expiry}
                                    blocked={card.isBlocked}
                                />
                            </div>

                            <div style={styles.infoSection}>
                                <div style={styles.cardHeader}>
                                    <div>
                                        <h3 style={styles.cardTitle}>{card.name}</h3>
                                        <p style={styles.cardTypeLabel}>{card.type} Card</p>
                                    </div>
                                    <span style={{
                                        ...styles.statusBadge,
                                        background: card.isBlocked ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                                        color: card.isBlocked ? '#ff5f5f' : '#10b981',
                                        border: `1px solid ${card.isBlocked ? '#ef444455' : '#10b98155'}`
                                    }}>
                                        {card.isBlocked ? 'FROZEN' : 'ACTIVE'}
                                    </span>
                                </div>

                                <div style={styles.benefitsList}>
                                    {card.benefits.map((b, i) => (
                                        <div key={i} style={styles.benefitItem}>
                                            <StarFill size={10} color="#f59e0b" />
                                            <span>{b}</span>
                                        </div>
                                    ))}
                                </div>

                                <div style={styles.actions}>
                                    <button
                                        onClick={() => handleFreezeToggle(card)}
                                        disabled={loading}
                                        style={{
                                            ...styles.actionBtn,
                                            color: card.isBlocked ? '#10b981' : '#ef4444',
                                            borderColor: card.isBlocked ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'
                                        }}
                                    >
                                        {card.isBlocked ? <ShieldCheck /> : <ShieldLock />}
                                        {card.isBlocked ? 'Unfreeze' : 'Freeze Card'}
                                    </button>
                                    <button style={styles.actionBtn} onClick={() => setSelectedCard(card)}>
                                        <InfoCircle />
                                        View Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    <div
                        className="glass-card"
                        style={styles.applyCard}
                        onClick={() => navigate(currentUser ? '/user/cards' : '/login')}
                    >
                        <PlusCircle size={32} color="#3b82f6" />
                        <h3 style={{ margin: '12px 0 4px 0', fontSize: '18px', color: "white" }}>Apply for a New Card</h3>
                        <p style={{ color: '#94a3b8', fontSize: '13px' }}>Boost your spending power with Vajra Infinite</p>
                    </div>
                </div>

                {/* SIDEBAR */}
                <div style={styles.sidebar}>
                    <div className="glass-card" style={styles.securityBox}>
                        <div style={styles.securityHeader}>
                            <ShieldShaded size={24} color="#10b981" />
                            <h4 style={{ margin: 0 }}>Vajra Guardian™</h4>
                        </div>
                        <p style={styles.securityText}>
                            Your assets are protected by real-time AI monitoring. Any unusual activity triggers an instant freeze.
                        </p>
                        <ul style={styles.securityList}>
                            <li><LockFill size={12} /> 256-bit encryption</li>
                            <li><LockFill size={12} /> Zero Liability Policy</li>
                            <li><LockFill size={12} /> 24/7 Fraud Support</li>
                        </ul>
                    </div>

                    <div className="glass-card" style={styles.promoCard}>
                        <GraphUp size={24} color="#3b82f6" style={{ marginBottom: '15px' }} />
                        <h4 style={{ margin: '0 0 10px 0', fontSize: '16px', color: "white" }}>Manage Limits</h4>
                        <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.5' }}>
                            Adjust your daily ATM and POS limits instantly to control your spending habits.
                        </p>
                        <button style={styles.secondaryBtn} onClick={() => setSelectedCard(cards[0])}>Set Limits</button>
                    </div>
                </div>
            </div>

            {/* DETAILS MODAL */}
            {selectedCard && (
                <div style={styles.modalOverlay} onClick={() => setSelectedCard(null)}>
                    <div className="glass-card" style={styles.modal} onClick={e => e.stopPropagation()}>
                        <button style={styles.closeBtn} onClick={() => setSelectedCard(null)}><X size={24} /></button>

                        <div style={styles.modalHeader}>
                            <h2 style={{ margin: 0 }}>{selectedCard.name}</h2>
                            <p style={{ color: '#94a3b8', margin: '5px 0' }}>Detailed overview & settings</p>
                        </div>

                        <div style={styles.modalContent}>
                            <div style={styles.detailSection}>
                                <h4 style={styles.sectionTitle}>Spending Limits</h4>
                                <div style={styles.limitRow}>
                                    <span>Daily Limit</span>
                                    <span style={styles.limitVal}>{selectedCard.limits.daily}</span>
                                </div>
                                <div style={styles.limitRow}>
                                    <span>Monthly Limit</span>
                                    <span style={styles.limitVal}>{selectedCard.limits.monthly}</span>
                                </div>
                            </div>

                            <div style={styles.detailSection}>
                                <h4 style={styles.sectionTitle}>Card Benefits</h4>
                                <div style={styles.benefitGrid}>
                                    {selectedCard.benefits.map((b, i) => (
                                        <div key={i} style={styles.benefitTag}>{b}</div>
                                    ))}
                                    <div style={styles.benefitTag}>Purchase Protection</div>
                                    <div style={styles.benefitTag}>Global Acceptance</div>
                                </div>
                            </div>

                            <div style={styles.securitySettings}>
                                <h4 style={styles.sectionTitle}>Security Controls</h4>
                                <label style={styles.toggleRow}>
                                    <span>Online Transactions</span>
                                    <input type="checkbox" defaultChecked />
                                </label>
                                <label style={styles.toggleRow}>
                                    <span>International Usage</span>
                                    <input type="checkbox" defaultChecked />
                                </label>
                                <label style={styles.toggleRow}>
                                    <span>Contactless (NFC)</span>
                                    <input type="checkbox" defaultChecked />
                                </label>
                            </div>
                        </div>

                        <button style={styles.primaryBtn} onClick={() => setSelectedCard(null)}>Save Settings</button>
                    </div>
                </div>
            )}
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
        fontSize: '18px',
        maxWidth: '600px',
        margin: '0 auto'
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: '1fr 350px',
        gap: '40px'
    },
    cardList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '30px'
    },
    cardWrapper: {
        background: 'rgba(15, 23, 42, 0.4)',
        backdropFilter: 'blur(20px)',
        padding: '30px',
        borderRadius: '28px',
        border: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        gap: '40px',
        alignItems: 'center',
        transition: 'transform 0.3s ease'
    },
    visualSection: {
        flexShrink: 0,
        boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5)'
    },
    infoSection: {
        flex: 1
    },
    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '20px'
    },
    cardTitle: {
        fontSize: '24px',
        fontWeight: '800',
        margin: 0,
        color: '#f8fafc'
    },
    cardTypeLabel: {
        margin: '4px 0 0 0',
        fontSize: '12px',
        color: '#64748b',
        textTransform: 'uppercase',
        letterSpacing: '1px'
    },
    statusBadge: {
        fontSize: '11px',
        fontWeight: '900',
        padding: '6px 12px',
        borderRadius: '8px',
        letterSpacing: '1.5px'
    },
    benefitsList: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '28px'
    },
    benefitItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '13px',
        color: '#cbd5e1',
        background: 'rgba(255,255,255,0.03)',
        padding: '4px 10px',
        borderRadius: '6px'
    },
    actions: {
        display: 'flex',
        gap: '16px'
    },
    actionBtn: {
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.1)',
        padding: '12px 20px',
        borderRadius: '12px',
        color: '#fff',
        fontSize: '14px',
        fontWeight: '700',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        transition: 'all 0.2s',
        outline: 'none'
    },
    applyCard: {
        background: 'rgba(59, 130, 246, 0.02)',
        border: '2px dashed rgba(59, 130, 246, 0.2)',
        borderRadius: '28px',
        padding: '50px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.3s'
    },
    sidebar: {
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
    },
    securityBox: {
        padding: '30px',
        background: 'rgba(16, 185, 129, 0.03)',
        border: '1px solid rgba(16, 185, 129, 0.1)',
        borderRadius: '24px'
    },
    securityHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '15px'
    },
    securityText: {
        fontSize: '14px',
        color: '#94a3b8',
        lineHeight: '1.6',
        margin: '0 0 20px 0'
    },
    securityList: {
        listStyle: 'none',
        padding: 0,
        margin: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        fontSize: '13px',
        color: '#cbd5e1'
    },
    promoCard: {
        padding: '24px',
        background: 'rgba(12, 20, 44, 0.6)',
        borderRadius: '24px',
        border: '1px solid rgba(255,255,255,0.05)'
    },
    secondaryBtn: {
        width: '100%',
        marginTop: '20px',
        background: 'rgba(59, 130, 246, 0.1)',
        border: '1px solid rgba(59, 130, 246, 0.2)',
        color: '#3b82f6',
        padding: '12px',
        borderRadius: '10px',
        fontSize: '14px',
        fontWeight: '700',
        cursor: 'pointer'
    },
    modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
    },
    modal: {
        width: '100%',
        maxWidth: '500px',
        padding: '40px',
        background: '#0f172a',
        borderRadius: '32px',
        position: 'relative',
        border: '1px solid rgba(255,255,255,0.1)',
        animation: 'modalSlide 0.3s ease-out'
    },
    closeBtn: {
        position: 'absolute',
        top: '20px',
        right: '20px',
        background: 'none',
        border: 'none',
        color: '#64748b',
        cursor: 'pointer'
    },
    modalHeader: {
        marginBottom: '32px'
    },
    modalContent: {
        display: 'flex',
        flexDirection: 'column',
        gap: '30px',
        marginBottom: '40px'
    },
    sectionTitle: {
        fontSize: '14px',
        color: '#3b82f6',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        margin: '0 0 15px 0'
    },
    limitRow: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '12px 0',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        fontSize: '15px'
    },
    limitVal: {
        fontWeight: '700',
        color: '#fff'
    },
    benefitGrid: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '10px'
    },
    benefitTag: {
        background: 'rgba(255,255,255,0.05)',
        padding: '6px 14px',
        borderRadius: '20px',
        fontSize: '12px',
        color: '#cbd5e1'
    },
    toggleRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        margin: '10px 0',
        fontSize: '15px'
    },
    primaryBtn: {
        width: '100%',
        background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
        border: 'none',
        color: '#fff',
        padding: '18px',
        borderRadius: '16px',
        fontSize: '16px',
        fontWeight: '700',
        cursor: 'pointer'
    }
};
