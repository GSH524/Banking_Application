import React, { useState } from 'react';
import { Wifi } from 'react-bootstrap-icons';
import { maskCardNumber } from '../../utils/cardUtils';

const CardVisual = ({ type, number, holder, expiry, blocked }) => {
    const [tilt, setTilt] = useState({ x: 0, y: 0 });
    const [isFlipped, setIsFlipped] = useState(false);

    const handleMouseMove = (e) => {
        if (isFlipped) {
            setTilt({ x: 0, y: 0 });
            return;
        }
        const card = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - card.left) / card.width;
        const y = (e.clientY - card.top) / card.height;
        const rotateX = (y - 0.5) * 20;
        const rotateY = (x - 0.5) * -20;
        setTilt({ x: rotateX, y: rotateY });
    };

    const handleMouseLeave = () => {
        setTilt({ x: 0, y: 0 });
    };

    const getCardStyle = (cardType) => {
        switch (cardType) {
            case 'Vajra Platinum':
                return {
                    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#f8fafc',
                    accent: '#3b82f6',
                    hologram: 'linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(139,92,246,0.1) 100%)'
                };
            case 'Vajra Gold':
                return {
                    background: 'linear-gradient(135deg, #b45309 0%, #d97706 50%, #f59e0b 100%)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: '#fff',
                    accent: '#fef3c7',
                    hologram: 'linear-gradient(135deg, rgba(251,191,36,0.1) 0%, rgba(252,211,77,0.1) 100%)'
                };
            default: // Classic
                return {
                    background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #60a5fa 100%)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff',
                    accent: '#dbeafe',
                    hologram: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)'
                };
        }
    };

    const style = getCardStyle(type);

    return (
        <div
            className="card-container"
            onClick={() => setIsFlipped(!isFlipped)}
            style={{
                perspective: '1000px',
                width: '100%',
                maxWidth: '400px',
                margin: '0 auto',
                cursor: 'pointer',
                aspectRatio: '1.58'
            }}
        >
            <div
                className={`card-inner ${isFlipped ? 'is-flipped' : ''}`}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                    transformStyle: 'preserve-3d',
                    transform: isFlipped ? 'rotateY(180deg)' : `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`
                }}
            >
                {/* FRONT SIDE */}
                <div
                    className="card-front"
                    style={{
                        ...style,
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        backfaceVisibility: 'hidden',
                        borderRadius: '20px',
                        padding: '30px',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                        filter: blocked ? 'grayscale(0.8) contrast(0.8)' : 'none',
                        overflow: 'hidden'
                    }}
                >
                    {/* Visual patterns */}
                    <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '200px', height: '200px', background: style.hologram, borderRadius: '50%' }}></div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '35px' }}>
                        <div>
                            <span style={{ fontSize: '20px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>VajraBank</span>
                            <span style={{ fontSize: '10px', opacity: 0.8, letterSpacing: '2px', display: 'block' }}>PREMIUM BANKING</span>
                        </div>
                        <Wifi size={24} style={{ color: style.accent }} />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <div style={{ width: '50px', height: '38px', background: 'linear-gradient(45deg, #fef08a, #eab308)', borderRadius: '6px' }}></div>
                        <span style={{ fontSize: '14px', fontWeight: '600', opacity: 0.9 }}>{type}</span>
                    </div>

                    <div style={{ fontSize: '24px', fontFamily: 'monospace', letterSpacing: '3px', marginBottom: '25px', textShadow: '0 2px 4px rgba(0,0,0,0.4)', color: '#fff' }}>
                        {maskCardNumber(number)}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <div style={{ flex: 1 }}>
                            <p style={{ fontSize: '10px', opacity: 0.9, color: '#fff', margin: 0, textTransform: 'uppercase', fontWeight: '700' }}>Card Holder</p>
                            <p style={{ fontSize: '16px', fontWeight: '700', margin: '2px 0 0 0', color: '#fff' }}>{holder}</p>
                        </div>
                        <div style={{ marginLeft: '20px' }}>
                            <p style={{ fontSize: '10px', opacity: 0.9, color: '#fff', margin: 0, fontWeight: '700' }}>VALID THRU</p>
                            <p style={{ fontSize: '15px', fontWeight: '700', margin: '2px 0 0 0', color: '#fff' }}>{expiry}</p>
                        </div>
                        <div style={{ marginLeft: '20px' }}>
                            <img src="https://img.icons8.com/color/48/000000/visa.png" alt="Visa" style={{ height: '35px' }} />
                        </div>
                    </div>
                </div>

                {/* BACK SIDE */}
                <div
                    className="card-back"
                    style={{
                        ...style,
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        backfaceVisibility: 'hidden',
                        borderRadius: '20px',
                        transform: 'rotateY(180deg)',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                        overflow: 'hidden'
                    }}
                >
                    <div style={{ height: '50px', background: '#000', width: '100%', marginTop: '30px' }}></div>
                    <div style={{ padding: '20px 30px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <div style={{ height: '40px', background: '#fff', flex: 1, color: '#000', display: 'flex', alignItems: 'center', padding: '0 10px', fontWeight: 'bold' }}>
                                <div style={{ fontSize: '10px', color: '#94a3b8', marginRight: '10px', fontStyle: 'italic' }}>Authorized Signature</div>
                            </div>
                            <div style={{ background: '#fff', padding: '10px', borderRadius: '4px', color: '#000', fontWeight: 'bold', minWidth: '50px', textAlign: 'center' }}>
                                123
                            </div>
                        </div>
                        <p style={{ fontSize: '10px', marginTop: '30px', opacity: 0.7, lineHeight: '1.4' }}>
                            This card is issued by VajraBank. Use of this card is subject to the terms and conditions in the Cardholder Agreement.
                            If found, please return to any VajraBank branch or mail to Global Headquarters.
                        </p>
                        <div style={{ textAlign: 'center', marginTop: '10px' }}>
                            <span style={{ fontSize: '12px', fontWeight: 'bold' }}>vajrabank.com</span>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .card-inner.is-flipped {
                    transform: rotateY(180deg);
                }
                @keyframes cardEntry {
                    from { transform: translateY(30px) scale(0.9); opacity: 0; }
                    to { transform: translateY(0) scale(1); opacity: 1; }
                }
                .card-container {
                    animation: cardEntry 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
                }
            `}</style>
        </div>
    );
};

export default CardVisual;
