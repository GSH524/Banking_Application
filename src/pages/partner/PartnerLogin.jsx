import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { userAuth, userDB } from "../../firebaseUser";
import { useAuth } from "../../context/AuthContext";
import { Eye, EyeSlash } from "react-bootstrap-icons";


export default function PartnerLogin() {
  const navigate = useNavigate();
  const { loginUser } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    // Basic validation
    if (!email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      // 1. Authenticate with Firebase
      const userCredential = await signInWithEmailAndPassword(userAuth, email, password);
      const user = userCredential.user;

      // 2. Verified it's a partner
      const partnerDoc = await getDoc(doc(userDB, "partners", user.uid));

      if (!partnerDoc.exists()) {
        // If not found in partner collection, basic users shouldn't login here
        setError("No partner account found. If you are a specific user, please use the main login.");
        await userAuth.signOut();
        setLoading(false);
        return;
      }

      const partnerData = partnerDoc.data();

      // 3. Set Auth Context
      await loginUser({
        uid: user.uid,
        email: user.email,
        role: "partner",
        source: "firebase",
        displayName: partnerData.companyName || partnerData.fullName,
        ...partnerData
      });

      // 4. Check Activity Status
      if (partnerData.isActive) {
        navigate("/partner/dashboard");
      } else {
        navigate("/partner/payment");
      }

    } catch (err) {
      console.error("Login failed:", err);
      if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password") {
        setError("Invalid email or password.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many attempts. Please try again later.");
      } else {
        setError("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="partner-login-page">
      <div className="login-card">
        <div className="login-header">
          <h2>Partner Portal</h2>
          <p>Sign in to manage your campaigns</p>
        </div>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              className="glass-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="partner@company.com"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                className="glass-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
              <span
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  cursor: "pointer",
                  color: "#94a3b8"
                }}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeSlash /> : <Eye />}
              </span>
            </div>
          </div>

          <button type="submit" className="glass-btn" disabled={loading}>
            {loading ? "Signing In..." : "Access Dashboard"}
          </button>
        </form>

        <div className="register-link">
          New Partner?
          <span onClick={() => navigate("/partner-plans")}> Join Network</span>
        </div>
      </div>
    </div>
  );
}
