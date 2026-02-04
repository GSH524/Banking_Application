import React, { useState, useEffect } from 'react';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { Person, Envelope, Phone, GeoAlt, ShieldLock, CheckCircle, XCircle } from 'react-bootstrap-icons';


export default function Profile() {
  const { currentUser, loading, updateUserProfile } = useCurrentUser();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (currentUser) {
      setFormData({
        email: currentUser.email,
        phone: currentUser.phone,
        address: currentUser.address
      });
    }
  }, [currentUser]);

  const handleSave = () => {
    updateUserProfile(formData);
    setIsEditing(false);
    showToast("Profile updated successfully!", "success");
  };

  const handleCancel = () => {
    setFormData({
      email: currentUser.email,
      phone: currentUser.phone,
      address: currentUser.address
    });
    setIsEditing(false);
    showToast("Changes discarded.", "info");
  };

  const showToast = (msg, type) => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  if (loading || !currentUser) return <div className="p-10 text-center">Identifying Profile...</div>;

  return (
    <div className="profile-main">

      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className={`toast-p ${toast.type}`}>
          {toast.msg}
        </div>
      )}

      <h1>My Profile</h1>

      <div className="profile-card">

        {/* PROFILE HEADER */}
        <div className="profile-banner">
          <div className="avatar-large">
            {currentUser.firstName.charAt(0)}
          </div>
          <div className="profile-summary">
            <h2>{currentUser.fullName}</h2>
            <p className="customer-id">Customer ID: {currentUser.customerId}</p>
          </div>

          <div className="profile-actions">
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)} className="edit-btn">
                Edit Profile
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={handleCancel} className="cancel-btn">
                  Cancel
                </button>
                <button onClick={handleSave} className="save-btn">
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </div>

        {/* DETAILS GRID */}
        <div className="profile-details-grid">

          <div className="profile-field">
            <label className="field-label">
              <Envelope /> Email Address
            </label>
            {isEditing ? (
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="field-input"
              />
            ) : (
              <div className="field-value">{currentUser.email}</div>
            )}
          </div>

          <div className="profile-field">
            <label className="field-label">
              <Phone /> Phone Number
            </label>
            {isEditing ? (
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="field-input"
              />
            ) : (
              <div className="field-value">{currentUser.phone}</div>
            )}
          </div>

          <div className="profile-field full-width">
            <label className="field-label">
              <GeoAlt /> Residential Address
            </label>
            {isEditing ? (
              <textarea
                rows="2"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="field-input"
              />
            ) : (
              <div className="field-value">{currentUser.address}</div>
            )}
          </div>

          <div className="profile-field">
            <label className="field-label">
              <ShieldLock /> Security Info <span className="readonly-hint">(Read-only)</span>
            </label>
            <div className="field-value" style={{ color: '#64748b' }}>3 Questions Secured</div>
          </div>

          <div className="profile-field">
            <label className="field-label">
              Last Login
            </label>
            <div className="field-value">{new Date().toLocaleDateString()}</div>
          </div>

        </div>
      </div>
    </div>
  );
}
