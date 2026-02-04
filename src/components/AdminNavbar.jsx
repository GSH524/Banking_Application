import { useState } from "react";
import { List, X, ChatSquareText } from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";

import NotificationBell from './common/NotificationBell';

export default function AdminNavbar({ admin, onLogout, onToggleSidebar, isSidebarOpen }) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const getInitials = (name) => {
    return name
      ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
      : "AD";
  };

  return (
    <nav className="admin-navbar">
      <div className="admin-nav-left">
        <button
          className="sidebar-toggle-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle Sidebar"
        >
          {isSidebarOpen ? <X size={24} /> : <List size={24} />}
        </button>
        <div className="admin-nav-links">
          <h1>Welcome, {admin?.name || "Admin"} 👋</h1>
        </div>
      </div>

      {/* RIGHT: Notifications & Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>

        {/* FEEDBACK NOTIFICATIONS (Legacy Placeholder) */}
        <button
          onClick={() => navigate('/admin/reports')}
          title="User Feedback"
          style={{ position: 'relative', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '20px', display: 'flex', alignItems: 'center' }}
        >
          <ChatSquareText />
        </button>

        {/* NOTIFICATIONS */}
        <NotificationBell user={admin} />

        {/* PROFILE */}
        <div className="admin-profile-menu">
          <button
            className="profile-trigger"
            onClick={() => setIsOpen((prev) => !prev)}
          >
            <div className="profile-avatar">
              {getInitials(admin?.name)}
            </div>
          </button>

          {isOpen && (
            <div className="profile-dropdown">
              <div className="dropdown-user-info">
                <strong>{admin?.name || "Admin"}</strong>
                <span>{admin?.email}</span>
              </div>

              <button className="logout-btn" onClick={onLogout}>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
