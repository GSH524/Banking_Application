import { NavLink } from "react-router-dom";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { X } from "react-bootstrap-icons";


export default function UserSidebar({ isOpen, onClose }) {
  const { currentUser } = useCurrentUser();

  return (
    <aside className={`user-sidebar ${isOpen ? "open" : ""}`}>
      <div>
        <div className="sidebar-brand">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>SecureBank</h2>
            <button className="mobile-close-btn" onClick={onClose} style={{ display: 'none' }}>
              <X size={24} />
            </button>
          </div>
          <p>Welcome, {currentUser ? currentUser.firstName : "User"}</p>
        </div>

        <ul className="sidebar-menu">
          <li><NavLink to="/user/dashboard" onClick={onClose}>Dashboard</NavLink></li> <br></br>
          <li><NavLink to="/user/profile" onClick={onClose}>Profile</NavLink></li> <br></br>
          <li><NavLink to="/user/transactions" onClick={onClose}>Transactions</NavLink></li> <br></br>
          <li><NavLink to="/user/loans" onClick={onClose}>Loans</NavLink></li> <br></br>
          <li><NavLink to="/user/cards" onClick={onClose}>Credit Cards</NavLink></li> <br></br>
          <li><NavLink to="/user/feedback" onClick={onClose}>Feedback</NavLink></li> <br></br>
        </ul>
      </div>


    </aside>

  );

}
