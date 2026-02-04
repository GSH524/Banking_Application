import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp, addDoc, collection } from "firebase/firestore";
import { userAuth, userDB } from "../firebaseUser";

import { FaEye, FaEyeSlash } from "react-icons/fa";


export default function Login() {
  const navigate = useNavigate();
  const { loginUser, loginLegacyUser } = useAuth();

  const [mode, setMode] = useState("user"); // user | signup

  // common
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // signup-only
  const [firstname, setFirstname] = useState("");
  const [mobile, setMobile] = useState("");
  const [image, setImage] = useState("");

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  /* ================= TYPING ANIMATION ================= */
  const fullText = "Secure Banking Access";
  const [typedText, setTypedText] = useState("");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < fullText.length) {
      const timer = setTimeout(() => {
        setTypedText((prev) => prev + fullText[index]);
        setIndex((prev) => prev + 1);
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [index]);

  /* ================= PASSWORD VALIDATION ================= */
  const validatePassword = (pwd) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(pwd);

  /* ================= IMAGE UPLOAD ================= */
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 800 * 1024) {
      setError("Image must be under 800KB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setImage(reader.result);
    reader.readAsDataURL(file);
  };

  /* ================= MAIN SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    setError("");
    setSubmitting(true);

    if (mode === "user") {
      // HANDLE LOGIN
      try {
        // Sign in with Firebase Auth
        const userCredential = await signInWithEmailAndPassword(
          userAuth,
          email,
          password
        );

        const user = userCredential.user;

        // Fetch user profile from Firestore
        const userDoc = await getDoc(doc(userDB, 'users', user.uid));

        if (!userDoc.exists()) {
          // CHECK IF PARTNER
          const partnerDoc = await getDoc(doc(userDB, 'partners', user.uid));

          if (partnerDoc.exists()) {
            const partnerData = partnerDoc.data();
            await loginUser({
              uid: user.uid,
              email: user.email,
              role: "partner",
              source: "firebase",
              displayName: partnerData.companyName || partnerData.fullName,
              ...partnerData
            });
            navigate("/partner/dashboard");
            return;
          }

          setError("User profile not found. Please contact support.");
          setSubmitting(false);
          return;
        }

        const userData = userDoc.data();

        // Check if user is approved by admin
        if (userData.status === "pending") {
          await userAuth.signOut();
          setError("Your account is pending admin approval. Please wait for approval.");
          setSubmitting(false);
          return;
        }

        if (userData.status === "rejected") {
          await userAuth.signOut();
          setError("Your account request was rejected by admin. Please contact support.");
          setSubmitting(false);
          return;
        }

        if (userData.status !== "approved") {
          await userAuth.signOut();
          setError("Your account access is currently restricted.");
          setSubmitting(false);
          return;
        }

        // User is approved, proceed with login
        await loginUser({
          uid: user.uid,
          email: user.email,
          role: "user",
          source: userData.source || "firebase",
          displayName: `${userData.firstName} ${userData.lastName}`,
          ...userData
        });

        setShowPassword(false);
        navigate("/user/dashboard");

      } catch (error) {
        console.error('Firebase Login attempt failed, checking legacy...', error.code);

        // FALLBACK TO LEGACY JSON USERS
        try {
          const response = await fetch('/bankData.json');
          if (!response.ok) throw new Error("Failed to load bank data");
          const allData = await response.json();

          // Find all records for this email
          const userRows = allData.filter(row => row.Email?.toLowerCase() === email.toLowerCase());

          if (userRows.length > 0) {
            const profile = userRows[0];
            const legacyPassword = profile["Contact Number"]?.toString();

            if (password === legacyPassword) {
              // Password matches Contact Number!
              const { normalizeLegacyUser } = await import("../utils/userUtils");
              const legacyUser = normalizeLegacyUser(userRows);

              await loginUser(legacyUser);
              navigate("/user/dashboard");
              return;
            } else {
              setError("Incorrect password for legacy account.");
              setSubmitting(false);
              return;
            }
          }
        } catch (legacyErr) {
          console.error('Legacy check failed:', legacyErr);
        }

        // FALLBACK TO REST API LOGIN (for partner/admin accounts)
        try {
          const { authService } = await import("../services/authService");

          console.log('Attempting REST API login...');
          const result = await authService.login(email, password);

          if (result.success) {
            console.log('✅ REST API login successful:', result.user.role);

            // Login successful via REST API
            await loginUser({
              uid: result.user.id,
              email: result.user.email,
              role: result.user.role,
              source: "rest-api",
              displayName: result.user.name,
              businessName: result.user.businessName
            });

            // Navigate based on role
            if (result.user.role === 'admin') {
              navigate("/admin/dashboard");
            } else if (result.user.role === 'partner') {
              navigate("/partner/dashboard");
            } else {
              navigate("/user/dashboard");
            }
            return;
          }
        } catch (apiErr) {
          console.error('REST API login failed:', apiErr);
        }

        let errorMessage = "Invalid email or password";

        if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
          errorMessage = "No account found with this email.";
        } else if (error.code === 'auth/wrong-password') {
          errorMessage = "Incorrect password.";
        } else if (error.code === 'auth/invalid-email') {
          errorMessage = "Invalid email address.";
        } else if (error.code === 'auth/user-disabled') {
          errorMessage = "This account has been disabled.";
        } else if (error.code === 'auth/too-many-requests') {
          errorMessage = "Too many failed login attempts. Please try again later.";
        }

        setError(errorMessage);
      } finally {
        setSubmitting(false);
      }
      return;
    }

    // HANDLE REGISTRATION
    try {
      // 1. Check if user exists in bankData.json (Legacy)
      const response = await fetch('/bankData.json');
      let isLegacy = false;
      let legacyRows = [];
      if (response.ok) {
        const allData = await response.json();
        legacyRows = allData.filter(row => row.Email?.toLowerCase() === email.toLowerCase());
        if (legacyRows.length > 0) isLegacy = true;
      }

      // 2. Create in Firebase
      const userCredential = await createUserWithEmailAndPassword(userAuth, email, password);
      const user = userCredential.user;

      // 3. Prepare Firestore profile with integrated legacy data
      let userProfile = {
        firstName: firstname,
        lastName: '',
        email: email,
        mobile: mobile,
        accountType: "Savings",
        balance: 0,
        status: "pending",
        source: "firebase",
        imageUrl: image,
        createdAt: serverTimestamp(),
        transactions: [],
        loans: []
      };

      if (isLegacy) {
        const { normalizeLegacyUser } = await import("../utils/userUtils");
        const normalized = normalizeLegacyUser(legacyRows);
        userProfile = {
          ...userProfile,
          firstName: firstname || normalized.firstName,
          lastName: normalized.lastName,
          mobile: mobile || normalized.mobile,
          accountType: normalized.accountType,
          balance: normalized.balance,
          status: "approved", // Pre-approved for legacy
          source: "legacy",
          transactions: normalized.transactions,
          loans: normalized.loans,
          customerId: normalized.customerId
        };
      }

      await setDoc(doc(userDB, 'users', user.uid), userProfile);

      // 4. Notify Admin if NOT legacy (since legacy is pre-approved)
      if (!isLegacy) {
        await addDoc(collection(userDB, 'notifications'), {
          type: 'new_user',
          message: `New account request from: ${email}`,
          userId: user.uid,
          read: false,
          createdAt: serverTimestamp(),
          role: 'admin'
        });
        setError("Account request sent! Please wait for admin approval.");
        setMode("user");
      } else {
        // Auto-login for approved legacy folks
        await loginUser({ uid: user.uid, ...userProfile });
        navigate("/user/dashboard");
      }

    } catch (err) {
      console.error('Signup error:', err);
      setError(err.message.includes("email-already-in-use") ? "Email already exists. Try logging in." : "Signup failed.");
    } finally {
      setSubmitting(false);
    }
    return;
  };

  /* ================= FORGOT PASSWORD ================= */
  const handleForgotPassword = async () => {
    if (!email) {
      alert("Enter your email first");
      return;
    }

    try {
      await sendPasswordResetEmail(userAuth, email);
      alert("Password reset email sent");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card animate-container">
        <h2 className="typing-text">
          {typedText}
          <span className="cursor">.</span>
        </h2>

        <p className="subtitle">Sign in to access your dashboard</p>

        {error && <p style={{ color: "salmon" }}>{error}</p>}

        <form onSubmit={handleSubmit}>
          {/* ================= SIGNUP EXTRA ================= */}
          {mode === "signup" && (
            <>
              <div className="profile-upload">
                <label className="avatar-circle">
                  {image ? (
                    <img src={image} alt="Profile" className="avatar-preview" />
                  ) : (
                    <span style={{color:"white"}}>Upload</span>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleImageChange}
                  />
                </label>
              </div>

              <input
                type="text"
                placeholder="First Name"
                value={firstname}
                onChange={(e) => setFirstname(e.target.value)}
                required
              />

              <input
                type="tel"
                placeholder="Mobile Number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                required
              />
            </>
          )}

          {/* EMAIL */}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {/* PASSWORD */}
          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              placeholder={mode === "signup" ? "Create Password" : "Password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <span
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {mode === "user" && (
            <p className="forgot-link" onClick={handleForgotPassword}>
              Forgot password?
            </p>
          )}

          <button type="submit" className="login-btn" disabled={submitting}>
            {submitting
              ? "Please wait..."
              : mode === "signup"
                ? "Create login"
                : "Login"}
          </button>
        </form>

        <p className="signup-text">
          {mode === "user" ? (
            <>
              New user? <span onClick={() => setMode("signup")}>Sign up</span>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <span onClick={() => setMode("user")}>Login</span>
            </>
          )}
        </p>

        <p className="hint-a" onClick={() => navigate("/admin")}>
          Admin Login →
        </p>

      </div>
    </div>
  );
}
