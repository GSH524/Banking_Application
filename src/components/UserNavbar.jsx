import { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Bell, BellFill, Check2All, List, X } from "react-bootstrap-icons";
import { collection, query, where, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { userDB } from "../firebaseUser";

export default function UserNavbar({ user, onLogout, onToggleSidebar, isSidebarOpen }) {
    const [isOpen, setIsOpen] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const dropdownRef = useRef(null);
    const notifRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user?.uid) return;
        const q = query(
            collection(userDB, "notifications"),
            where("userId", "==", user.uid),
            where("role", "==", "user"),
            where("read", "==", false)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const notifs = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .sort((a, b) => (b.createdAt?.toDate?.() || new Date(0)) - (a.createdAt?.toDate?.() || new Date(0)))
                .slice(0, 10);
            setNotifications(notifs);
        });
        return () => unsubscribe();
    }, [user]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsOpen(false);
            if (notifRef.current && !notifRef.current.contains(event.target)) setShowNotifications(false);
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const markAsRead = async (notif) => {
        try {
            await updateDoc(doc(userDB, "notifications", notif.id), { read: true });
            setShowNotifications(false);
            if (notif.redirectTo) navigate(notif.redirectTo);
        } catch (err) { console.error(err); }
    };

    const markAllRead = async () => {
        try {
            const batchPromises = notifications.map(n => updateDoc(doc(userDB, "notifications", n.id), { read: true }));
            await Promise.all(batchPromises);
            setShowNotifications(false);
        } catch (err) { console.error(err); }
    };

    const getInitials = (name) => {
        return name ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "US";
    };

    return (
        <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-slate-900/80 backdrop-blur-md border-b border-white/5">
            <div className="flex items-center gap-4">
                <button
                    className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all lg:hidden"
                    onClick={onToggleSidebar}
                    aria-label="Toggle Sidebar"
                >
                    {isSidebarOpen ? <X size={24} /> : <List size={24} />}
                </button>
                <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                    Welcome, <span className="text-blue-400">{user?.firstName || "User"}</span> 👋
                </h1>
            </div>

            <div className="flex items-center gap-5">
                {/* NOTIFICATIONS */}
                <div className="relative" ref={notifRef}>
                    <button
                        className="relative p-2 text-slate-400 hover:text-white transition-colors"
                        onClick={() => setShowNotifications(!showNotifications)}
                    >
                        {notifications.length > 0 ? <BellFill className="text-blue-500" size={20} /> : <Bell size={20} />}
                        {notifications.length > 0 && (
                            <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-slate-900 shadow-lg shadow-red-500/40">
                                {notifications.length}
                            </span>
                        )}
                    </button>

                    {showNotifications && (
                        <div className="absolute right-0 mt-3 w-80 origin-top-right rounded-2xl bg-slate-900 border border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                            <div className="flex items-center justify-between p-4 bg-white/5 border-b border-white/5">
                                <strong className="text-white text-sm">Notifications</strong>
                                {notifications.length > 0 && (
                                    <button onClick={markAllRead} className="flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300">
                                        <Check2All /> Mark all
                                    </button>
                                )}
                            </div>

                            <div className="max-h-80 overflow-y-auto custom-scrollbar">
                                {notifications.length === 0 ? (
                                    <div className="p-8 text-center text-slate-500 text-sm">
                                        No new notifications
                                    </div>
                                ) : (
                                    notifications.map(notif => (
                                        <div
                                            key={notif.id}
                                            onClick={() => markAsRead(notif)}
                                            className="p-4 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors group"
                                        >
                                            <p className="text-sm text-slate-300 group-hover:text-white leading-snug mb-1">{notif.message}</p>
                                            <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                                                {notif.createdAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                            
                            <div className="p-3 bg-white/5 border-t border-white/5 text-center">
                                <button
                                    onClick={() => { setShowNotifications(false); navigate('/user/notifications'); }}
                                    className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-widest"
                                >
                                    View All
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* PROFILE */}
                <div className="relative" ref={dropdownRef}>
                    <button 
                        className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-white/10 bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold text-sm shadow-lg hover:scale-105 transition-transform"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        {getInitials(user?.name)}
                    </button>

                    {isOpen && (
                        <div className="absolute right-0 mt-3 w-56 origin-top-right rounded-2xl bg-slate-900 border border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                            <div className="p-4 border-b border-white/5 bg-white/5">
                                <p className="text-sm font-bold text-white truncate">{user?.name || "User"}</p>
                                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                            </div>
                            <div className="p-2">
                                <button 
                                    className="w-full flex items-center px-3 py-2 text-sm text-red-400 font-medium hover:bg-red-500/10 rounded-lg transition-colors"
                                    onClick={onLogout}
                                >
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}