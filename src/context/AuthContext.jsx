import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
// User Domain
import { userAuth, userDB } from "../firebaseUser";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Static Checks first
    const savedLegacy = localStorage.getItem("legacyUser");
    if (savedLegacy) {
      setUser(JSON.parse(savedLegacy));
      setLoading(false);
      return;
    }

    const savedAdmin = localStorage.getItem("adminUser");
    if (savedAdmin) {
      setAdmin(JSON.parse(savedAdmin));
    }

    // --- LISTENER A: User Domain (vajra-bank) ---
    const unsubscribeUser = onAuthStateChanged(userAuth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const userDoc = await getDoc(doc(userDB, 'users', firebaseUser.uid));

          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              role: "user",
              source: "firebase",
              displayName: `${userData.firstName} ${userData.lastName}`,
              ...userData
            });
            // Overrides listener for User
            onSnapshot(doc(userDB, 'overrides', firebaseUser.uid), (snapshot) => {
              if (snapshot.exists()) setUser(prev => ({ ...prev, ...snapshot.data() }));
            });
            return;
          }

          // Check Partners Collection
          const partnerDoc = await getDoc(doc(userDB, 'partners', firebaseUser.uid));
          if (partnerDoc.exists()) {
            const partnerData = partnerDoc.data();
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              role: "partner",
              source: "firebase",
              displayName: partnerData.companyName || partnerData.fullName,
              ...partnerData
            });
            // Real-time listener for Partner status changes (e.g. payment)
            onSnapshot(doc(userDB, 'partners', firebaseUser.uid), (snapshot) => {
              if (snapshot.exists()) {
                const freshData = snapshot.data();
                setUser(prev => ({ ...prev, ...freshData }));
              }
            });
          } else {
            // If document missing in both, strictly sign out
            await signOut(userAuth);
          }
        } else {
          // User logged out
          if (!savedLegacy) {
            setUser(null);
          }
        }
      } catch (e) {
        console.error("User Auth Error", e);
      } finally {
        setLoading(false);
      }
    });

    return () => {
      unsubscribeUser();
    };
  }, []);

  const loginAdmin = (email, password) => {
    if (email === "admin@vajra.com" && password === "Admin123") {
      const adminData = {
        id: 'admin_1', // Match the seeded admin ID
        name: "SRK BANKING SERVICES",
        email,
        role: "admin",
        loginAt: new Date().toISOString(),
      };
      setAdmin(adminData);
      localStorage.setItem("adminUser", JSON.stringify(adminData));
      // Set a dummy but valid token for test mode
      localStorage.setItem("authToken", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluXzEiLCJyb2xlIjoiYWRtaW4iLCJlbWFpbCI6ImFkbWluQHZhanJhLmNvbSJ9.dummy_signature");
      return true;
    }
    return false;
  };

  const loginUser = (userData) => {
    setUser(userData);
  };

  const loginLegacyUser = (userData) => {
    setUser(userData);
    localStorage.setItem("legacyUser", JSON.stringify(userData));
  };

  const logoutAdmin = () => {
    setAdmin(null);
    localStorage.removeItem("adminUser");
  };

  const logoutUser = async () => {
    try {
      // Try signing out both just in case
      await signOut(userAuth).catch(() => { });

      setUser(null);
      localStorage.removeItem("legacyUser");
    } catch (error) {
      console.error("Logout error:", error);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        admin,
        user,
        loginUser,
        loginLegacyUser,
        logoutUser,
        loginAdmin,
        logoutAdmin,
        isAdminLoggedIn: Boolean(admin),
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
