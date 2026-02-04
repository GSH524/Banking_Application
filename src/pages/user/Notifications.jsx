import React, { useState, useEffect } from "react";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  doc,
  updateDoc,
} from "firebase/firestore";
import { userDB } from "../../firebaseUser";
import {
  Bell,
  Check2All,
  InfoCircle,
  CreditCard,
  ShieldExclamation,
} from "react-bootstrap-icons";


export default function Notifications() {
  const { currentUser } = useCurrentUser();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser?.uid) return;

    const q = query(
      collection(userDB, "notifications"),
      where("userId", "==", currentUser.uid),
      where("role", "==", "user"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setNotifications(data);
      setLoading(false);
    });

    return () => unsub();
  }, [currentUser]);

  const markAsRead = async (id) => {
    await updateDoc(doc(userDB, "notifications", id), { read: true });
  };

  const markAllRead = async () => {
    await Promise.all(
      notifications
        .filter((n) => !n.read)
        .map((n) =>
          updateDoc(doc(userDB, "notifications", n.id), { read: true })
        )
    );
  };

  const getIcon = (type) => {
    switch (type) {
      case "creditCard":
        return <CreditCard />;
      case "security":
        return <ShieldExclamation />;
      default:
        return <InfoCircle />;
    }
  };

  if (loading)
    return <div className="notif-loading">Loading account activity…</div>;

  return (
    <main className="notifications-main">
      {/* HEADER */}
      <div className="notifications-header">
        <div>
          <h1>
            <Bell /> Notifications
          </h1>
          <p>
            Stay updated with your account activity and security alerts.
          </p>
        </div>

        {notifications.some((n) => !n.read) && (
          <button className="mark-all-btn" onClick={markAllRead}>
            <Check2All /> Mark all as read
          </button>
        )}
      </div>

      {/* LIST */}
      <div className="notifications-list">
        {notifications.length === 0 ? (
          <div className="notifications-empty">
            <Bell size={48} />
            <p>You're all caught up 🎉</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`notification-card ${n.read ? "read" : "unread"}`}
            >
              <div className="notification-icon-box">{getIcon(n.type)}</div>

              <div className="notification-content">
                <div className="notification-meta">
                  <span className="notification-type">{n.type || "system"}</span>
                  <span className="notification-time">
                    {n.createdAt?.toDate().toLocaleString()}
                  </span>
                </div>

                <p className="notification-message">{n.message}</p>

                {!n.read && (
                  <button
                    onClick={() => markAsRead(n.id)}
                    className="mark-read-inner-btn"
                  >
                    Mark as read
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
