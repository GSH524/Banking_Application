import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import UserSidebar from "../components/UserSidebar";
import UserNavbar from "../components/UserNavbar";
import { useAuth } from "../context/AuthContext";


export default function UserLayout() {
  const { user, logoutUser } = useAuth();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate("/"); // Redirect to home on logout
  };

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className={`user-layout ${isSidebarOpen ? "sidebar-open" : ""}`}>
      <UserSidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
      <div className="user-main">
        <UserNavbar
          user={user}
          onLogout={handleLogout}
          onToggleSidebar={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
        />
        <main className="user-content" onClick={closeSidebar}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
