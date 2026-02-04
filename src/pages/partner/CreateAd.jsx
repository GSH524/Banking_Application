import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { userDB } from "../../firebaseUser";
import toast, { Toaster } from "react-hot-toast";
import { Image, Link45deg, Calendar, CurrencyDollar } from "react-bootstrap-icons";


export default function CreateAd() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        imageUrl: "",
        link: "",
        durationDays: "30",
        budget: "100",
        placements: {
            home: true,
            about: true,
            contact: true
        }
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePlacementToggle = (placement) => {
        setFormData(prev => ({
            ...prev,
            placements: {
                ...prev.placements,
                [placement]: !prev.placements[placement]
            }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (!formData.title || !formData.imageUrl || !formData.link) {
            toast.error("Please fill in all required fields");
            setLoading(false);
            return;
        }

        const placements = [];
        if (formData.placements.home) placements.push("HOME");
        if (formData.placements.about) placements.push("ABOUT");
        if (formData.placements.contact) placements.push("CONTACT");

        if (placements.length === 0) {
            toast.error("Please select at least one placement");
            setLoading(false);
            return;
        }

        try {
            const adData = {
                partnerId: user.uid,
                partnerName: user.displayName || user.companyName,
                title: formData.title,
                imageUrl: formData.imageUrl,
                redirectUrl: formData.link,
                durationDays: parseInt(formData.durationDays),
                budget: parseFloat(formData.budget),
                placements: placements,
                status: "PENDING",
                createdAt: serverTimestamp()
            };

            const docRef = await addDoc(collection(userDB, "ads"), adData);

            await addDoc(collection(userDB, "notifications"), {
                type: "AD_SUBMITTED",
                adId: docRef.id,
                partnerId: user.uid,
                message: `New ad submitted by ${user.companyName}`,
                targetRole: "admin",
                isRead: false,
                createdAt: serverTimestamp()
            });

            toast.success("Ad submitted for approval!");
            setTimeout(() => navigate("/partner/dashboard"), 1500);

        } catch (err) {
            console.error("Error creating ad:", err);
            toast.error("Failed to create ad.");
        } finally {
            setLoading(false);
        }
    };

    const dailySpend = formData.budget && formData.durationDays
        ? (parseFloat(formData.budget) / parseInt(formData.durationDays)).toFixed(2)
        : "0.00";

    return (
        <div className="create-ad-page">
            <Toaster position="top-right" />

            <div className="create-ad-container">
                {/* LEFT SIDE - FORM */}
                <div className="ad-form-section">
                    <div className="form-header">
                        <p className="form-subtitle">Launch a new ad across the Vajra ecosystem. Approval takes ~24h.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="ad-form">
                        {/* Campaign Headline */}
                        <div className="form-group">
                            <label className="form-label">CAMPAIGN HEADLINE</label>
                            <div className="input-with-icon">
                                
                                <input
                                    name="title"
                                    className="form-input"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="e.g. Zero Fee International Transfers"
                                    required
                                />
                            </div>
                        </div>

                        {/* Creative Image URL */}
                        <div className="form-group">
                            <label className="form-label">CREATIVE IMAGE URL</label>
                            <div className="input-with-icon">
                                
                                <input
                                    name="imageUrl"
                                    className="form-input"
                                    value={formData.imageUrl}
                                    onChange={handleChange}
                                    placeholder="https://example.com/banner.jpg"
                                    required
                                />
                            </div>
                            <p className="input-hint">Recommended size: 1920x600px (JPG/PNG)</p>
                        </div>

                        {/* Destination URL */}
                        <div className="form-group">
                            <label className="form-label">DESTINATION URL</label>
                            <div className="input-with-icon">
                                
                                <input
                                    name="link"
                                    className="form-input"
                                    value={formData.link}
                                    onChange={handleChange}
                                    placeholder="https://yourbusiness.com/offer"
                                    required
                                />
                            </div>
                        </div>

                        {/* Duration & Budget */}
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">DURATION</label>
                                <div className="input-with-icon">
                                    
                                    <select
                                        name="durationDays"
                                        className="form-select"
                                        value={formData.durationDays}
                                        onChange={handleChange}
                                    >
                                        <option value="7">7 Days</option>
                                        <option value="14">14 Days</option>
                                        <option value="30">30 Days</option>
                                        <option value="60">60 Days</option>
                                        <option value="90">90 Days</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">BUDGET (USD)</label>
                                <div className="input-with-icon">
                                   
                                    <input
                                        type="number"
                                        name="budget"
                                        className="form-input"
                                        value={formData.budget}
                                        onChange={handleChange}
                                        placeholder="100"
                                        min="10"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Ad Placements */}
                        <div className="form-group">
                            <label className="form-label">AD PLACEMENTS</label>
                            <div className="placement-buttons">
                                <button
                                    type="button"
                                    className={`placement-btn ${formData.placements.home ? 'active' : ''}`}
                                    onClick={() => handlePlacementToggle('home')}
                                >
                                    <span className="placement-check">✓</span> Home
                                </button>
                                <button
                                    type="button"
                                    className={`placement-btn ${formData.placements.about ? 'active' : ''}`}
                                    onClick={() => handlePlacementToggle('about')}
                                >
                                    <span className="placement-check">✓</span> About
                                </button>
                                <button
                                    type="button"
                                    className={`placement-btn ${formData.placements.contact ? 'active' : ''}`}
                                    onClick={() => handlePlacementToggle('contact')}
                                >
                                    <span className="placement-check">✓</span> Contact
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button type="submit" className="submit-btn" disabled={loading}>
                            {loading ? "Submitting..." : "Submit for Approval"}
                        </button>
                    </form>
                </div>

                {/* RIGHT SIDE - PREVIEW */}
                <div className="ad-preview-section">
                    <div className="preview-header">
                        <span className="sponsored-badge">SPONSORED</span>
                    </div>

                    <div className="preview-container">
                        {formData.imageUrl ? (
                            <img
                                src={formData.imageUrl}
                                alt="Ad Preview"
                                className="preview-image"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                }}
                            />
                        ) : null}
                        <div className="preview-placeholder" style={{ display: formData.imageUrl ? 'none' : 'flex' }}>
                            <Image size={48} color="#64748b" />
                            <p>Image Preview</p>
                        </div>
                    </div>

                  

                    <div className="campaign-summary">
                        <div className="summary-header">
                            <span className="summary-icon">ℹ️</span>
                            <span className="summary-title">Campaign Summary</span>
                        </div>
                        <div className="summary-row">
                            <span>Duration:</span>
                            <strong>{formData.durationDays} Days</strong>
                        </div>
                        <div className="summary-row">
                            <span>Total Budget:</span>
                            <strong>${formData.budget}</strong>
                        </div>
                        <div className="summary-row">
                            <span>Daily Spend:</span>
                            <strong>${dailySpend} / day</strong>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
