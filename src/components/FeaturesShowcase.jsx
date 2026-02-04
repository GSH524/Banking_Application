import { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function FeaturesShowcase() {
    const cardsRef = useRef([]);
    const navigate = useNavigate();
    const { user } = useAuth();

    const handleFeatureClick = (path) => {
        if (user) {
            navigate(path);
        } else {
            navigate('/login');
        }
    };

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry, index) => {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }
                });
            },
            { threshold: 0.1 }
        );

        cardsRef.current.forEach((card) => {
            if (card) observer.observe(card);
        });

        return () => observer.disconnect();
    }, []);

    const features = [
        {
            emoji: '🔐',
            title: 'Secure Banking',
            description: 'RBI compliant with 256-bit encryption. Your money is safe with industry-leading security.',
            color: '#10b981',
            animation: 'pulse',
            path: '/user/dashboard'
        },
        {
            emoji: '💸',
            title: 'Easy Payments',
            description: 'Easy payments with one tap. UPI, transfers, and request money flow made simple.',
            color: '#3b82f6',
            animation: 'lift',
            path: '/user/payments'
        },
        {
            emoji: '🎁',
            title: 'Cashback & Rewards',
            description: 'Get cashback and rewards. Earn points on every spend and redeem for exciting offers.',
            color: '#8b5cf6',
            animation: 'slide',
            path: '/user/rewards'
        },
        {
            emoji: '🌎',
            title: 'Global Transfers',
            description: 'Send & receive from abroad. Competitive rates and instant international transfers.',
            color: '#f59e0b',
            animation: 'glow',
            path: '/user/international'
        },
        {
            emoji: '🤖',
            title: 'AI Risk Monitoring',
            description: 'Advanced fraud detection and real-time alerts to protect your account 24/7.',
            color: '#ef4444',
            animation: 'bounce',
            path: '/user/dashboard'
        }
    ];

    return (
        <div id="features" style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.title}>Why Choose VajraBank?</h2>
                <p style={styles.subtitle}>
                    Experience banking that's secure, smart, and designed for your financial success
                </p>
            </div>

            <div style={styles.grid}>
                {features.map((feature, index) => (
                    <div
                        key={index}
                        ref={(el) => (cardsRef.current[index] = el)}
                        style={{
                            ...styles.card,
                            animationDelay: `${index * 0.1}s`,
                            opacity: 0,
                            transform: 'translateY(20px)',
                            transition: 'all 0.6s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-12px) scale(1.02)';
                            e.currentTarget.style.boxShadow = `0 25px 50px -12px rgba(${hexToRgb(feature.color)}, 0.5)`;
                            e.currentTarget.style.borderColor = feature.color;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0) scale(1)';
                            e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.4)';
                            e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.2)';
                        }}
                        onClick={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const x = e.clientX - rect.left;
                            const y = e.clientY - rect.top;

                            const ripple = document.createElement('span');
                            ripple.style.position = 'absolute';
                            ripple.style.left = `${x}px`;
                            ripple.style.top = `${y}px`;
                            ripple.style.width = '100px';
                            ripple.style.height = '100px';
                            ripple.style.background = 'rgba(255, 255, 255, 0.3)';
                            ripple.style.borderRadius = '50%';
                            ripple.style.transform = 'translate(-50%, -50%) scale(0)';
                            ripple.style.animation = 'ripple 0.6s linear';
                            ripple.style.pointerEvents = 'none';

                            e.currentTarget.appendChild(ripple);
                            setTimeout(() => ripple.remove(), 600);

                            setTimeout(() => handleFeatureClick(feature.path), 200);
                        }}
                    >
                        <div
                            style={{
                                ...styles.iconContainer,
                                background: `linear-gradient(135deg, ${feature.color}22 0%, ${feature.color}11 100%)`
                            }}
                        >
                            <span style={styles.emoji}>{feature.emoji}</span>
                        </div>
                        <h3 style={styles.featureTitle}>{feature.title}</h3>
                        <p style={styles.featureDescription}>{feature.description}</p>
                        <div
                            style={{
                                ...styles.colorBar,
                                background: feature.color
                            }}
                        />
                    </div>
                ))}
            </div>

            {/* Decorative background elements */}
            <div style={styles.bgGradient1} />
            <div style={styles.bgGradient2} />

            <style>
                {`
                    @keyframes ripple {
                        to {
                            transform: translate(-50%, -50%) scale(4);
                            opacity: 0;
                        }
                    }
                    @keyframes float {
                        0%, 100% { transform: translateY(0); }
                        50% { transform: translateY(-10px); }
                    }
                `}
            </style>
        </div>
    );
}

// Helper function to convert hex to RGB
const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
        : '59, 130, 246';
};

const styles = {
    container: {
        position: 'relative',
        background: '#080f25',
        padding: '80px 20px',
        overflow: 'hidden'
    },
    header: {
        textAlign: 'center',
        marginBottom: '60px',
        position: 'relative',
        zIndex: 1
    },
    title: {
        color: '#fff',
        fontSize: '42px',
        fontWeight: '700',
        marginBottom: '16px',
        background: 'linear-gradient(135deg, #fff 0%, #94a3b8 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
    },
    subtitle: {
        color: '#94a3b8',
        fontSize: '18px',
        maxWidth: '600px',
        margin: '0 auto',
        lineHeight: '1.6'
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '30px',
        maxWidth: '1400px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 1
    },
    card: {
        background: 'rgba(12, 20, 44, 0.6)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: '1px solid rgba(59, 130, 246, 0.2)',
        borderRadius: '20px',
        padding: '32px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden'
    },
    iconContainer: {
        width: '80px',
        height: '80px',
        borderRadius: '20px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: '24px',
        position: 'relative'
    },
    emoji: {
        fontSize: '40px',
        animation: 'float 3s ease-in-out infinite'
    },
    featureTitle: {
        color: '#fff',
        fontSize: '24px',
        fontWeight: '700',
        marginBottom: '12px'
    },
    featureDescription: {
        color: '#94a3b8',
        fontSize: '15px',
        lineHeight: '1.6',
        marginBottom: '20px'
    },
    colorBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '4px',
        borderRadius: '0 0 20px 20px'
    },
    bgGradient1: {
        position: 'absolute',
        top: '-10%',
        left: '-10%',
        width: '40%',
        height: '40%',
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
        filter: 'blur(60px)',
        pointerEvents: 'none'
    },
    bgGradient2: {
        position: 'absolute',
        bottom: '-10%',
        right: '-10%',
        width: '40%',
        height: '40%',
        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
        filter: 'blur(60px)',
        pointerEvents: 'none'
    }
};
