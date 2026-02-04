import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { userAuth, userDB } from "../../firebaseUser";
import { useAuth } from "../../context/AuthContext";
import { Eye, EyeSlash, CheckCircleFill } from "react-bootstrap-icons";


export default function PartnerRegister() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { loginUser } = useAuth();
    const plan = searchParams.get("plan") || "Starter";

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        companyName: "",
        password: "",
        confirmPassword: ""
    });

    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Plan Details Map
    const planDetails = {
        Starter: { maxAds: 1, days: 30, price: 29 },
        Growth: { maxAds: 5, days: 30, price: 99 },
        Enterprise: { maxAds: 9999, days: 30, price: 299 }
    };

    const currentPlan = planDetails[plan] || planDetails.Starter;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters");
            setLoading(false);
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(
                userAuth,
                formData.email,
                formData.password
            );
            const user = userCredential.user;

            const partnerData = {
                fullName: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                companyName: formData.companyName,
                role: "partner",
                plan: plan,
                maxAdsPerDay: currentPlan.maxAds,
                subscriptionDays: currentPlan.days,
                isActive: false,
                createdAt: serverTimestamp()
            };

            await setDoc(doc(userDB, "partners", user.uid), partnerData);

            // Auto-login the partner after registration
            await loginUser({
                uid: user.uid,
                email: user.email,
                role: "partner",
                source: "firebase",
                displayName: formData.companyName || formData.fullName,
                ...partnerData
            });

            navigate("/partner/payment");

        } catch (err) {
            console.error("Partner Registration Error:", err);
            if (err.code === "auth/email-already-in-use") {
                setError("Email is already registered.");
            } else {
                setError("Registration failed. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="partner-register-page">
            <div className="register-card">
                {/* SIDEBAR */}
                <div className="register-sidebar">
                    <div className="sidebar-content">
                        <h3>Join Vajra Partner Network</h3>
                        <p>Scale your business with our premium ad network.</p>

                        <div className="plan-summary">
                            <span className="plan-badge">{plan} Plan</span>
                            <h4>${currentPlan.price}/month</h4>
                            <ul className="plan-features-list">
                                <li><CheckCircleFill className="text-success" /> {currentPlan.maxAds} Active Ad(s)</li>
                                <li><CheckCircleFill className="text-success" /> Analytics Dashboard</li>
                                <li><CheckCircleFill className="text-success" /> 24/7 Support</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* MAIN FORM */}
                <div className="register-main">
                    <div className="register-header">
                        <h2>Create Account</h2>
                        <p>Enter your business details to get started.</p>
                    </div>

                    {error && <div className="error-banner">{error}</div>}

                    <form onSubmit={handleRegister} className="register-form">
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    className="glass-input"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    required
                                    placeholder="John Doe"
                                />
                            </div>

                            <div className="form-group">
                                <label>Company Name</label>
                                <input
                                    type="text"
                                    name="companyName"
                                    className="glass-input"
                                    value={formData.companyName}
                                    onChange={handleChange}
                                    required
                                    placeholder="Acme Inc."
                                />
                            </div>

                            <div className="form-group">
                                <label>Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    className="glass-input"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    placeholder="partner@company.com"
                                />
                            </div>

                            <div className="form-group">
                                <label>Phone Number</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    className="glass-input"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                    placeholder="+1 234 567 890"
                                />
                            </div>

                            <div className="form-group">
                                <label>Password</label>
                                <div className="password-input-wrapper">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        className="glass-input"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        placeholder="••••••••"
                                    />
                                    <span
                                        className="password-toggle"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeSlash /> : <Eye />}
                                    </span>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Confirm Password</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    className="glass-input"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button type="submit" className="glass-btn primary w-100 mt-4" disabled={loading}>
                            {loading ? "Creating Account..." : "Proceed to Payment"}
                        </button>
                    </form>

                    <p className="login-link-text mt-5">
                        Already have an account?
                        <span onClick={() => navigate('/partner/login')}> <h5 style={{ color: "white", cursor: "pointer" }}>Partner Login </h5> </span>
                    </p>

                </div>
            </div>
        </div>
    );
}
