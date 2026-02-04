import React, { useState, useEffect } from 'react';
import { adService } from '../../services/adService';
import { CheckCircle, XCircle, Clock, Megaphone } from 'react-bootstrap-icons';
import { NavLink } from 'react-router-dom';


export default function AdModerationWidget() {
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [rejectingId, setRejectingId] = useState(null);
    const [rejectReason, setRejectReason] = useState("");
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    // Fetch pending ads from REST API
    const fetchPendingAds = async () => {
        try {
            const pendingAds = await adService.getPendingAds();
            setAds(pendingAds.slice(0, 3)); // Limit to 3 for widget
            setLoading(false);
        } catch (error) {
            console.error("Error fetching ads widget:", error);
            setLoading(false);
        }
    };

    // Initial fetch
    useEffect(() => {
        fetchPendingAds();

        // Optional: Poll for updates every 30 seconds
        const interval = setInterval(fetchPendingAds, 30000);
        return () => clearInterval(interval);
    }, []);

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    const handleApprove = async (ad) => {
        try {
            await adService.approveAd(ad.id, ad.duration || 30, ad.partnerId, ad.title);
            showToast(`Approved "${ad.title}"!`);
            fetchPendingAds(); // Refresh list
        } catch (error) {
            showToast("Approval failed", "error");
        }
    };

    const handleRejectClick = (adId) => {
        setRejectingId(adId);
        setRejectReason("");
    };

    const confirmReject = async (ad) => {
        if (!rejectReason.trim()) return;
        try {
            await adService.rejectAd(ad.id, rejectReason, ad.partnerId, ad.title);
            showToast(`Rejected "${ad.title}"`, "success");
            setRejectingId(null);
            fetchPendingAds(); // Refresh list
        } catch (error) {
            showToast("Rejection failed", "error");
        }
    };

    if (loading) return <div className="ad-widget-loading">Loading Queue...</div>;

    return (
        <div className="admin-alert-card ad-moderation-widget">
            {/* TOAST */}
            {toast.show && (
                <div className={`widget-toast ${toast.type}`}>
                    {toast.message}
                </div>
            )}

            <div className="alert-card-header">
                <div className="alert-icon-box ad-icon">
                    <Megaphone size={20} />
                </div>
                <NavLink to="/admin/ads" className="alert-link">
                    View All <span className="ad-count-badge">{ads.length}</span>
                </NavLink>
            </div>

            <div className="ad-widget-content">
                <h3 className="ad-widget-title">Ad Moderation Queue</h3>

                {ads.length === 0 ? (
                    <div className="ad-empty-state">
                        <CheckCircle size={24} className="text-emerald-500" />
                        <p>All caught up! No pending ads.</p>
                    </div>
                ) : (
                    <div className="ad-list">
                        {ads.map(ad => (
                            <div key={ad.id} className="ad-queue-card">
                                {rejectingId === ad.id ? (
                                    <div className="ad-reject-form">
                                        <input
                                            autoFocus
                                            placeholder="Reason..."
                                            value={rejectReason}
                                            onChange={(e) => setRejectReason(e.target.value)}
                                            className="reject-input"
                                        />
                                        <div className="reject-actions">
                                            <button onClick={() => confirmReject(ad)} className="mini-btn-confirm">Reject</button>
                                            <button onClick={() => setRejectingId(null)} className="mini-btn-cancel">Cancel</button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="ad-queue-info">
                                            <div className="ad-queue-title">{ad.title}</div>
                                            <div className="ad-queue-meta">
                                                <span>{ad.businessName}</span> •
                                                <span>${ad.budget}</span>
                                            </div>
                                        </div>
                                        <div className="ad-queue-actions">
                                            <button onClick={() => handleApprove(ad)} className="action-btn-approve" title="Approve">
                                                <CheckCircle size={16} />
                                            </button>
                                            <button onClick={() => handleRejectClick(ad.id)} className="action-btn-reject" title="Reject">
                                                <XCircle size={16} />
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
