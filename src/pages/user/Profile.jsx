import React, { useState, useEffect } from 'react';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { 
  Person, Envelope, Phone, GeoAlt, ShieldLock, 
  CheckCircle, XCircle, Fingerprint 
} from 'react-bootstrap-icons';

export default function Profile() {
  const { currentUser, loading, updateUserProfile } = useCurrentUser();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [toast, setToast] = useState(null);

  // Sync local form state with currentUser data
  useEffect(() => {
    if (currentUser) {
      setFormData({
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        address: currentUser.address || ''
      });
    }
  }, [currentUser]);

  const handleSave = async () => {
    try {
      await updateUserProfile(formData);
      setIsEditing(false);
      showToast("Profile updated successfully!", "success");
    } catch (error) {
      showToast("Failed to update profile.", "error");
    }
  };

  const handleCancel = () => {
    setFormData({
      email: currentUser.email || '',
      phone: currentUser.phone || '',
      address: currentUser.address || ''
    });
    setIsEditing(false);
    showToast("Changes discarded.", "info");
  };

  const showToast = (msg, type) => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <div className="text-slate-400 font-medium">Fetching secure profile...</div>
      </div>
    );
  }

  // Handle case where user isn't found
  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="text-rose-400 font-medium">Error: Profile not found. Please log in again.</div>
      </div>
    );
  }

  // Determine the ID to display (Checks various common field names)
  const displayId = currentUser.customerId || currentUser.uid || currentUser.id || "N/A";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8">
      
      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className={`fixed top-6 right-6 px-6 py-3 rounded-xl shadow-2xl z-[1000] flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 ${
          toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-200 border border-slate-700'
        }`}>
          {toast.type === 'success' ? <CheckCircle size={18} /> : <XCircle size={18} />}
          <span className="font-medium">{toast.msg}</span>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
            <h1 className="text-3xl font-bold text-white">Account Settings</h1>
            <p className="text-slate-500 mt-2">Manage your personal information and security preferences.</p>
        </header>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          
          {/* PROFILE HEADER */}
          <div className="p-8 bg-gradient-to-br from-slate-800/50 to-slate-900 border-b border-slate-800/50 flex flex-col md:flex-row items-center gap-6">
            <div className="w-24 h-24 bg-indigo-600 rounded-2xl flex items-center justify-center text-4xl font-bold text-white shadow-lg shadow-indigo-900/40 border border-indigo-400/20">
              {currentUser.firstName ? currentUser.firstName.charAt(0) : <Person />}
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold text-white">
                {currentUser.fullName || `${currentUser.firstName} ${currentUser.lastName}`}
              </h2>
              <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                <Fingerprint className="text-blue-400" size={14} />
                <p className="text-slate-400 font-mono text-sm tracking-widest uppercase">
                  ID: <span className="text-blue-400 select-all">{displayId}</span>
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              {!isEditing ? (
                <button 
                  onClick={() => setIsEditing(true)} 
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold transition-all active:scale-95 shadow-lg shadow-blue-900/20"
                >
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-3">
                  <button 
                    onClick={handleCancel} 
                    className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold transition-all border border-slate-700"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSave} 
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold transition-all active:scale-95 shadow-lg shadow-emerald-900/20"
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* DETAILS GRID */}
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* Email Field */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-400">
                <Envelope className="text-blue-400" /> Email Address
              </label>
              {isEditing ? (
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500 transition"
                />
              ) : (
                <div className="px-4 py-3 bg-slate-800/30 border border-transparent text-white font-medium rounded-xl">
                  {currentUser.email}
                </div>
              )}
            </div>

            {/* Phone Field */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-400">
                <Phone className="text-blue-400" /> Phone Number
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500 transition"
                />
              ) : (
                <div className="px-4 py-3 bg-slate-800/30 border border-transparent text-white font-medium rounded-xl">
                  {currentUser.phone || "No phone added"}
                </div>
              )}
            </div>

            {/* Address Field */}
            <div className="space-y-2 md:col-span-2">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-400">
                <GeoAlt className="text-blue-400" /> Residential Address
              </label>
              {isEditing ? (
                <textarea
                  rows="2"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500 transition resize-none"
                />
              ) : (
                <div className="px-4 py-3 bg-slate-800/30 border border-transparent text-white font-medium rounded-xl">
                  {currentUser.address || "No address provided"}
                </div>
              )}
            </div>

            <div className="h-px bg-slate-800 md:col-span-2"></div>

            {/* Read-Only Security Section */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-400">
                <ShieldLock className="text-amber-500" /> Security Status
              </label>
              <div className="px-4 py-3 text-emerald-400 font-medium bg-emerald-500/5 rounded-xl border border-emerald-500/10 inline-flex items-center gap-2">
                <CheckCircle size={14} /> Fully Verified Account
              </div>
            </div>

            <div className="space-y-2 text-right md:text-left">
              <label className="text-sm font-medium text-slate-400">Last Account Sync</label>
              <div className="px-4 py-3 text-slate-500 text-sm font-mono">
                {new Date().toLocaleTimeString()} — Online
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}