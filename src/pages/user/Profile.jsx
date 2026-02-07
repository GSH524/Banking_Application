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

  if (loading || !currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="text-slate-400 animate-pulse font-medium">Identifying Profile...</div>
      </div>
    );
  }

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

      <h1 className="text-3xl font-bold text-white mb-8">My Profile</h1>

      <div className="max-w-4xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        
        {/* PROFILE HEADER / BANNER */}
        <div className="p-8 bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-800 flex flex-col md:flex-row items-center gap-6">
          <div className="w-24 h-24 bg-blue-600 rounded-2xl flex items-center justify-center text-4xl font-bold text-white shadow-lg shadow-blue-900/20">
            {currentUser.firstName.charAt(0)}
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-bold text-white">{currentUser.fullName}</h2>
            <p className="text-slate-400 mt-1 font-mono text-sm tracking-wide">
              Customer ID: <span className="text-blue-400">{currentUser.customerId}</span>
            </p>
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
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              />
            ) : (
              <div className="px-4 py-3 bg-slate-800/20 border border-transparent text-white font-medium">
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
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              />
            ) : (
              <div className="px-4 py-3 bg-slate-800/20 border border-transparent text-white font-medium">
                {currentUser.phone}
              </div>
            )}
          </div>

          {/* Address Field (Full Width) */}
          <div className="space-y-2 md:col-span-2">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-400">
              <GeoAlt className="text-blue-400" /> Residential Address
            </label>
            {isEditing ? (
              <textarea
                rows="2"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition resize-none"
              />
            ) : (
              <div className="px-4 py-3 bg-slate-800/20 border border-transparent text-white font-medium leading-relaxed">
                {currentUser.address}
              </div>
            )}
          </div>

          <div className="h-px bg-slate-800 md:col-span-2 my-2"></div>

          {/* Security Info */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-400">
              <ShieldLock className="text-amber-500" /> Security Info 
              <span className="text-[10px] uppercase tracking-wider bg-slate-800 px-2 py-0.5 rounded text-slate-500 ml-auto">Read-only</span>
            </label>
            <div className="px-4 py-3 text-slate-500 font-medium italic">
              3 Questions Secured
            </div>
          </div>

          {/* Last Login */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-400">
              Last Login Session
            </label>
            <div className="px-4 py-3 text-white font-medium">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}