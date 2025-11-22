import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, token } = useAuth();

  // Still loading authentication state
  if (isAuthenticated === null) {
    return <div className="text-center p-5">Loading...</div>;
  }

  // If no token or not authenticated → redirect to login
  if (!isAuthenticated || !token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
