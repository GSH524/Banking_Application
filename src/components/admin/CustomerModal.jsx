import React, { useState } from 'react';

export default function CustomerModal({ customer, overrides, onAction, onClose }) {
    if (!customer) return null;

    // Local state for remarks before saving
    const [remarkText, setRemarkText] = useState(overrides?.remarks || "");

    // Merge overrides
    const isFrozen = overrides?.isFrozen ?? customer.isFrozen;
    const isFlagged = overrides?.flagged ?? false;

    const handleRemarkSave = () => {
        onAction.addRemark(customer.customerId, remarkText);
        alert("Case Remarks Synchronized Successfully.");
    };

    return (
        <div className="admin-modal-overlay" onClick={(e) => e.target.classList.contains('admin-modal-overlay') && onClose()}>
            <div className="admin-modal-content">

                {/* HEADER */}
                <div className={`admin-modal-header ${isFlagged ? 'danger-bg' : ''}`}>
                    <div>
                        <h2 className="admin-modal-title">{customer.fullName}</h2>
                        <span className="admin-modal-subtitle">ENTITY ID: {customer.customerId}</span>
                        {isFlagged && <span style={{ marginLeft: '16px', color: '#ef4444', fontWeight: '900', fontSize: '12px', textTransform: 'uppercase' }}>⚠️ SUSPICIOUS ACTIVITY</span>}
                    </div>
                    <button onClick={onClose} className="close-modal-btn">×</button>
                </div>

                {/* BODY */}
                <div className="admin-modal-body">

                    {/* 1. KEY METRICS */}
                    <div className="modal-stats-grid">
                        <div className="modal-stat-card">
                            <label className="modal-stat-label">Verified Balance</label>
                            <div className="modal-stat-value" style={{ color: customer.balance < 0 ? '#ef4444' : 'var(--accent-primary)' }}>
                                ₹{customer.balance.toLocaleString()}
                            </div>
                        </div>
                        <div className="modal-stat-card">
                            <label className="modal-stat-label">Risk Profile</label>
                            <div style={{ marginTop: '4px' }}>
                                <span className={`risk-badge risk-${customer.riskLevel.toLowerCase()}`} style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 800 }}>
                                    {customer.riskLevel}
                                </span>
                            </div>
                        </div>
                        <div className="modal-stat-card">
                            <label className="modal-stat-label">CIBIL Intel</label>
                            <div className="modal-stat-value" style={{ color: customer.cibilScore < 650 ? '#ef4444' : '#10b981' }}>
                                {customer.cibilScore}
                            </div>
                        </div>
                        <div className="modal-stat-card">
                            <label className="modal-stat-label">Network Status</label>
                            <div className="modal-stat-value" style={{ fontSize: '15px' }}>
                                {isFrozen ? '❄️ Restricted' : customer.activeStatus}
                            </div>
                        </div>
                    </div>

                    {/* 2. DETAIL SECTIONS */}
                    <div className="modal-details-split">

                        {/* LEFT: IDENTITY & HEALTH */}
                        <div>
                            <h4 className="detail-section-title">Identity Parameters</h4>
                            <div className="info-row"><span className="info-label">Email Handle</span> <span className="info-value">{customer.email}</span></div>
                            <div className="info-row"><span className="info-label">Direct Line</span> <span className="info-value">{customer.raw['Contact Number']}</span></div>
                            <div className="info-row"><span className="info-label">Registered Residency</span> <span className="info-value" style={{ maxWidth: '200px', textAlign: 'right' }}>{customer.raw['Address']}</span></div>
                            <div className="info-row"><span className="info-label">Demographics</span> <span className="info-value">{customer.gender} | {customer.age} YRS</span></div>

                            <h4 className="detail-section-title" style={{ marginTop: '32px' }}>Financial Integrity</h4>
                            <div className="info-row"><span className="info-label">Credit Exposure</span> <span className="info-value">{Math.round(customer.raw['Credit Utilization'] * 100)}%</span></div>
                            <div className="info-row"><span className="info-label">Approved Limit</span> <span className="info-value">₹{customer.raw['Credit Limit'].toLocaleString()}</span></div>
                            <div className="info-row"><span className="info-label">Portfolio Age</span> <span className="info-value">Since 2021-08-12</span></div>
                            <div className="info-row"><span className="info-label">Payment Latency</span> <span className="info-value" style={{ color: customer.paymentDelay > 60 ? '#ef4444' : 'inherit' }}>{customer.paymentDelay} Days</span></div>
                        </div>

                        {/* RIGHT: COMMAND CENTER */}
                        <div className="admin-action-box">
                            <h4 className="action-box-title">⚡ Command & Control</h4>

                            <div className="action-item-card">
                                <div className="action-item-info">
                                    <strong>Freeze Entity</strong>
                                    <p>Halt all outgoing capital</p>
                                </div>
                                <label className="switch-alt">
                                    <input
                                        type="checkbox"
                                        checked={isFrozen}
                                        onChange={() => onAction.toggleFreeze(customer.customerId, isFrozen)}
                                    />
                                    <span className="slider-alt"></span>
                                </label>
                            </div>

                            <div className="action-item-card">
                                <div className="action-item-info">
                                    <strong>Flag for Review</strong>
                                    <p>Mark as high-priority alert</p>
                                </div>
                                <label className="switch-alt">
                                    <input
                                        type="checkbox"
                                        checked={isFlagged}
                                        onChange={() => onAction.toggleFlag(customer.customerId, isFlagged)}
                                    />
                                    <span className="slider-alt"></span>
                                </label>
                            </div>

                            <div style={{ marginTop: '24px' }}>
                                <label className="filter-label-admin" style={{ marginBottom: '10px', display: 'block' }}>Operational Remarks</label>
                                <textarea
                                    rows="4"
                                    className="admin-textarea"
                                    placeholder="Input investigative notes..."
                                    value={remarkText}
                                    onChange={(e) => setRemarkText(e.target.value)}
                                />
                                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <button onClick={handleRemarkSave} className="admin-save-btn">
                                        Sync Case
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* FOOTER */}
                <div style={{ padding: '24px 32px', borderTop: '1px solid var(--divider-color)', display: 'flex', justifyContent: 'flex-end' }}>
                    <button onClick={onClose} className="pg-btn" style={{ padding: '10px 30px' }}>
                        Exit Surveillance
                    </button>
                </div>
            </div>

            <style>{`
                .switch-alt { position: relative; display: inline-block; width: 44px; height: 24px; }
                .switch-alt input { opacity: 0; width: 0; height: 0; }
                .slider-alt { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #cbd5e1; transition: .3s; border-radius: 34px; }
                .slider-alt:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: white; transition: .3s; border-radius: 50%; }
                input:checked + .slider-alt { background-color: #ef4444; }
                input:checked + .slider-alt:before { transform: translateX(20px); }
            `}</style>
        </div>
    );
}
