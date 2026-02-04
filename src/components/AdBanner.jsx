import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAds } from '../context/AdContext';
import { Megaphone, ArrowRight, X } from 'react-bootstrap-icons';
import { adService } from '../services/adService';


export default function AdBanner({ page }) {
    const { ads: allAds, loading, getAdsForPage } = useAds();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    // If page prop is not provided, try to infer it from URL (legacy support)
    const effectivePage = page || (window.location.pathname === '/' ? 'home' : window.location.pathname.substring(1).toLowerCase());

    const ads = getAdsForPage(effectivePage);

    // Handle auto-rotation
    useEffect(() => {
        if (ads.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % ads.length);
        }, 8000);

        return () => clearInterval(interval);
    }, [ads.length]);

    if (loading || ads.length === 0 || !isVisible) return null;

    const currentAd = ads[currentIndex];

    return (
        <div className="ad-banner-wrapper">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentAd.id}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.02 }}
                    transition={{ duration: 0.5 }}
                    className="ad-banner-container glass-card"
                    style={{
                        backgroundImage: `linear-gradient(90deg, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.7) 100%), url(${currentAd.imageUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    }}
                >
                    <div className="ad-content">
                        <div className="ad-header d-flex justify-content-between align-items-center">
                            <span className="sponsored-label">
                                <Megaphone className="me-1" /> SPONSORED
                            </span>
                            <button
                                onClick={() => setIsVisible(false)}
                                className="btn btn-link text-white opacity-50 p-0 border-0"
                                style={{ transform: 'translateY(-2px)' }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="ad-body mt-1">
                            <div className="d-flex flex-column">
                                <h3 className="ad-title">{currentAd.title}</h3>
                                {currentAd.businessName && (
                                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                                        Featured Partner: {currentAd.businessName}
                                    </span>
                                )}
                            </div>
                            <div className="ad-actions">
                                <a
                                    href={currentAd.redirectUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="ad-cta-btn"
                                    onClick={() => adService.trackClick(currentAd.id)}
                                >
                                    Learn More <ArrowRight className="ms-2" />
                                </a>
                            </div>
                        </div>
                    </div>

                    {ads.length > 1 && (
                        <div className="ad-indicators">
                            {ads.map((_, idx) => (
                                <div
                                    key={idx}
                                    className={`indicator-dot ${idx === currentIndex ? 'active' : ''}`}
                                    onClick={() => setCurrentIndex(idx)}
                                />
                            ))}
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
