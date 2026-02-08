import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { Spin } from "antd";
import { useCurrentUser } from "../hooks/useAuth";

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { data, isLoading } = useCurrentUser();
  const token = localStorage.getItem("auth_token");

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!data) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
