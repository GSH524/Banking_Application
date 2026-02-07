import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { AdProvider } from "./context/AdContext";


/* COMMON */
import PublicLayout from "./layouts/PublicLayout";

/* PUBLIC PAGES */
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import PartnerPlans from "./pages/PartnerPlans";
import PublicCards from "./components/Cards";
import Investments from "./components/Investments";
import PublicLoans from "./components/LoanRules";
import Savings from "./components/Savings";

/* ADMIN */
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import AdminLayout from "./layouts/AdminLayout";

/* ADMIN PAGES */
import AdminProfile from "./pages/admin/Profile";
import Customers from "./pages/admin/Customers";
import Accounts from "./pages/admin/Accounts";
import AdminCards from "./pages/admin/Cards";
import AdminLoans from "./pages/admin/Loans";
import KYC from "./pages/admin/KYC";
import Reports from "./pages/admin/Reports";
import AdminAds from "./pages/admin/AdminAds";

/* PARTNER */
import PartnerLogin from "./pages/partner/PartnerLogin";
import PartnerRegister from "./pages/partner/PartnerRegister";
import PartnerPayment from "./pages/partner/PartnerPayment";
import PartnerDashboard from "./pages/partner/PartnerDashboard";
import CreateAd from "./pages/partner/CreateAd";
import PartnerLayout from "./layouts/PartnerLayout";
import ProtectedPartnerRoute from "./components/ProtectedPartnerRoute";

/* USER */
import UserLayout from "./layouts/UserLayout";
import UserDashboard from "./pages/user/UserDashboard";
import Profile from "./pages/user/Profile";
import Transactions from "./pages/user/Transactions";
import Loans from "./pages/user/Loans";
import Cards from "./pages/user/Cards";
import Feedback from "./pages/user/Feedback";
import Payments from "./pages/user/Payments";
import Rewards from "./pages/user/Rewards";
import InternationalTransfer from "./pages/user/InternationalTransfer";
import Notifications from "./pages/user/Notifications";

/* TOOLS */
import LoanCalculatorPage from "./pages/LoanCalculatorPage";
import ROI from "./pages/tools/ROI";
import CardsTool from "./pages/tools/CardsTool";
import Transfers from "./pages/tools/Transfers";
import Business from "./pages/tools/Business";
import Global from "./pages/tools/Global";



export default function App() {
  return (
    <AuthProvider>
      <AdProvider>
        <BrowserRouter>
          <Routes>
            {/* 🌍 PUBLIC ROUTES */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/partner-plans" element={<PartnerPlans />} />
              <Route path="/invest" element={<Investments />} />
              <Route path="/savings" element={<Savings />} />
              <Route path="/loans" element={<PublicLoans />} />
              <Route path="/cards" element={<PublicCards />} />


              {/* 🛠️ TOOLS & CALCULATORS */}
              <Route path="/tools">
                <Route path="loan-calculator" element={<LoanCalculatorPage />} />
                <Route path="roi" element={<ROI />} />
                <Route path="cards" element={<CardsTool />} />
                <Route path="transfers" element={<Transfers />} />
                <Route path="business" element={<Business />} />
                <Route path="global" element={<Global />} />
              </Route>
            </Route>

            {/* 🔐 ADMIN LOGIN (No Layout) */}
            <Route path="/admin" element={<AdminLogin />} />

            {/* 🔐 ADMIN ROUTES (PROTECTED) */}
            <Route
              path="/admin"
              element={
                <ProtectedAdminRoute>
                  <AdminLayout />
                </ProtectedAdminRoute>
              }
            >
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="profile" element={<AdminProfile />} />
              <Route path="customers" element={<Customers />} />
              <Route path="accounts" element={<Accounts />} />
              <Route path="cards" element={<AdminCards />} />
              <Route path="loans" element={<AdminLoans />} />
              <Route path="kyc" element={<KYC />} />
              <Route path="reports" element={<Reports />} />
              <Route path="ads" element={<AdminAds />} />
            </Route>

            {/* 🤝 PARTNER ROUTES */}
            {/* Partner Login (Public - No Layout) */}
            <Route path="/partner/login" element={<PartnerLogin />} />

            {/* Partner Protected Routes */}
            <Route path="/partner" element={<PartnerLayout />}>
              <Route path="register" element={<PartnerRegister />} />
              <Route element={<ProtectedPartnerRoute requirePayment={false} />}>
                <Route path="payment" element={<PartnerPayment />} />
              </Route>
              <Route element={<ProtectedPartnerRoute requirePayment={true} />}>
                <Route path="dashboard" element={<PartnerDashboard />} />
                <Route path="create-ad" element={<CreateAd />} />
              </Route>
            </Route>

            {/* 👤 USER ROUTES */}
            <Route path="/user" element={<UserLayout />}>
              <Route index element={<UserDashboard />} />
              <Route path="dashboard" element={<UserDashboard />} />
              <Route path="profile" element={<Profile />} />
              <Route path="transactions" element={<Transactions />} />
              <Route path="loans" element={<Loans />} />
              <Route path="cards" element={<Cards />} />
              <Route path="feedback" element={<Feedback />} />
              <Route path="payments" element={<Payments />} />
              <Route path="rewards" element={<Rewards />} />
              <Route path="international" element={<InternationalTransfer />} />
              <Route path="notifications" element={<Notifications />} />
            </Route>

            {/* ❌ FALLBACK */}
            <Route
              path="*"
              element={<h2 style={{ padding: 40 }}>Page Not Found</h2>}
            />
          </Routes>
        </BrowserRouter>
      </AdProvider>
    </AuthProvider>
  );
}