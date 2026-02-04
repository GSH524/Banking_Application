import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedPartnerRoute({ requirePayment = true }) {
    const { user, loading } = useAuth();

    if (loading) return <div className="p-5 text-white">Loading...</div>;

    if (!user || user.role !== "partner") {
        return <Navigate to="/partner/login" replace />;
    }

    // If payment is required but user is not active, go to payment
    if (requirePayment && !user.isActive) {
        return <Navigate to="/partner/payment" replace />;
    }

    return <Outlet />;
}
