import { useState, useRef, useEffect } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import {
  List,
  X,
  BoxArrowRight,
  Grid,
  Person,
  ShieldCheck,
  House,
  Envelope,
  InfoCircle,
  Gem,
  PersonCircle
} from "react-bootstrap-icons";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "./common/NotificationBell";

export default function Navbar() {
  const { user, logoutUser } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const navigate = useNavigate();

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsMenuOpen(false);
    await logoutUser();
    navigate("/");
  };

  const getDashboardLink = () => {
    if (!user) return "/login";
    if (user.role === 'admin') return "/admin/dashboard";
    if (user.role === 'partner') return "/partner/dashboard";
    return "/user/dashboard";
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const navItemStyles = ({ isActive }) => 
    `flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
      isActive ? "text-blue-400 bg-white/5" : "text-slate-300 hover:text-white hover:bg-white/5"
    }`;

  // Mobile Bottom Nav Item Style
  const mobileTabStyles = ({ isActive }) => 
    `flex flex-col items-center justify-center gap-1 flex-1 transition-colors ${
      isActive ? "text-blue-500" : "text-slate-400"
    }`;

  return (
    <>
      {/* --- DESKTOP & MOBILE TOP HEADER --- */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-slate-900/80 border-b border-white/10 backdrop-blur-md">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="p-2 bg-blue-600 rounded-lg text-white group-hover:bg-blue-500 transition-colors">
            <ShieldCheck size={20} />
          </div>
          <div className="text-xl font-bold tracking-tight text-white">
            VAJRA<span className="text-blue-500">BANK</span>
          </div>
        </Link>

        {/* Desktop Links (Hidden on Mobile) */}
        <ul className="hidden lg:flex items-center gap-4">
          <li><NavLink to="/" className={navItemStyles}><House size={16} /> Home</NavLink></li>
          <li><NavLink to="/about" className={navItemStyles}><InfoCircle size={16} /> About</NavLink></li>
          <li><NavLink to="/contact" className={navItemStyles}><Envelope size={16} /> Contact</NavLink></li>
          <li><NavLink to="/partner-plans" className={navItemStyles}><Gem size={16} /> Partner Plans</NavLink></li>
        </ul>

        {/* Right Side Actions */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-2">
              {user.role === 'admin' && <NotificationBell user={user} />}
              
              {/* Desktop Profile Dropdown */}
              <div className="relative hidden lg:block" ref={profileRef}>
                <button 
                  className="flex items-center gap-3 p-1 rounded-full hover:bg-white/5 transition-colors focus:outline-none"
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                >
                  <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full font-bold border border-white/20">
                    {getInitials(user.name || user.email)}
                  </div>
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-slate-900 border border-white/10 rounded-xl p-2 shadow-2xl z-[1001]">
                    <Link to={getDashboardLink()} className="flex items-center gap-3 p-3 text-slate-200 hover:bg-white/5 rounded-lg" onClick={() => setIsProfileOpen(false)}>
                      <Grid size={16} /> Dashboard
                    </Link>
                    <button onClick={handleLogout} className="flex items-center gap-3 w-full p-3 text-red-400 hover:bg-red-500/10 rounded-lg">
                      <BoxArrowRight size={16} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="hidden lg:flex items-center gap-3">
              <Link to="/login" className="px-5 py-2 text-slate-300 hover:text-white">Sign In</Link>
              <Link to="/signup" className="px-5 py-2 bg-blue-600 text-white rounded-lg">Get Started</Link>
            </div>
          )}

          {/* Mobile Menu Toggle (Visible only on Mobile) */}
          <button className="lg:hidden text-slate-300" onClick={() => setIsMenuOpen(true)}>
            <List size={28} />
          </button>
        </div>
      </nav>

      {/* --- MOBILE SIDE DRAWER OVERLAY --- */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />
          
          {/* Drawer Content */}
          <div className="absolute right-0 top-0 h-full w-72 bg-slate-900 border-l border-white/10 p-6 flex flex-col shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <span className="text-slate-400 font-bold uppercase tracking-widest text-xs">Menu</span>
              <button onClick={() => setIsMenuOpen(false)} className="text-slate-400"><X size={28} /></button>
            </div>

            <div className="flex flex-col gap-2">
              <NavLink to="/" className={navItemStyles} onClick={() => setIsMenuOpen(false)}><House size={18} /> Home</NavLink>
              <NavLink to="/about" className={navItemStyles} onClick={() => setIsMenuOpen(false)}><InfoCircle size={18} /> About</NavLink>
              <NavLink to="/contact" className={navItemStyles} onClick={() => setIsMenuOpen(false)}><Envelope size={18} /> Contact</NavLink>
              <NavLink to="/partner-plans" className={navItemStyles} onClick={() => setIsMenuOpen(false)}><Gem size={18} /> Partner Plans</NavLink>
              
              <div className="my-4 border-t border-white/5" />
              
              {user ? (
                <>
                  <Link to="/user/profile" className={navItemStyles} onClick={() => setIsMenuOpen(false)}><Person size={18} /> Profile Settings</Link>
                  <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 text-red-400"><BoxArrowRight size={18} /> Logout</button>
                </>
              ) : (
                <Link to="/login" className="w-full py-3 bg-blue-600 text-white rounded-lg text-center font-bold" onClick={() => setIsMenuOpen(false)}>Sign In</Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- MOBILE BOTTOM NAVIGATION (Tab Bar) --- */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900/90 backdrop-blur-lg border-t border-white/10 px-2 py-3 flex items-center justify-around pb-safe">
        <NavLink to="/" className={mobileTabStyles}>
          <House size={20} />
          <span className="text-[10px] font-medium">Home</span>
        </NavLink>

        <NavLink to="/partner-plans" className={mobileTabStyles}>
          <Gem size={20} />
          <span className="text-[10px] font-medium">Plans</span>
        </NavLink>

        {user && (
          <NavLink to={getDashboardLink()} className={mobileTabStyles}>
            <Grid size={20} />
            <span className="text-[10px] font-medium">Dashboard</span>
          </NavLink>
        )}

        <NavLink to={user ? "/user/profile" : "/login"} className={mobileTabStyles}>
          <PersonCircle size={20} />
          <span className="text-[10px] font-medium">{user ? "Profile" : "Login"}</span>
        </NavLink>
      </div>
    </>
  );
}