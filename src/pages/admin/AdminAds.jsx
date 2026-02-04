import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import {
  CheckCircle,
  XCircle,
  ClockHistory,
  Megaphone,
  ShieldCheck
} from 'react-bootstrap-icons';
import { adService } from '../../services/adService';

export default function AdminAds() {
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [pendingAds, setPendingAds] = useState([]);
  const [stats, setStats] = useState({
    pending: 0,
    active: 0,
    rejected: 0,
    total: 0
  });

  /* -------------------- FETCH ADS -------------------- */
  const fetchAds = useCallback(async () => {
    setLoading(true);
    try {
      const [pending, statsData] = await Promise.all([
        adService.getPendingAds(),
        adService.getAdStats()
      ]);

      setPendingAds(pending || []);

      const counts =
        statsData?.statusCounts?.reduce((acc, cur) => {
          acc[cur._id] = cur.count;
          return acc;
        }, {}) || {};

      const pendingCount = counts.PENDING || counts.pending || 0;
      const activeCount = counts.APPROVED || counts.approved || 0;
      const rejectedCount = counts.REJECTED || counts.rejected || 0;

      setStats({
        pending: pendingCount,
        active: activeCount,
        rejected: rejectedCount,
        total: pendingCount + activeCount + rejectedCount
      });
    } catch (err) {
      console.error('❌ Failed to fetch ads:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAds();
  }, [fetchAds]);

  /* -------------------- SCROLL FROM NOTIFICATION -------------------- */
  const openAdId = location.state?.openAdId;

  useEffect(() => {
    if (!openAdId || loading) return;

    const timeout = setTimeout(() => {
      const el = document.getElementById(`ad-${openAdId}`);
      if (!el) return;

      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('highlight-premium');

      el.style.boxShadow = '0 0 25px rgba(59,130,246,0.6)';
      el.style.borderColor = '#3b82f6';

      setTimeout(() => {
        el.style.boxShadow = '';
        el.style.borderColor = '';
      }, 4000);
    }, 400);

    return () => clearTimeout(timeout);
  }, [openAdId, loading]);

  /* -------------------- ACTIONS -------------------- */
  const handleApprove = async (ad) => {
    const adId = ad._id || ad.id;
    try {
      await adService.approveAd(adId, ad.durationDays);
      await fetchAds();
      window.dispatchEvent(new Event('notifications-updated'));
    } catch {
      alert('Failed to approve ad');
    }
  };

  const handleReject = async (ad) => {
    const adId = ad._id || ad.id;
    const reason = window.prompt('Enter rejection reason (optional):');
    if (reason === null) return;

    try {
      await adService.rejectAd({
        adId,
        reason: reason || 'No reason provided',
        partnerId: ad.partnerId,
        title: ad.title
      });
      await fetchAds();
      window.dispatchEvent(new Event('notifications-updated'));
    } catch {
      alert('Failed to reject ad');
    }
  };

  /* -------------------- UI -------------------- */
  return (
    <div style={{ padding: 40, color: '#fff', fontFamily: "'Outfit', sans-serif" }}>
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-5">
        <div>
          <h1
            className="fw-bold"
            style={{
              fontSize: '2.5rem',
              color:'black'
            }}
          >
            Ad Command Center
          </h1>
          <p className="text-muted">
            Review, approve, or reject partner campaigns
          </p>
        </div>

        <div className="glass-card px-4 py-2 d-flex gap-3 align-items-center border-warning bg-warning bg-opacity-10">
          <ClockHistory size={22} className="text-warning" />
          <div>
            <div className="small text-muted fw-bold">Pending Ads</div>
            <div className="h4 fw-bold mb-0 text-black">{stats.pending}</div>
          </div>
        </div>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary mb-3" />
          <p className="text-muted">Loading ads...</p>
        </div>
      )}

      {/* EMPTY */}
      {!loading && pendingAds.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card text-center py-5"
        >
          <CheckCircle size={60} className="text-success mb-3 opacity-50" />
          <h3 className="fw-bold">No Pending Ads</h3>
          <p className="text-muted">You are all caught up 🎉</p>
        </motion.div>
      )}

      {/* ADS GRID */}
      <div className="row g-4">
        {pendingAds.map((ad) => {
          const adId = ad._id || ad.id;

          return (
            <motion.div
              key={adId}
              id={`ad-${adId}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="col-xl-4 col-lg-6"
            >
              <div className="glass-card h-100 overflow-hidden border-secondary shadow-lg">
                {/* IMAGE */}
                <div style={{ height: 220, background: '#000' }}>
                  <img
                    src={ad.imageUrl}
                    alt={ad.title}
                    className="w-100 h-100 object-fit-cover opacity-75"
                    onError={(e) => {
                      e.target.src =
                        'https://via.placeholder.com/800x400?text=Invalid+Image';
                      e.target.className =
                        'w-100 h-100 object-fit-contain p-4 opacity-50';
                    }}
                  />
                </div>

                {/* BODY */}
                <div className="p-4">
                  <div className="d-flex justify-content-between mb-2">
                    <h4 className="fw-bold text-truncate">{ad.title}</h4>
                    <span className="badge bg-secondary bg-opacity-25">
                      {ad.durationDays} Days
                    </span>
                  </div>

                  <div className="small text-muted mb-3">{ad.businessName}</div>

                  <div className="d-flex gap-2 mb-4">
                    <div className="flex-grow-1">
                      Payment:{' '}
                      <span
                        className={
                          ad.paymentStatus === 'PAID'
                            ? 'text-success fw-bold'
                            : 'text-danger fw-bold'
                        }
                      >
                        {ad.paymentStatus || 'UNPAID'}
                      </span>
                    </div>
                    {ad.paymentStatus === 'PAID' && (
                      <ShieldCheck className="text-success" />
                    )}
                  </div>

                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-success flex-grow-1 fw-bold"
                      onClick={() => handleApprove(ad)}
                    >
                      <CheckCircle /> Approve
                    </button>
                    <button
                      className="btn btn-danger flex-grow-1 fw-bold"
                      onClick={() => handleReject(ad)}
                    >
                      <XCircle /> Reject
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
