import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loader2 } from "lucide-react";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, token, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <Loader2 className="animate-spin text-red-600" size={48} />
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/role-selection" state={{ from: location }} replace />;
  }

  if (allowedRoles && (!user || !allowedRoles.includes(user.role?.toLowerCase()))) {
    // Redirect to their respective dashboard if they try to access a role-restricted route
    const role = user?.role?.toLowerCase() || "role-selection";
    return <Navigate to={`/${role}`} replace />;
  }

  return children;
};

export default ProtectedRoute;
