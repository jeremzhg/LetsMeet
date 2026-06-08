import { Navigate } from "react-router-dom";
import { useSession } from "../../context/SessionContext";

export const HomeRedirect = () => {
  const { user, loading } = useSession();

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-gray-500">Loading...</div>;
  }

  if (!user) return <Navigate to="/login" replace />;

  return <Navigate to={user.role === "corporation" ? "/corp/dashboard" : "/org/dashboard"} replace />;
};
