import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Bell,
  CheckCircle,
  XCircle,
  InfoCircle,
  Megaphone
} from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { notificationService } from '../../services/notificationService';
import { adService } from '../../services/adService';
import toast from 'react-hot-toast';


/**
 * NotificationBell Component - Rebuilt from Scratch
 * 
 * CRITICAL: Backend JWT only, no Firebase
 * - Fetches notifications from /api/notifications
 * - Shows unread badge count
 * - Admin can approve/reject ads directly
 * - Partner sees approval/rejection notifications
 */
export default function NotificationBell({ user: propUser }) {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const currentUser = propUser || authService.getUser();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  /* -------------------- FETCH NOTIFICATIONS -------------------- */
  const fetchNotifications = useCallback(async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      const uid = currentUser.uid || currentUser.id;
      const role = currentUser.role;
      const data = await notificationService.getNotifications(uid, role);
      const currentNotifications = Array.isArray(data) ? data : (data?.data || []);

      setNotifications(currentNotifications);

      const newUnreadCount = currentNotifications.filter(n => !n.isRead).length;
      setUnreadCount(newUnreadCount);

      // Show toast for new notifications (only if count increased)
      if (newUnreadCount > 0 && isOpen) {
        const latestUnread = currentNotifications.find(n => !n.isRead);
        if (latestUnread) {
          toast.success(`New: ${latestUnread.title}`, {
            icon: '🔔',
            duration: 3000
          });
        }
      }
    } catch (err) {
      console.error('❌ [NOTIF BELL] Failed to fetch notifications:', err);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, [currentUser, isOpen]);

  useEffect(() => {
    fetchNotifications();

    // Listen for notification updates
    const handleUpdate = () => {
      fetchNotifications();
    };
    window.addEventListener('notifications-updated', handleUpdate);

    // Poll every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);

    return () => {
      window.removeEventListener('notifications-updated', handleUpdate);
      clearInterval(interval);
    };
  }, [fetchNotifications]);

  /* -------------------- CLICK OUTSIDE -------------------- */
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* -------------------- HELPERS -------------------- */
  const getIcon = (type) => {
    switch (type) {
      case 'AD_SUBMITTED': return <Megaphone size={16} />;
      case 'AD_APPROVED': return <CheckCircle size={16} />;
      case 'AD_REJECTED': return <XCircle size={16} />;
      default: return <InfoCircle size={16} />;
    }
  };

  const getTypeClass = (type) => {
    switch (type) {
      case 'AD_SUBMITTED': return 'submission';
      case 'AD_APPROVED': return 'approved';
      case 'AD_REJECTED': return 'rejected';
      default: return 'system';
    }
  };

  /* -------------------- ACTION HANDLERS -------------------- */
  const markAsRead = async (notifId) => {
    try {
      await notificationService.markAsRead(notifId);
      setNotifications(prev =>
        prev.map(n =>
          (n._id === notifId || n.id === notifId)
            ? { ...n, isRead: true }
            : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('❌ [NOTIF BELL] Failed to mark as read:', err);
    }
  };

  const handleNotificationClick = async (notif) => {
    const notifId = notif._id || notif.id;

    // Mark as read if unread
    if (!notif.isRead) {
      await markAsRead(notifId);
    }

    setIsOpen(false);

    // Navigation logic
    if (notif.type === 'AD_SUBMITTED' && currentUser?.role === 'admin') {
      // Admin: Navigate to ads page with ad ID
      navigate('/admin/ads', {
        state: { openAdId: notif.adId }
      });
    } else if (
      (notif.type === 'AD_APPROVED' || notif.type === 'AD_REJECTED') &&
      currentUser?.role === 'partner'
    ) {
      // Partner: Navigate to dashboard
      navigate('/partner/dashboard');
    }
  };

  const handleDelete = async (e, notifId) => {
    e.stopPropagation();
    try {
      await notificationService.deleteNotification(notifId);
      setNotifications(prev =>
        prev.filter(n => n._id !== notifId && n.id !== notifId)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('❌ [NOTIF BELL] Failed to delete:', err);
    }
  };

  const handleAdminAction = async (e, notif, action) => {
    e.stopPropagation();
    try {
      const adId = notif.adId;
      if (!adId) {
        toast.error('Ad ID missing');
        return;
      }

      if (action === 'approve') {
        await adService.approveAd(adId);
        toast.success('Ad approved!');
      } else {
        const reason = window.prompt('Enter rejection reason (optional):');
        if (reason === null) return; // User cancelled

        await adService.rejectAd(adId, reason || 'No reason provided');
        toast.success('Ad rejected');
      }

      // Mark notification as read
      await markAsRead(notif._id || notif.id);

      // Refresh notifications
      window.dispatchEvent(new Event('notifications-updated'));
      await fetchNotifications();
    } catch (err) {
      console.error('❌ [NOTIF BELL] Admin action failed:', err);
      toast.error(err.message || 'Action failed');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const uid = currentUser.uid || currentUser.id;
      await notificationService.markAllAsRead(uid, currentUser.role);
      setNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true }))
      );
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (err) {
      console.error('❌ [NOTIF BELL] Failed to mark all read:', err);
    }
  };

  if (!currentUser) return null;

  /* -------------------- RENDER -------------------- */
  return (
    <div className="notification-container" ref={dropdownRef}>
      <div
        className="notification-icon"
        onClick={() => setIsOpen(prev => !prev)}
      >
        <Bell />
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </div>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notif-header">
            <h4>Notifications</h4>
            {unreadCount > 0 && (
              <button
                className="mark-all-btn"
                onClick={handleMarkAllRead}
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="notif-list">
            {loading ? (
              <div className="empty-notif">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="empty-notif">No notifications</div>
            ) : (
              notifications.map(notif => {
                const notifId = notif._id || notif.id;

                return (
                  <div
                    key={notifId}
                    className={`notif-item ${!notif.isRead ? 'unread' : ''}`}
                    onClick={() => handleNotificationClick(notif)}
                  >
                    <div className="notif-flex-container">
                      <div className={`notif-icon-box ${getTypeClass(notif.type)}`}>
                        {getIcon(notif.type)}
                      </div>

                      <div className="notif-content">
                        <div className="notif-title">{notif.title}</div>
                        <div className="notif-message">{notif.message}</div>

                        {/* ADMIN QUICK ACTIONS */}
                        {notif.type === 'AD_SUBMITTED' &&
                          currentUser.role === 'admin' &&
                          !notif.isRead && (
                            <div className="notif-actions">
                              <button
                                className="mini-action-btn approve"
                                onClick={(e) =>
                                  handleAdminAction(e, notif, 'approve')
                                }
                              >
                                Approve
                              </button>
                              <button
                                className="mini-action-btn reject"
                                onClick={(e) =>
                                  handleAdminAction(e, notif, 'reject')
                                }
                              >
                                Reject
                              </button>
                            </div>
                          )}

                        <div className="notif-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                          <span className="notif-time">
                            {notif.createdAt
                              ? new Date(notif.createdAt).toLocaleString()
                              : 'Just now'
                            }
                          </span>
                          <button
                            className="btn-delete-notif"
                            onClick={(e) => handleDelete(e, notifId)}
                          >
                            <XCircle size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
