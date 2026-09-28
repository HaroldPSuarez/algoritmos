// src/hooks/useInactivityLogout.ts
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const TIEMPO_INACTIVIDAD_MS = 3 * 60 * 1000; // 3 minutos

export function useInactivityLogout(logout: () => void) {
  const navigate = useNavigate();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const cerrarSesionPorInactividad = () => {
      logout();
      navigate("/login");
    };

    const reiniciarTemporizador = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(cerrarSesionPorInactividad, TIEMPO_INACTIVIDAD_MS);
    };

    const eventos = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    eventos.forEach((evento) => window.addEventListener(evento, reiniciarTemporizador));

    reiniciarTemporizador(); // arranca el conteo al montar

    return () => {
      eventos.forEach((evento) => window.removeEventListener(evento, reiniciarTemporizador));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [logout, navigate]);
}