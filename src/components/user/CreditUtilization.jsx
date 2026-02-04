import React, { useEffect, useState } from 'react';
import { InfoCircle } from 'react-bootstrap-icons';

const CreditUtilization = ({ used, limit }) => {
    const [progress, setProgress] = useState(0);
    const utilization = limit > 0 ? (used / limit) * 100 : 0;
    const cappedUtilization = Math.min(100, Math.max(0, utilization));

    // Animation effect on load
    useEffect(() => {
        const timer = setTimeout(() => {
            setProgress(cappedUtilization);
        }, 100);
        return () => clearTimeout(timer);
    }, [cappedUtilization]);

    const getStatusLabel = (val) => {
        if (val <= 30) return { label: 'Excellent', color: '#10b981' };
        if (val <= 50) return { label: 'Good', color: '#3b82f6' };
        if (val <= 75) return { label: 'High Usage', color: '#f59e0b' };
        return { label: 'Critical', color: '#ef4444' };
    };

    const status = getStatusLabel(utilization);
    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress / 100) * circumference;

    if (!limit || limit === 0) {
        return (
            <div className="glass-card-metrics" style={styles.emptyCard}>
                <div style={styles.emptyIcon}>💳</div>
                <h4 style={styles.emptyTitle}>No active credit card yet</h4>
                <p style={styles.emptySub}>Apply for a Vajra credit card to start building your score.</p>
            </div>
        );
    }

    return (
        <div className="glass-card-metrics" style={styles.card}>
            <div style={styles.header}>
                <h4 style={styles.title}>CREDIT UTILIZATION</h4>
                <div className="tooltip-container" style={styles.tooltipIcon}>
                    <InfoCircle size={14} />
                    <span className="tooltip-text">Lower utilization improves your credit score</span>
                </div>
            </div>

            <div style={styles.visualContainer}>
                <svg width="180" height="180" viewBox="0 0 180 180">
                    {/* Background Track */}
                    <circle
                        cx="90" cy="90" r={radius}
                        fill="none"
                        stroke="rgba(255,255,255,0.05)"
                        strokeWidth="12"
                    />
                    {/* Progress Ring */}
                    <circle
                        cx="90" cy="90" r={radius}
                        fill="none"
                        stroke={status.color}
                        strokeWidth="12"
                        strokeDasharray={circumference}
                        style={{
                            strokeDashoffset: offset,
                            transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.5s ease',
                            strokeLinecap: 'round'
                        }}
                        transform="rotate(-90 90 90)"
                    />
                </svg>

                <div style={styles.centerContent}>
                    <span style={{ ...styles.percent, color: status.color }}>{Math.round(utilization)}%</span>
                    <span style={styles.statusLabel}>{status.label}</span>
                </div>
            </div>

            <div style={styles.details}>
                <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Used Amount</span>
                    <span style={styles.detailValue}>₹{used.toLocaleString()}</span>
                </div>
                <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Total Limit</span>
                    <span style={styles.detailValue}>₹{limit.toLocaleString()}</span>
                </div>
            </div>

            <style>{`
                .glass-card-metrics {
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                }
                .glass-card-metrics:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 12px 40px rgba(0,0,0,0.6);
                    border-color: rgba(59, 130, 246, 0.4) !important;
                }
                .tooltip-container {
                    position: relative;
                    cursor: help;
                }
                .tooltip-text {
                    visibility: hidden;
                    width: 140px;
                    background-color: #0c142c;
                    color: #fff;
                    text-align: center;
                    border-radius: 6px;
                    padding: 8px;
                    position: absolute;
                    z-index: 10;
                    bottom: 125%;
                    left: 50%;
                    margin-left: -70px;
                    opacity: 0;
                    transition: opacity 0.3s;
                    font-size: 11px;
                    border: 1px solid rgba(255,255,255,0.1);
                    box-shadow: 0 5px 15px rgba(0,0,0,0.5);
                }
                .tooltip-container:hover .tooltip-text {
                    visibility: visible;
                    opacity: 1;
                }
            `}</style>
        </div>
    );
};

const styles = {
    card: {
        background: 'rgba(12, 20, 44, 0.6)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        padding: '24px',
        border: '1px solid rgba(255,255,255,0.08)',
        height: '350px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    title: {
        color: '#94a3b8',
        fontSize: '12px',
        fontWeight: '700',
        letterSpacing: '1px',
        margin: 0
    },
    tooltipIcon: {
        color: '#64748b'
    },
    visualContainer: {
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1
    },
    centerContent: {
        position: 'absolute',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
    },
    percent: {
        fontSize: '38px',
        fontWeight: '800',
        lineHeight: 1
    },
    statusLabel: {
        fontSize: '11px',
        fontWeight: '600',
        color: '#94a3b8',
        textTransform: 'uppercase',
        marginTop: '4px',
        letterSpacing: '0.5px'
    },
    details: {
        background: 'rgba(255,255,255,0.03)',
        borderRadius: '12px',
        padding: '12px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
    },
    detailRow: {
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '13px'
    },
    detailLabel: {
        color: '#64748b'
    },
    detailValue: {
        color: '#f8fafc',
        fontWeight: '600'
    },
    emptyCard: {
        background: 'rgba(12, 20, 44, 0.4)',
        borderRadius: '20px',
        padding: '40px 24px',
        border: '1px dashed rgba(255,255,255,0.1)',
        height: '350px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center'
    },
    emptyIcon: {
        fontSize: '48px',
        marginBottom: '20px',
        opacity: 0.5
    },
    emptyTitle: {
        color: '#f8fafc',
        fontSize: '18px',
        fontWeight: '700',
        margin: '0 0 10px 0'
    },
    emptySub: {
        color: '#64748b',
        fontSize: '14px',
        margin: 0,
        lineHeight: '1.5'
    }
};

export default CreditUtilization;
