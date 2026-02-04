import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProfileMenu() {
  const { user, admin, logoutUser, logoutAdmin } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const profile = admin || user;
  if (!profile) return null;

  const handleLogout = () => {
    admin ? logoutAdmin() : logoutUser();
    navigate("/login");
  };

  return (
    <div className="profile-menu">
      <div className="avatar" onClick={() => setOpen(!open)}>
        {profile.image ? (
          <img src={profile.image} alt="avatar" />
        ) : (
          <span>{profile.email[0].toUpperCase()}</span>
        )}
      </div>

      {open && (
        <div className="profile-dropdown">
          <p className="profile-name">
            {profile.firstname || "Administrator"}
          </p>
          <p className="profile-email">{profile.email}</p>

          <span className={`role-badge ${admin ? "admin" : "user"}`}>
            {admin ? "Admin" : "User"}
          </span>

          <hr />

          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
