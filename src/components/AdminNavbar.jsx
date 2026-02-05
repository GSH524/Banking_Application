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
    <nav className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-white/5 sticky top-0 z-50">
      
      {/* LEFT SECTION */}
      <div className="flex items-center gap-4">
        <button
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all active:scale-95 lg:hidden"
          onClick={onToggleSidebar}
          aria-label="Toggle Sidebar"
        >
          {isSidebarOpen ? <X size={26} /> : <List size={26} />}
        </button>
        
        <div className="hidden sm:block">
          <h1 className="text-xl font-bold text-white tracking-tight">
            Welcome, <span className="text-blue-500">{admin?.name || "Admin"}</span> 👋
          </h1>
        </div>
      </div>

      {/* RIGHT: Notifications & Profile */}
      <div className="flex items-center gap-3 md:gap-6">

        {/* FEEDBACK NOTIFICATIONS */}
        <button
          onClick={() => navigate('/admin/reports')}
          title="User Feedback"
          className="p-2 text-slate-400 hover:text-blue-400 transition-colors relative group"
        >
          <ChatSquareText size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full border-2 border-slate-950 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>

        {/* NOTIFICATIONS COMPONENT */}
        <NotificationBell user={admin} />

        {/* PROFILE MENU */}
        <div className="relative">
          <button
            className={`flex items-center justify-center w-10 h-10 rounded-xl font-bold text-sm transition-all duration-300 border-2 ${
              isOpen 
                ? "bg-blue-600 border-blue-400 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]" 
                : "bg-slate-800 border-white/10 text-slate-300 hover:border-blue-500/50"
            }`}
            onClick={() => setIsOpen((prev) => !prev)}
          >
            {getInitials(admin?.name)}
          </button>

          {/* DROPDOWN */}
          {isOpen && (
            <>
              {/* Invisible backdrop to close dropdown on outside click */}
              <div 
                className="fixed inset-0 z-[-1]" 
                onClick={() => setIsOpen(false)} 
              />
              
              <div className="absolute right-0 mt-3 w-64 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl py-2 overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="px-4 py-3 border-b border-white/5 bg-white/[0.02]">
                  <p className="text-sm font-bold text-white truncate">
                    {admin?.name || "Administrator"}
                  </p>
                  <p className="text-xs text-slate-500 truncate mt-0.5">
                    {admin?.email}
                  </p>
                </div>

                <div className="p-2">
                  <button 
                    className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white rounded-lg transition-colors"
                    onClick={() => navigate('/admin/settings')}
                  >
                    Account Settings
                  </button>
                  
                  <button 
                    className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors mt-1 font-medium"
                    onClick={onLogout}
                  >
                    Logout System
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}