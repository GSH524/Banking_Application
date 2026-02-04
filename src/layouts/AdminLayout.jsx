import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import AdminNavbar from "../components/AdminNavbar";



export default function AdminLayout() {
  const { admin, logoutAdmin } = useAuth();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutAdmin();
    navigate("/admin");
  };

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className={`admin-layout ${isSidebarOpen ? "sidebar-open" : ""}`}>
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
      <div className="admin-main">
        <AdminNavbar 
          admin={admin} 
          onLogout={handleLogout} 
          onToggleSidebar={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
        />
        <main className="admin-content" onClick={closeSidebar}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
