import { useState, useRef, useEffect } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { 
    Bell, BellFill, List, X, ChevronDown, Grid1x2, 
    PersonCircle, ArrowLeftRight, Bank, CreditCard, 
    ChatLeftText, House, InfoCircle, Envelope, BoxArrowRight 
} from "react-bootstrap-icons";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { userDB } from "../firebaseUser";

export default function UserNavbar({ user, onLogout }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    
    const notifRef = useRef(null);
    const profileRef = useRef(null);
    const navigate = useNavigate();

    // Grouped Admin/User Navigation
    const navLinks = [
        { name: "Dashboard", path: "/user/dashboard", icon: <Grid1x2 /> },
        { name: "Transactions", path: "/user/transactions", icon: <ArrowLeftRight /> },
    ];

    const servicesLinks = [
        { name: "Loans", path: "/user/loans", icon: <Bank /> },
        { name: "Credit Cards", path: "/user/cards", icon: <CreditCard /> },
        { name: "Feedback", path: "/user/feedback", icon: <ChatLeftText /> },
    ];

    // Notification Logic
    useEffect(() => {
        if (!user?.uid) return;
        const q = query(
            collection(userDB, "notifications"), 
            where("userId", "==", user.uid), 
            where("role", "==", "user"), 
            where("read", "==", false)
        );
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const notifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).slice(0, 10);
            setNotifications(notifs);
        });
        return () => unsubscribe();
    }, [user]);

    // Handle outside clicks for dropdowns
    useEffect(() => {
        function handleClickOutside(event) {
            if (profileRef.current && !profileRef.current.contains(event.target)) setIsProfileOpen(false);
            if (notifRef.current && !notifRef.current.contains(event.target)) setShowNotifications(false);
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <>
            <nav className="sticky top-0 z-[100] bg-slate-900/90 backdrop-blur-xl border-b border-white/5 px-4 lg:px-8">
                <div className="flex items-center justify-between h-20 max-w-7xl mx-auto">
                    
                    {/* LEFT: BRAND & MAIN NAV */}
                    <div className="flex items-center gap-8">
                        <Link to="/" className="text-xl font-black text-white tracking-tighter italic shrink-0">
                            SECURE<span className="text-blue-500">BANK</span>
                        </Link>

                        {/* DESKTOP NAV */}
                        <div className="hidden lg:flex items-center gap-1">
                            {/* Public Links */}
                            <Link to="/" className="px-3 py-2 text-sm font-bold text-slate-400 hover:text-white transition-all">Home</Link>
                            <Link to="/about" className="px-3 py-2 text-sm font-bold text-slate-400 hover:text-white transition-all">About</Link>
                            <Link to="/contact" className="px-3 py-2 text-sm font-bold text-slate-400 hover:text-white transition-all">Contact</Link>
                            
                            <div className="h-4 w-[1px] bg-white/10 mx-2" />

                            {/* Core User Links */}
                            {navLinks.map((link) => (
                                <NavLink 
                                    key={link.path} 
                                    to={link.path} 
                                    className={({ isActive }) => `px-3 py-2 text-sm font-bold transition-all ${isActive ? "text-blue-400" : "text-slate-400 hover:text-white"}`}
                                >
                                    {link.name}
                                </NavLink>
                            ))}

                            {/* SERVICES DROPDOWN */}
                            <div className="relative group px-1">
                                <button className="flex items-center gap-1 px-3 py-2 text-sm font-bold text-slate-400 group-hover:text-white transition-all">
                                    Services <ChevronDown size={10} className="group-hover:rotate-180 transition-transform" />
                                </button>
                                <div className="absolute top-full left-0 mt-1 w-48 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300">
                                    <div className="bg-slate-900 border border-white/10 rounded-xl shadow-2xl p-2 mt-2">
                                        {servicesLinks.map((s) => (
                                            <NavLink key={s.path} to={s.path} className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                                                {s.icon} {s.name}
                                            </NavLink>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: NOTIFS & PROFILE */}
                    <div className="flex items-center gap-3">
                        {/* Notifications */}
                        <div className="relative" ref={notifRef}>
                            <button onClick={() => setShowNotifications(!showNotifications)} className="p-2 text-slate-400 hover:text-white relative transition-colors">
                                {notifications.length > 0 ? (
                                    <>
                                        <BellFill className="text-blue-500" size={20} />
                                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-900"></span>
                                    </>
                                ) : <Bell size={20} />}
                            </button>
                            {/* Notification Dropdown Placeholder */}
                            {showNotifications && (
                                <div className="absolute right-0 mt-3 w-80 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[110]">
                                    <div className="p-4 border-b border-white/5 font-bold text-sm text-white">Notifications</div>
                                    <div className="max-h-64 overflow-y-auto p-2">
                                        {notifications.length === 0 ? (
                                            <p className="text-xs text-slate-500 p-4 text-center">No new notifications</p>
                                        ) : (
                                            notifications.map(n => (
                                                <div key={n.id} className="p-3 hover:bg-white/5 rounded-lg text-xs text-slate-300 mb-1 transition-colors">
                                                    {n.message}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Profile Dropdown */}
                        <div className="relative" ref={profileRef}>
                            <button 
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="flex items-center gap-2 p-1 pr-2 hover:bg-white/5 rounded-full transition-all border border-transparent hover:border-white/10"
                            >
                                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-blue-600/20">
                                    {user?.firstName?.[0] || "U"}
                                </div>
                                <ChevronDown size={10} className={`text-slate-500 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isProfileOpen && (
                                <div className="absolute right-0 mt-3 w-56 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[110] animate-in fade-in zoom-in-95 origin-top-right">
                                    <div className="p-4 border-b border-white/5 bg-white/5">
                                        <p className="text-sm font-bold text-white truncate">{user?.firstName} {user?.lastName}</p>
                                        <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest mt-0.5">User Account</p>
                                    </div>
                                    <div className="p-2">
                                        <NavLink to="/user/profile" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                                            <PersonCircle size={18} /> Profile Settings
                                        </NavLink>
                                        <button 
                                            onClick={onLogout}
                                            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors mt-1"
                                        >
                                            <BoxArrowRight size={18} /> Sign Out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Mobile Toggle */}
                        <button className="lg:hidden p-2 text-white" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                            {isMobileMenuOpen ? <X size={28} /> : <List size={28} />}
                        </button>
                    </div>
                </div>

                {/* MOBILE MENU (DASHBOARD ITEMS) */}
                {isMobileMenuOpen && (
                    <div className="lg:hidden border-t border-white/5 py-4 bg-slate-900 max-h-[70vh] overflow-y-auto">
                        <div className="flex flex-col gap-4 px-6 pb-6 border-b border-white/5">
                            <Link to="/" className="text-slate-400 font-bold text-sm">Home</Link>
                            <Link to="/about" className="text-slate-400 font-bold text-sm">About</Link>
                            <Link to="/contact" className="text-slate-400 font-bold text-sm">Contact</Link>
                        </div>
                        <div className="px-6 mt-4 space-y-2">
                             {[...navLinks, ...servicesLinks].map((link) => (
                                <NavLink 
                                    key={link.path} 
                                    to={link.path} 
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center gap-3 p-3 rounded-xl bg-white/5 text-slate-300 font-medium"
                                >
                                    {link.icon} {link.name}
                                </NavLink>
                            ))}
                        </div>
                    </div>
                )}
            </nav>

            {/* MOBILE BOTTOM NAVIGATION BAR */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[100] bg-slate-900/80 backdrop-blur-lg border-t border-white/10 px-6 py-3 pb-8">
                <div className="flex items-center justify-between max-w-md mx-auto">
                    <NavLink to="/" className={({ isActive }) => `flex flex-col items-center gap-1 ${isActive ? "text-blue-500" : "text-slate-500"}`}>
                        <House size={20} />
                        <span className="text-[9px] font-bold uppercase">Home</span>
                    </NavLink>
                    <NavLink to="/user/dashboard" className={({ isActive }) => `flex flex-col items-center gap-1 ${isActive ? "text-blue-500" : "text-slate-500"}`}>
                        <Grid1x2 size={20} />
                        <span className="text-[9px] font-bold uppercase">Console</span>
                    </NavLink>
                    <NavLink to="/user/transactions" className={({ isActive }) => `flex flex-col items-center gap-1 ${isActive ? "text-blue-500" : "text-slate-500"}`}>
                        <ArrowLeftRight size={20} />
                        <span className="text-[9px] font-bold uppercase">History</span>
                    </NavLink>
                    <NavLink to="/contact" className={({ isActive }) => `flex flex-col items-center gap-1 ${isActive ? "text-blue-500" : "text-slate-500"}`}>
                        <Envelope size={20} />
                        <span className="text-[9px] font-bold uppercase">Help</span>
                    </NavLink>
                </div>
            </div>
        </>
    );
}