import React, { useState } from 'react';
import {
    Building, Rocket, Briefcase, People, CashStack,
    TelephoneForward, CheckCircle
} from 'react-bootstrap-icons';

export default function Business() {
    const [showContact, setShowContact] = useState(false);

    return (
        <main style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>Vajra Business Solutions</h1>
                <p style={styles.subtitle}>Empowering India's entrepreneurs with next-gen corporate banking.</p>
            </div>

            {/* HERO SECTION */}
            <div className="glass-card" style={styles.heroCard}>
                <div style={styles.heroContent}>
                    <h2 style={styles.heroTitle}>
                        <span style={{ color: "white" }}>The Banking Partner Your Business Deserves</span>
                    </h2>
                    <p style={styles.heroDesc}>
                        From early-stage startups to established enterprises, we provide the financial infrastructure
                        to scale your operations globally. Zero hidden fees, infinite possibilities.
                    </p>
                    <div style={styles.heroStats}>
                        <div style={styles.statItem}>
                            <h3 style={{ color: "white" }}>50k+</h3>
                            <p>Business Clients</p>
                        </div>
                        <div style={styles.statItem}>
                            <h3 style={{ color: "white" }}>₹100Cr+</h3>
                            <p>Monthly Payroll</p>
                        </div>
                        <div style={styles.statItem}>
                            <h3 style={{ color: "white" }}>24/7</h3>
                            <p>RM Support</p>
                        </div>
                    </div>
                </div>
                <div style={styles.heroIcon}>
                    <Building size={160} color="rgba(59, 130, 246, 0.4)" />
                </div>
            </div>

            {/* SEGMENTS */}
            <div style={styles.segmentGrid}>
                <div className="glass-card" style={styles.segmentCard}>
                    <Rocket size={32} color="#bef280ff" />
                    <h3 style={styles.segmentTitle}><span style={{ color: "white" }}>Startups</span></h3>
                    <p style={styles.segmentDesc}>Incorporate, set up accounts, and get funded with zero paperwork.</p>
                    <ul style={styles.segmentList}>
                        <li><CheckCircle size={14} color="#10b981" /> No Minimum Balance</li>
                        <li><CheckCircle size={14} color="#10b981" /> Developer-first APIs</li>
                        <li><CheckCircle size={14} color="#10b981" /> Venture Debt Access</li>
                    </ul>
                </div>

                <div className="glass-card" style={styles.segmentCard}>
                    <Briefcase size={32} color="#3b82f6" />
                    <h3 style={styles.segmentTitle}><span style={{ color: "white" }}>SMEs</span></h3>
                    <p style={styles.segmentDesc}>Manage your cash flow and GST compliance like a pro.</p>
                    <ul style={styles.segmentList}>
                        <li><CheckCircle size={14} color="#10b981" /> Working Capital Loans</li>
                        <li><CheckCircle size={14} color="#10b981" /> Integrated Accounting</li>
                        <li><CheckCircle size={14} color="#10b981" /> Multi-user Access</li>
                    </ul>
                </div>

                <div className="glass-card" style={styles.segmentCard}>
                    <People size={32} color="#10b981" />
                    <h3 style={styles.segmentTitle}><span style={{ color: "white" }}>Enterprises</span></h3>
                    <p style={styles.segmentDesc}>Scale globally with advanced treasury and payroll solutions.</p>
                    <ul style={styles.segmentList}>
                        <li><CheckCircle size={14} color="#10b981" /> Bulk Payouts System</li>
                        <li><CheckCircle size={14} color="#10b981" /> Forex & Trade Finance</li>
                        <li><CheckCircle size={14} color="#10b981" /> Custom ERP Integration</li>
                    </ul>
                </div>
            </div>

            {/* FEATURE SECTION */}
            <div style={styles.featureSection}>
                <h2 style={styles.sectionTitle}><span style={{ color: "white" }}>Built for High-Growth Teams</span></h2>
                <div style={styles.featureGrid}>
                    <div style={styles.featureItem}>
                        <div style={styles.featureIcon}><CashStack /></div>
                        <div>
                            <h4 style={styles.featureName}><span style={{ color: "white" }}>Automated Payroll</span></h4>
                            <p style={styles.featureText}>Run salaries, compliance (PF/ESIC), and taxes in just two clicks.</p>
                        </div>
                    </div>
                    <div style={styles.featureItem}>
                        <div style={styles.featureIcon}><People /></div>
                        <div>
                            <h4 style={styles.featureName}><span style={{ color: "white" }}>Vendor Payments</span></h4>
                            <p style={styles.featureText}>Schedule bulk payments to thousand of vendors instantly.</p>
                        </div>
                    </div>
                    <div style={styles.featureItem}>
                        <div style={styles.featureIcon}><Rocket /></div>
                        <div>
                            <h4 style={styles.featureName}><span style={{ color: "white" }}>Business Loans</span></h4>
                            <p style={styles.featureText}>Unsecured credit lines up to ₹50 Lakhs for eligible businesses.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA */}
            <div className="glass-card" style={styles.ctaCard}>
                <div>
                    <h3 style={{ margin: 0, fontSize: '24px', color: 'white' }}>Ready to transform your business?</h3>
                    <p style={{ color: '#94a3b8', margin: '8px 0 0 0' }}>Our relationship managers are standing by.</p>
                </div>
                <button style={styles.ctaBtn} onClick={() => setShowContact(true)}>
                    <TelephoneForward /> Contact Relationship Manager
                </button>
            </div>

            {/* CONTACT MODAL (NEW) */}
            {showContact && (
                <div style={styles.overlay} onClick={() => setShowContact(false)}>
                    <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <h3 style={{ marginBottom: '12px', color: 'white' }}>Relationship Manager</h3>
                        <p style={{ color: '#94a3b8', marginBottom: '20px' }}>
                            Reach out to your dedicated business support
                        </p>

                        <div style={styles.contactItem}>
                            📞 <strong>6300608164</strong>
                        </div>
                        <div style={styles.contactItem}>
                            ✉️ <strong>mahesh@gmail.com</strong>
                        </div>

                        <button style={styles.closeBtn} onClick={() => setShowContact(false)}>
                            Close
                        </button>
                    </div>
                </div>
            )}
        </main>
    );
}

