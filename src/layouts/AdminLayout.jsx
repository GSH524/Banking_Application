import { Outlet, useNavigate } from "react-router-dom";
import AdminNavbar from "../components/AdminNavbar";
import { useAuth } from "../context/AuthContext";

export default function AdminLayout() {
  const { admin, logoutAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutAdmin();
    navigate("/admin");
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <AdminNavbar admin={admin} onLogout={handleLogout} />
      
      {/* Added pb-20 for mobile so the bottom bar doesn't cover content */}
      <main className="flex-1 p-4 md:p-8 pb-24 lg:pb-8">
        <div className="max-w-[1440px] mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}