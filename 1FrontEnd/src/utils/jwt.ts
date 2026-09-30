// src/utils/jwt.ts

interface JwtPayload {
  sub: string;   // email
  role: number;  // id_rol
  exp: number;
}

export function parseJwt(token: string): JwtPayload | null {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function getRoleId(): number | null {
  const token = localStorage.getItem("token");
  if (!token) return null;
  const payload = parseJwt(token);
  return payload?.role ?? null;
}

// Debe coincidir con el orden en que se insertan en la tabla roles
export const ROL_ADMINISTRADOR = 1;
export const ROL_MESERO = 2;
export const ROL_CAJERO = 3;