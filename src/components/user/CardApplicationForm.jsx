import React, { useState } from 'react';
import {
    PersonBadge,
    Buildings,
    CashCoin,
    Check2Circle,
    ChevronRight,
    ChevronLeft,
    HandThumbsUp,
    ShieldLock
} from 'react-bootstrap-icons';
import { getCardDetailsByType } from '../../utils/cardUtils';

const CardApplicationForm = ({ user, onSubmit, onCancel }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        fullName: user?.fullName || '',
        income: '',
        employment: 'Salaried',
        pan: '',
        cardType: 'Vajra Classic',
        agreed: false
    });

    const cardTypes = ['Vajra Classic', 'Vajra Gold', 'Vajra Platinum'];

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (step < 3) return nextStep();
        onSubmit(formData);
    };

    return (
        <div className="glass-card" style={{ maxWidth: '800px', margin: '0 auto', overflow: 'hidden' }}>
            {/* PROGRESS HEADER */}
            <div style={{ background: '#f8fafc', padding: '20px 40px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0' }}>
                {[1, 2, 3].map(s => (
                    <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: step >= s ? 1 : 0.4 }}>
                        <div style={{
                            width: '28px', height: '28px', borderRadius: '50%', background: step >= s ? '#3b82f6' : '#94a3b8',
                            color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 'bold'
                        }}>{s}</div>
                        <span style={{ fontSize: '14px', fontWeight: '600' }}>
                            {s === 1 ? 'Personal' : s === 2 ? 'Card Selection' : 'Consent'}
                        </span>
                    </div>
                ))}
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '40px' }}>

                {step === 1 && (
                    <div className="animate-slide">
                        <h2 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '24px' }}>Employment & Eligibility</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                            <div className="form-group">
                                <label><PersonBadge /> Full Name</label>
                                <input type="text" value={formData.fullName} readOnly />
                            </div>
                            <div className="form-group">
                                <label><Buildings /> Employment Type</label>
                                <select
                                    value={formData.employment}
                                    onChange={e => setFormData({ ...formData, employment: e.target.value })}
                                >
                                    <option>Salaried</option>
                                    <option>Self-Employed</option>
                                    <option>Entrepreneur</option>
                                    <option>Student</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label><CashCoin /> Annual Income (₹)</label>
                                <input
                                    type="number"
                                    placeholder="Earnings per year"
                                    value={formData.income}
                                    onChange={e => setFormData({ ...formData, income: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label><ShieldLock /> PAN Card Number</label>
                                <input
                                    type="text"
                                    placeholder="ABCDE1234F"
                                    value={formData.pan}
                                    onChange={e => setFormData({ ...formData, pan: e.target.value.toUpperCase() })}
                                    maxLength={10}
                                    required
                                />
                            </div>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="animate-slide">
                        <h2 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '24px' }}>Choose Your Vajra</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                            {cardTypes.map(type => {
                                const details = getCardDetailsByType(type);
                                const isSelected = formData.cardType === type;
                                return (
                                    <div
                                        key={type}
                                        onClick={() => setFormData({ ...formData, cardType: type })}
                                        style={{
                                            border: isSelected ? '2.5px solid #3b82f6' : '1.5px solid #e2e8f0',
                                            borderRadius: '16px', padding: '20px', cursor: 'pointer',
                                            background: isSelected ? '#eff6ff' : 'white',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <div style={{ height: '80px', background: details.color, borderRadius: '8px', marginBottom: '16px' }}></div>
                                        <h3 style={{ fontSize: '15px', fontWeight: '800', margin: '0 0 8px 0' }}>{type}</h3>
                                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                                            {details.benefits.map((b, i) => (
                                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                                                    <Check2Circle style={{ color: '#10b981' }} /> {b}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="animate-slide" style={{ textAlign: 'center' }}>
                        <div style={{ width: '80px', height: '80px', background: '#dcfce7', color: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                            <HandThumbsUp size={40} />
                        </div>
                        <h2 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '12px' }}>Final Confirmation</h2>
                        <p style={{ color: '#64748b', marginBottom: '32px' }}>
                            By submitting, you agree to our credit assessment policy and terms of service.
                            Your application will be reviewed within 24 hours.
                        </p>
                        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={formData.agreed}
                                onChange={e => setFormData({ ...formData, agreed: e.target.checked })}
                                required
                            />
                            <span style={{ fontSize: '14px', fontWeight: '600' }}>I agree to the Terms & Conditions</span>
                        </label>
                    </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px' }}>
                    <button
                        type="button"
                        onClick={step === 1 ? onCancel : prevStep}
                        style={{ padding: '12px 24px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', fontWeight: '600', cursor: 'pointer' }}
                    >
                        {step === 1 ? 'Cancel' : <><ChevronLeft /> Back</>}
                    </button>
                    <button
                        type="submit"
                        style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '12px 32px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        {step === 3 ? 'Confirm & Apply' : <>Next <ChevronRight /></>}
                    </button>
                </div>
            </form>

            <style>{`
                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                .form-group label {
                    font-size: 13px;
                    font-weight: 700;
                    color: #64748b;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }
                .form-group input, .form-group select {
                    padding: 12px;
                    border: 1.5px solid #e2e8f0;
                    border-radius: 10px;
                    font-size: 14px;
                }
                .animate-slide {
                    animation: slideIn 0.3s ease-out;
                }
                @keyframes slideIn {
                    from { opacity: 0; transform: translateX(20px); }
                    to { opacity: 1; transform: translateX(0); }
                }
            `}</style>
        </div>
    );
};

export default CardApplicationForm;
