import { NavLink } from "react-router-dom";
import { X } from "react-bootstrap-icons";


export default function Sidebar({ isOpen, onClose }) {

  return (
    <aside className={`admin-sidebar ${isOpen ? "open" : ""}`}>
      <div>
        {/* HEADER */}
        <div className="admin-sidebar-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>BankAdmin</h2>
            <button className="mobile-close-btn" onClick={onClose} style={{ display: 'none' }}>
              <X size={24} />
            </button>
          </div>
          <p>Admin Dashboard</p>
        </div>

        {/* MENU */}
        <ul className="admin-sidebar-menu">
          <li><NavLink to="dashboard" onClick={onClose}>Dashboard</NavLink></li>
          <li><NavLink to="profile" onClick={onClose}>Profile</NavLink></li>
          <li><NavLink to="customers" onClick={onClose}>Customers</NavLink></li>
          <li><NavLink to="accounts" onClick={onClose}>Accounts</NavLink></li>
          <li><NavLink to="cards" onClick={onClose}>Cards</NavLink></li>
          <li><NavLink to="loans" onClick={onClose}>Loans</NavLink></li>
          <li><NavLink to="kyc" onClick={onClose}>KYC</NavLink></li>
          <li><NavLink to="reports" onClick={onClose}>Reports</NavLink></li>
          <li><NavLink to="ads" onClick={onClose}>Ads Management</NavLink></li>
        </ul>
      </div>
    </aside>
  );
}
