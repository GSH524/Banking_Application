import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useAdminActions } from "../../hooks/useAdminActions";
import { Person, Envelope, Phone, GeoAlt, ShieldLock, ClockHistory, Building } from 'react-bootstrap-icons';

export default function AdminProfile() {
  const { admin } = useAuth();
  const { auditLogs } = useAdminActions(); // Link to real audit logs
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [toast, setToast] = useState(null);

  // Initialize form data from admin context + local persistence
  useEffect(() => {
    if (admin) {
      // Try loading persisted admin details
      const savedProfile = localStorage.getItem(`adminProfile_${admin.email}`);
      const savedData = savedProfile ? JSON.parse(savedProfile) : {};

      setFormData({
        firstName: admin.name.split(' ')[0],
        lastName: admin.name.split(' ')[1] || '',
        email: admin.email,
        role: admin.role,
        phone: savedData.phone || "+91 98765 43210",
        address: savedData.address || "Hyderabad, India",
        branch: "Headquarters (HYD-01)"
      });
    }
  }, [admin]);

  const handleSave = () => {
    // Save to local storage to simulate backend update
    localStorage.setItem(`adminProfile_${admin.email}`, JSON.stringify({
      phone: formData.phone,
      address: formData.address
    }));
    setIsEditing(false);
    showToast("Profile Updated Successfully", "success");
  };

  const showToast = (msg, type) => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Get recent actions for this admin (mocking 'Mahesh K.' check based on name)
  const recentActions = auditLogs.slice(0, 5);

  if (!admin) return <div>Loading...</div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '40px', position: 'relative' }}>

      {/* TOAST */}
      {toast && (
        <div style={{ position: 'fixed', top: '20px', right: '20px', background: '#10b981', color: 'white', padding: '12px 24px', borderRadius: '8px', zIndex: 1000, animation: 'fadeUp 0.3s ease' }}>
          {toast.msg}
        </div>
      )}

      {/* HEADER */}
      <div className="glass-header">
        <h1 className="glass-title">Admin Profile</h1>
        <p className="glass-subtitle">Manage your credentials and view activity logs.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>

        {/* LEFT COL: PROFILE ACTIONS */}
        <div className="glass-card" style={{ padding: '32px' }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '32px', paddingBottom: '32px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
            <div style={{ width: '80px', height: '80px', background: 'linear-gradient(135deg, #0f172a, #334155)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '32px', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
              {formData.firstName?.charAt(0)}
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ margin: 0, fontSize: '24px', color: '#0f172a' }}>{formData.firstName} {formData.lastName}</h2>
              <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                <span style={{ fontSize: '13px', background: '#e0f2fe', color: '#0369a1', padding: '2px 10px', borderRadius: '12px', fontWeight: '600' }}>{formData.role}</span>
                <span style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b' }}><Building size={12} /> {formData.branch}</span>
              </div>
            </div>
            <div>
              {isEditing ? (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => setIsEditing(false)} className="glass-btn">Cancel</button>
                  <button onClick={handleSave} className="glass-btn primary">Save Changes</button>
                </div>
              ) : (
                <button onClick={() => setIsEditing(true)} className="glass-btn">Edit Profile</button>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>

            <div>
              <label style={{ display: 'block', color: '#64748b', fontSize: '13px', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email Address</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Envelope color="#94a3b8" />
                <span style={{ color: '#0f172a', fontWeight: '500' }}>{formData.email}</span>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', color: '#64748b', fontSize: '13px', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Phone Number</label>
              {isEditing ? (
                <input className="glass-input" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Phone color="#94a3b8" />
                  <span style={{ color: '#0f172a', fontWeight: '500' }}>{formData.phone}</span>
                </div>
              )}
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', color: '#64748b', fontSize: '13px', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Office Address</label>
              {isEditing ? (
                <input className="glass-input" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <GeoAlt color="#94a3b8" />
                  <span style={{ color: '#0f172a', fontWeight: '500' }}>{formData.address}</span>
                </div>
              )}
            </div>

            <div style={{ gridColumn: 'span 2', background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <ShieldLock color="#334155" size={20} />
                <div>
                  <p style={{ margin: 0, fontWeight: '600', color: '#334155', fontSize: '14px' }}>Security Status</p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Two-Factor Authentication is enabled.</p>
                </div>
                <span style={{ marginLeft: 'auto', color: '#10b981', fontWeight: '600', fontSize: '12px' }}>Active</span>
              </div>
            </div>

          </div>

        </div>

        {/* RIGHT COL: RECENT ACTIVITY */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', color: '#0f172a' }}>Recent Admin Activity</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {recentActions.length > 0 ? recentActions.map(log => (
              <div key={log.id} style={{ paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                  <span style={{ fontWeight: '600', color: '#334155' }}>{log.action}</span>
                  <span style={{ color: '#94a3b8' }}>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  {log.details}
                </div>
              </div>
            )) : (
              <p style={{ color: '#94a3b8', fontSize: '14px', textAlign: 'center', padding: '20px' }}>No recent activity logged.</p>
            )}

            <div style={{ marginTop: 'auto', paddingTop: '12px', textAlign: 'center' }}>
              <button className="glass-btn" style={{ width: '100%', fontSize: '12px' }}>View Full Audit Logs</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
