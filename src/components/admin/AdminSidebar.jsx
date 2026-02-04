import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { 
  Grid1x2, 
  People, 
  Wallet2, 
  CreditCard, 
  ArrowLeftRight, 
  Bank, 
  GraphUp, 
  BoxArrowRight 
} from "react-bootstrap-icons";

export default function AdminSidebar() {
  const { user, logout } = useAuth();

  // Helper for active link styling
  const navLinkClass = ({ isActive }) => 
    `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
      isActive 
        ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" 
        : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
    }`;

  return (
    <aside className="w-64 h-screen bg-slate-900 flex flex-col border-r border-slate-800 sticky top-0">
      
      {/* Logo / Title */}
      <div className="p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-inner">
            <Bank className="text-white" size={18} />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">BankAdmin</h2>
        </div>
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-800 px-2 py-0.5 rounded">
          Admin Portal
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-grow px-4 space-y-1 mt-4">
        <NavLink to="/admin" end className={navLinkClass}>
          <Grid1x2 size={18} />
          <span className="font-medium">Dashboard</span>
        </NavLink>

        <NavLink to="/admin/users" className={navLinkClass}>
          <People size={18} />
          <span className="font-medium">Customers</span>
        </NavLink>

        <NavLink to="/admin/accounts" className={navLinkClass}>
          <Wallet2 size={18} />
          <span className="font-medium">Accounts</span>
        </NavLink>

        <NavLink to="/admin/cards" className={navLinkClass}>
          <CreditCard size={18} />
          <span className="font-medium">Cards</span>
        </NavLink>

        <NavLink to="/admin/transactions" className={navLinkClass}>
          <ArrowLeftRight size={18} />
          <span className="font-medium">Transactions</span>
        </NavLink>

        <NavLink to="/admin/loans" className={navLinkClass}>
          <Bank size={18} />
          <span className="font-medium">Loans</span>
        </NavLink>

        <NavLink to="/admin/reports" className={navLinkClass}>
          <GraphUp size={18} />
          <span className="font-medium">Reports</span>
        </NavLink>
      </nav>

      {/* Admin Info & Logout */}
      <div className="p-4 mt-auto border-t border-slate-800 bg-slate-900/50">
        <div className="mb-4 px-2">
          <div className="flex flex-col">
            <strong className="text-sm text-slate-100 truncate">
              {user?.name || "Admin User"}
            </strong>
            <span className="text-xs text-slate-500 truncate">
              {user?.email || "admin@vajra.com"}
            </span>
          </div>
        </div>

        <button 
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-red-900/20 hover:text-red-400 text-slate-300 rounded-lg text-sm font-semibold transition-all border border-slate-700 hover:border-red-900/50"
          onClick={logout}
        >
          <BoxArrowRight size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
}