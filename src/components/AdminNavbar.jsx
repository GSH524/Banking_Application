import { useState } from "react";
import { List, X, ChatSquareText, BoxArrowRight, Gear } from "react-bootstrap-icons";
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

  const handleLogoutClick = () => {
    setIsOpen(false);
    // Call the logout function from props (which should clear context/localStorage)
    onLogout(); 
    // Redirect directly to the login portal
    navigate("/login"); 
  };

  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-white/5 sticky top-0 z-[100]">
      
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
            Welcome, <span className="text-indigo-500">{admin?.name || "Admin"}</span> 👋
          </h1>
        </div>
      </div>

      {/* RIGHT SECTION: Notifications & Profile */}
      <div className="flex items-center gap-2 md:gap-5">

        {/* FEEDBACK REPORTS */}
        <button
          onClick={() => navigate('/admin/reports')}
          title="User Feedback"
          className="p-2.5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/5 rounded-xl transition-all relative group"
        >
          <ChatSquareText size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full border-2 border-slate-950 scale-0 group-hover:scale-100 transition-transform" />
        </button>

        {/* NOTIFICATIONS BELL */}
        <NotificationBell user={admin} />

        <div className="h-8 w-px bg-white/10 mx-1 hidden md:block" />

        {/* PROFILE DROPDOWN */}
        <div className="relative">
          <button
            className={`flex items-center justify-center w-10 h-10 rounded-xl font-bold text-xs transition-all duration-300 border-2 ${
              isOpen 
                ? "bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-500/20" 
                : "bg-slate-900 border-white/5 text-slate-400 hover:border-indigo-500/50 hover:text-indigo-400"
            }`}
            onClick={() => setIsOpen((prev) => !prev)}
          >
            {getInitials(admin?.name)}
          </button>

          {/* DROPDOWN MENU */}
          {isOpen && (
            <>
              {/* Overlay Backdrop */}
              <div 
                className="fixed inset-0 z-[-1] cursor-default" 
                onClick={() => setIsOpen(false)} 
              />
              
              <div className="absolute right-0 mt-3 w-64 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl py-2 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* User Info Header */}
                <div className="px-4 py-4 border-b border-white/5">
                  <p className="text-sm font-bold text-white truncate leading-none">
                    {admin?.name || "Administrator"}
                  </p>
                  <p className="text-[11px] text-indigo-400 font-bold uppercase tracking-widest mt-2 opacity-80">
                    System Root
                  </p>
                  <p className="text-xs text-slate-500 truncate mt-1">
                    {admin?.email}
                  </p>
                </div>

                <div className="p-2 space-y-1">
                  <button 
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white rounded-xl transition-colors group"
                    onClick={() => { navigate('/admin/settings'); setIsOpen(false); }}
                  >
                    <Gear className="text-slate-500 group-hover:text-indigo-400" />
                    Account Settings
                  </button>
                  
                  <div className="h-px bg-white/5 mx-2 my-1" />

                  <button 
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-colors font-semibold group"
                    onClick={handleLogoutClick}
                  >
                    <BoxArrowRight className="group-hover:-translate-x-0.5 transition-transform" />
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