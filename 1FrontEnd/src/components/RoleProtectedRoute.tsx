import { Navigate, Outlet } from "react-router-dom";
import { parseJwt } from "../utils/jwt";

interface RoleProtectedRouteProps {
  rolesPermitidos: number[];
}

export default function RoleProtectedRoute({ rolesPermitidos }: RoleProtectedRouteProps) {
  const token = localStorage.getItem("token");

  // Si no hay token, redirige al login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const payload = parseJwt(token);
  if (!payload) {
    return <Navigate to="/login" replace />;
  }

  const userRole = Number(payload.role);

  // Verificamos de forma segura que rolesPermitidos exista y sea un arreglo
  if (!rolesPermitidos || !Array.isArray(rolesPermitidos)) {
    return <Navigate to="/login" replace />;
  }

  // Si el rol del usuario no está autorizado, redirige al login
  if (!rolesPermitidos.includes(userRole)) {
    return <Navigate to="/login" replace />;
  }

  // Si todo es correcto, renderiza las rutas hijas dentro del Layout o Router
  return <Outlet />;
}