const styles = {
    /* EXISTING STYLES — UNCHANGED */
    container: { maxWidth: '1200px', margin: '0 auto', padding: '60px 20px', color: '#fff' },
    header: { textAlign: 'center', marginBottom: '50px' },
    title: { fontSize: '36px', fontWeight: '800', marginBottom: '10px', background: 'linear-gradient(135deg, #fff 0%, #94a3b8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
    subtitle: { color: '#94a3b8', fontSize: '18px' },
    heroCard: { background: 'rgba(12, 20, 44, 0.6)', backdropFilter: 'blur(10px)', padding: '50px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' },
    heroContent: { maxWidth: '600px', position: 'relative', zIndex: 1 },
    heroTitle: { fontSize: '32px', fontWeight: '800', marginBottom: '20px', lineHeight: '1.2' },
    heroDesc: { fontSize: '18px', color: '#94a3b8', lineHeight: '1.6', marginBottom: '40px' },
    heroStats: { display: 'flex', gap: '40px' },
    statItem: { textAlign: 'left' },
    heroIcon: { position: 'absolute', right: '40px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 },
    segmentGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '30px', marginBottom: '80px' },
    segmentCard: { padding: '40px 30px', borderRadius: '24px', background: 'rgba(12, 20, 44, 0.6)', border: '1px solid rgba(255,255,255,0.08)' },
    segmentTitle: { fontSize: '22px', fontWeight: '700', margin: '20px 0 10px 0' },
    segmentDesc: { fontSize: '14px', color: '#94a3b8', lineHeight: '1.6', marginBottom: '24px' },
    segmentList: { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' },
    featureSection: { marginBottom: '80px' },
    sectionTitle: { fontSize: '28px', fontWeight: '800', textAlign: 'center', marginBottom: '40px' },
    featureGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px' },
    featureItem: { display: 'flex', gap: '20px' },
    featureIcon: { width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6', fontSize: '20px' },
    featureName: { fontSize: '18px', fontWeight: '700', margin: '0 0 8px 0' },
    featureText: { fontSize: '14px', color: '#94a3b8', lineHeight: '1.5', margin: 0 },
    ctaCard: { padding: '40px', background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.1), rgba(124, 58, 237, 0.1))', borderRadius: '24px', border: '1px solid rgba(59, 130, 246, 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    ctaBtn: { background: '#fff', color: '#0f172a', border: 'none', padding: '16px 32px', borderRadius: '12px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' },

    /* NEW STYLES (ONLY FOR MODAL) */
    overlay: {
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999,
        animation: 'fadeIn 0.3s ease'
    },
    modal: {
        background: '#020617',
        borderRadius: '20px',
        padding: '32px',
        width: '360px',
        textAlign: 'center',
        boxShadow: '0 30px 60px rgba(0,0,0,0.6)',
        animation: 'scaleIn 0.3s ease'
    },
    contactItem: {
        background: '#0b1224',
        padding: '14px',
        borderRadius: '12px',
        marginBottom: '12px',
        fontSize: '15px'
    },
    closeBtn: {
        marginTop: '16px',
        background: 'linear-gradient(135deg,#2563eb,#7c3aed)',
        border: 'none',
        padding: '12px',
        width: '100%',
        borderRadius: '12px',
        color: '#fff',
        fontWeight: '700',
        cursor: 'pointer'
    }
};
