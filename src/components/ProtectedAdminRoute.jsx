import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedAdminRoute({ children }) {
  const { admin } = useAuth();

  if (!admin) {
    return <Navigate to="/admin" replace />;
  }

  return children;
}

