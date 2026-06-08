import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSession } from "../../context/SessionContext";

type AllowedRole = "organization" | "corporation";

export const ProtectedRoute = ({ roles }: { roles: AllowedRole[] }) => {
  const { user, loading } = useSession();
  const location = useLocation();

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-gray-500">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!roles.includes(user.role)) {
    return <Navigate to={user.role === "corporation" ? "/corp/dashboard" : "/org/dashboard"} replace />;
  }

  return <Outlet />;
};
