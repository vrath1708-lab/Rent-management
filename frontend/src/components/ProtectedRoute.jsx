import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>;

  // Not logged in at all → go to login
  if (!user) return <Navigate to="/login" />;

  // Role mismatch
  if (role && user.role !== role) {
    return <Navigate to="/login" />;
  }

  return children;
}
