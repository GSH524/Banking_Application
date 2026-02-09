import { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Bell, BellFill, Check2All, List, X, ChevronDown, Grid1x2, PersonCircle, ArrowLeftRight, Bank, CreditCard, ChatLeftText } from "react-bootstrap-icons";
import { collection, query, where, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { userDB } from "../firebaseUser";

export default function UserNavbar({ user, onLogout }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    
    const notifRef = useRef(null);
    const profileRef = useRef(null);
    const navigate = useNavigate();

    // Navigation Items - Organized for a Navbar
    const navLinks = [
        { name: "Dashboard", path: "/user/dashboard", icon: <Grid1x2 /> },
        { name: "Transactions", path: "/user/transactions", icon: <ArrowLeftRight /> },
    ];

    const servicesLinks = [
        { name: "Loans", path: "/user/loans", icon: <Bank /> },
        { name: "Credit Cards", path: "/user/cards", icon: <CreditCard /> },
        { name: "Feedback", path: "/user/feedback", icon: <ChatLeftText /> },
    ];

    // Notification Logic (Kept from your original)
    useEffect(() => {
        if (!user?.uid) return;
        const q = query(collection(userDB, "notifications"), where("userId", "==", user.uid), where("role", "==", "user"), where("read", "==", false));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const notifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).slice(0, 10);
            setNotifications(notifs);
        });
        return () => unsubscribe();
    }, [user]);

    return (
        <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-white/5 px-4 lg:px-8">
            <div className="flex items-center justify-between h-20 max-w-7xl mx-auto">
                
                {/* BRAND & DESKTOP NAV */}
                <div className="flex items-center gap-10">
                    <h2 className="text-xl font-black text-white tracking-tighter shrink-0">
                        SECURE<span className="text-blue-500">BANK</span>
                    </h2>

                    {/* DESKTOP MENU */}
                    <div className="hidden lg:flex items-center gap-2">
                        {navLinks.map((link) => (
                            <NavLink 
                                key={link.path} 
                                to={link.path} 
                                className={({ isActive }) => `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? "text-blue-400 bg-blue-400/10" : "text-slate-400 hover:text-white"}`}
                            >
                                {link.name}
                            </NavLink>
                        ))}

                        {/* NESTED SERVICES DROPDOWN */}
                        <div className="relative group">
                            <button className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-slate-400 group-hover:text-white transition-colors">
                                Services <ChevronDown size={12} />
                            </button>
                            <div className="absolute left-0 mt-1 w-48 pt-2 hidden group-hover:block animate-in fade-in slide-in-from-top-2">
                                <div className="bg-slate-900 border border-white/10 rounded-xl shadow-2xl p-2">
                                    {servicesLinks.map((s) => (
                                        <NavLink key={s.path} to={s.path} className="flex items-center gap-3 px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-white/5 rounded-lg">
                                            {s.icon} {s.name}
                                        </NavLink>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDE: NOTIFS & PROFILE */}
                <div className="flex items-center gap-3 md:gap-5">
                    
                    {/* Notification Component (Minimized for brevity, use your original logic here) */}
                    <div className="relative" ref={notifRef}>
                        <button onClick={() => setShowNotifications(!showNotifications)} className="p-2 text-slate-400 hover:text-white relative">
                            {notifications.length > 0 ? <BellFill className="text-blue-500" size={20} /> : <Bell size={20} />}
                        </button>
                        {/* ... Insert your notification dropdown JSX here ... */}
                    </div>

                    {/* PROFILE DROPDOWN */}
                    <div className="relative" ref={profileRef}>
                        <button 
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="w-10 h-10 rounded-full border border-white/10 bg-blue-600 flex items-center justify-center text-sm font-bold text-white"
                        >
                            {user?.firstName?.[0] || "U"}
                        </button>
                        {isProfileOpen && (
                            <div className="absolute right-0 mt-3 w-48 bg-slate-900 border border-white/10 rounded-xl shadow-2xl p-2">
                                <NavLink to="/user/profile" className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-white/5 rounded-lg">
                                    <PersonCircle /> Profile
                                </NavLink>
                                <button onClick={onLogout} className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg mt-1">
                                    Sign Out
                                </button>
                            </div>
                        )}
                    </div>

                    {/* MOBILE HAMBURGER */}
                    <button className="lg:hidden p-2 text-slate-400" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                        {isMobileMenuOpen ? <X size={28} /> : <List size={28} />}
                    </button>
                </div>
            </div>

            {/* MOBILE MENU PANEL */}
            {isMobileMenuOpen && (
                <div className="lg:hidden bg-slate-900 border-t border-white/5 p-4 space-y-2 pb-8">
                    {navLinks.concat(servicesLinks).map((link) => (
                        <NavLink 
                            key={link.path} 
                            to={link.path} 
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 text-slate-300 bg-white/5 rounded-xl"
                        >
                            {link.icon} {link.name}
                        </NavLink>
                    ))}
                </div>
            )}
        </nav>
    );
}