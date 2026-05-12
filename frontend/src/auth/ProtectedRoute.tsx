import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Role } from "../api/types";
import { useAuth } from "./AuthContext";
import { Loading } from "../components/Loading";
import AccessDenied from "../pages/AccessDenied";

export function ProtectedRoute({ allowedRoles }: { allowedRoles?: Role[] }) {
  const { isLoading, isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (isLoading) return <Loading />;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const ok = user && allowedRoles.includes(user.role);
    if (!ok) return <AccessDenied />;
  }

  return <Outlet />;
}
