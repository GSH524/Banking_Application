import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { userAuth, userDB } from "../firebaseUser";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Immediate Sync Check: Admin & Legacy Users
    const savedAdmin = localStorage.getItem("adminUser");
    if (savedAdmin) {
      setAdmin(JSON.parse(savedAdmin));
    }

    const savedLegacy = localStorage.getItem("legacyUser");
    if (savedLegacy) {
      setUser(JSON.parse(savedLegacy));
      // We found a legacy session, so we can potentially stop loading here, 
      // but it's safer to wait for the Firebase check below to finish.
    }

    // 2. Firebase Auth Listener
    const unsubscribeUser = onAuthStateChanged(userAuth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const userDoc = await getDoc(doc(userDB, 'users', firebaseUser.uid));

          if (userDoc.exists()) {
            const userData = userDoc.data();
            
            const userProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              role: "user",
              source: "firebase",
              displayName: `${userData.firstName || ""} ${userData.lastName || ""}`.trim() || "User",
              balance: userData.balance || 0, 
              accountNumber: userData.accountNumber || "N/A",
              ...userData
            };

            setUser(userProfile);

            // Real-time listener for Balance Overrides
            onSnapshot(doc(userDB, 'overrides', firebaseUser.uid), (snapshot) => {
              if (snapshot.exists()) {
                setUser(prev => ({ ...prev, ...snapshot.data() }));
              }
            });
          }
        } else {
          // If no Firebase user, and no legacy user in storage, clear state
          if (!localStorage.getItem("legacyUser")) {
            setUser(null);
          }
        }
      } catch (e) {
        console.error("Auth Initialization Error:", e);
      } finally {
        // Stop loading regardless of whether user was found or error occurred
        setLoading(false);
      }
    });

    return () => unsubscribeUser();
  }, []);

  // --- ACTIONS ---

  const loginUser = (userData) => {
    setUser(userData);
  };

  const loginLegacyUser = (legacyData) => {
    const mappedUser = {
      uid: legacyData["Customer ID"],
      email: legacyData["Email"],
      displayName: `${legacyData["First Name"]} ${legacyData["Last Name"]}`,
      balance: legacyData["Account Balance"], 
      accountNumber: legacyData["Account_Number"],
      role: "user",
      source: "legacy",
      ...legacyData
    };
    setUser(mappedUser);
    localStorage.setItem("legacyUser", JSON.stringify(mappedUser));
  };

  const loginAdmin = (email, password) => {
    // Note: In production, validate this via a secure backend/Firebase
    if (email === "admin@vajra.com" && password === "Admin123") {
      const adminData = {
        id: 'admin_1',
        name: "SRK BANKING SERVICES",
        email,
        role: "admin",
        loginAt: new Date().toISOString(),
      };
      setAdmin(adminData);
      localStorage.setItem("adminUser", JSON.stringify(adminData));
      return true;
    }
    return false;
  };

  const logoutUser = async () => {
    try {
      await signOut(userAuth);
      setUser(null);
      localStorage.removeItem("legacyUser");
    } catch (error) {
      console.error("Logout Error:", error);
      setUser(null);
    }
  };

  const logoutAdmin = () => {
    setAdmin(null);
    localStorage.removeItem("adminUser");
    localStorage.removeItem("authToken");
  };

  // --- RENDER ---

  return (
    <AuthContext.Provider
      value={{
        admin,
        user,
        loading,
        loginUser,
        loginLegacyUser,
        logoutUser,
        loginAdmin,
        logoutAdmin,
        isAdminLoggedIn: Boolean(admin),
      }}
    >
      {/* Guard the app until the auth state is determined */}
      {!loading ? (
        children
      ) : (
        <div className="flex h-screen w-full items-center justify-center bg-[#020617]">
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Securing Session...</p>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};