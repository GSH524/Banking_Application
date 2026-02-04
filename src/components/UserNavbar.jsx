import { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Bell, BellFill, Check2All, List, X } from "react-bootstrap-icons";
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc, limit } from "firebase/firestore";
import { userDB } from "../firebaseUser";


export default function UserNavbar({ user, onLogout, onToggleSidebar, isSidebarOpen }) {
    const [isOpen, setIsOpen] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const dropdownRef = useRef(null);
    const notifRef = useRef(null);
    const navigate = useNavigate();

    // Listen for User Notifications
    useEffect(() => {
        if (!user?.uid) return;

        const q = query(
            collection(userDB, "notifications"),
            where("userId", "==", user.uid),
            where("role", "==", "user"),
            where("read", "==", false)
        );

        const unsubscribe = onSnapshot(q,
            (snapshot) => {
                const notifs = snapshot.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }))
                    .sort((a, b) => (b.createdAt?.toDate?.() || new Date(0)) - (a.createdAt?.toDate?.() || new Date(0)))
                    .slice(0, 10);
                setNotifications(notifs);
            },
            (error) => {
                console.error("Firestore User Notification Listener Error:", error);
            }
        );

        return () => unsubscribe();
    }, [user]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const markAsRead = async (notif) => {
        try {
            await updateDoc(doc(userDB, "notifications", notif.id), { read: true });
            setShowNotifications(false);
            if (notif.redirectTo) navigate(notif.redirectTo);
        } catch (err) {
            console.error(err);
        }
    };

    const markAllRead = async () => {
        try {
            const batchPromises = notifications.map(n =>
                updateDoc(doc(userDB, "notifications", n.id), { read: true })
            );
            await Promise.all(batchPromises);
            setShowNotifications(false);
        } catch (err) {
            console.error(err);
        }
    };

    const getInitials = (name) => {
        return name
            ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
            : "US";
    };

    return (
        <nav className="user-navbar">
            <div className="user-nav-left">
                <button
                    className="sidebar-toggle-btn"
                    onClick={onToggleSidebar}
                    aria-label="Toggle Sidebar"
                >
                    {isSidebarOpen ? <X size={24} /> : <List size={24} />}
                </button>
                <div className="user-nav-links">
                    <h1>Welcome, {user?.firstName || "User"} 👋</h1>
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>

                {/* NOTIFICATIONS */}
                <div className="user-notif-wrapper" ref={notifRef} style={{ position: 'relative' }}>
                    <button
                        className="notif-trigger"
                        onClick={() => setShowNotifications(!showNotifications)}
                        style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '20px', display: 'flex', alignItems: 'center' }}
                    >
                        {notifications.length > 0 ? <BellFill style={{ color: '#3b82f6' }} /> : <Bell />}
                        {notifications.length > 0 && (
                            <span style={{
                                position: 'absolute', top: '-5px', right: '-5px', background: '#ef4444',
                                color: 'white', fontSize: '10px', fontWeight: 'bold', borderRadius: '50%',
                                width: '18px', height: '18px', display: 'flex', alignItems: 'center',
                                justifyContent: 'center', boxShadow: '0 0 10px rgba(239, 68, 68, 0.5)'
                            }}>
                                {notifications.length}
                            </span>
                        )}
                    </button>

                    {showNotifications && (
                        <div className="profile-dropdown" style={{ right: 0, width: '300px', padding: '0', zIndex: 1000 }}>
                            <div style={{ padding: '16px', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <strong style={{ color: '#0f172a' }}>Notifications</strong>
                                {notifications.length > 0 && (
                                    <button onClick={markAllRead} style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Check2All /> Mark all
                                    </button>
                                )}
                            </div>

                            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                {notifications.length === 0 ? (
                                    <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
                                        No new notifications
                                    </div>
                                ) : (
                                    notifications.map(notif => (
                                        <div
                                            key={notif.id}
                                            onClick={() => markAsRead(notif)}
                                            style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', transition: 'background 0.2s' }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                                        >
                                            <p style={{ margin: '0 0 4px 0', color: '#334155', fontSize: '13px' }}>{notif.message}</p>
                                            <span style={{ color: '#94a3b8', fontSize: '11px' }}>
                                                {notif.createdAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                            <div style={{ padding: '12px', borderTop: '1px solid #f1f5f9', textAlign: 'center' }}>
                                <button
                                    onClick={() => {
                                        setShowNotifications(false);
                                        navigate('/user/notifications');
                                    }}
                                    style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}
                                >
                                    View All Notifications
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* PROFILE */}
                <div className="user-profile-menu" ref={dropdownRef}>
                    <button className="profile-trigger" onClick={() => setIsOpen(!isOpen)}>
                        <div className="profile-avatar">{getInitials(user?.name)}</div>
                    </button>

                    {isOpen && (
                        <div className="profile-dropdown">
                            <div className="dropdown-user-info">
                                <strong>{user?.name || "User"}</strong>
                                <span>{user?.email}</span>
                            </div>
                            <button className="logout-btn" onClick={onLogout}>
                                Sign Out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
