// src/components/RoleProtectedRoute.tsx
import { Navigate, Outlet } from "react-router-dom";
import { getRoleId } from "../utils/jwt";

interface Props {
  rolesPermitidos: number[];
}

export default function RoleProtectedRoute({ rolesPermitidos }: Props) {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;

  const rol = getRoleId();
  if (rol === null || !rolesPermitidos.includes(rol)) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}