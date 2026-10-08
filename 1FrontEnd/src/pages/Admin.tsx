import { useEffect } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { getRoleId } from "../utils/jwt";
import "./Admin.css";

type Seccion = {
  ruta: string;
  titulo: string;
  descripcion: string;
  icono: ReactNode;
};

type Grupo = {
  titulo: string;
  resumen: string;
  secciones: Seccion[];
};

// Íconos SVG simples (trazo), sin dependencias externas
const Icono = ({ children }: { children: ReactNode }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);

const GRUPOS: Grupo[] = [
  {
    titulo: "Operación diaria",
    resumen: "Lo que se usa en el servicio",
    secciones: [
      {
        ruta: "/admin/mesas",
        titulo: "Mesas",
        descripcion: "Crea, edita y elimina las mesas de cada sede.",
        icono: (
          <Icono>
            <path d="M3 9h18" />
            <path d="M5 9v10M19 9v10" />
            <path d="M7 5h10l2 4H5z" />
          </Icono>
        ),
      },
      {
        ruta: "/admin/productos",
        titulo: "Productos",
        descripcion: "Administra la carta, categorías y precios.",
        icono: (
          <Icono>
            <path d="M7 3h10l-1 7a4 4 0 0 1-8 0z" />
            <path d="M12 14v7M8 21h8" />
          </Icono>
        ),
      },
      {
        ruta: "/admin/inventario",
        titulo: "Inventario",
        descripcion: "Controla existencias y stock mínimo por sede.",
        icono: (
          <Icono>
            <path d="M21 8l-9-5-9 5 9 5z" />
            <path d="M3 8v8l9 5 9-5V8" />
            <path d="M12 13v8" />
          </Icono>
        ),
      },
    ],
  },
  {
    titulo: "Administración",
    resumen: "Quién accede y dónde",
    secciones: [
      {
        ruta: "/admin/sedes",
        titulo: "Sedes",
        descripcion: "Gestiona los locales del bar y su estado.",
        icono: (
          <Icono>
            <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z" />
            <circle cx="12" cy="10" r="2.5" />
          </Icono>
        ),
      },
      {
        ruta: "/admin/usuarios",
        titulo: "Usuarios",
        descripcion: "Crea cuentas, asigna roles y sedes, cambia claves.",
        icono: (
          <Icono>
            <circle cx="9" cy="8" r="3.5" />
            <path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" />
            <path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.4c2 .7 3.5 2.5 3.5 5.6" />
          </Icono>
        ),
      },
    ],
  },
  {
    titulo: "Seguimiento",
    resumen: "Qué ha pasado en el negocio",
    secciones: [
      {
        ruta: "/admin/reportes",
        titulo: "Reportes",
        descripcion: "Ventas por sede y estado del inventario.",
        icono: (
          <Icono>
            <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
          </Icono>
        ),
      },
      {
        ruta: "/admin/auditoria",
        titulo: "Auditoría",
        descripcion: "Historial de acciones de cada usuario.",
        icono: (
          <Icono>
            <path d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6z" />
            <path d="M9 12l2 2 4-4" />
          </Icono>
        ),
      },
    ],
  },
];

export default function Admin() {
  const navigate = useNavigate();

  useEffect(() => {
    const rol = getRoleId();
    if (rol !== 1) {
      // 1 es Administrador
      navigate("/");
    }
  }, [navigate]);

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="admin-page">
      <div className="admin-inner">
        {/* ENCABEZADO */}
        <header className="admin-hero">
          <div>
            <span className="admin-brand">Bar Pola y Punto</span>
            <h1>Panel de administración</h1>
            <p>
              Elige qué quieres gestionar. Los cambios se aplican a todas las
              sedes del bar.
            </p>
          </div>

          <button className="admin-logout" onClick={cerrarSesion}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <path d="M16 17l5-5-5-5M21 12H9" />
            </svg>
            Cerrar sesión
          </button>
        </header>

        {/* GRUPOS */}
        {GRUPOS.map((grupo) => (
          <section className="admin-group" key={grupo.titulo}>
            <div className="admin-group-head">
              <h2>{grupo.titulo}</h2>
              <span>{grupo.resumen}</span>
            </div>

            <div className="admin-grid">
              {grupo.secciones.map((s) => (
                <button
                  key={s.ruta}
                  className="admin-card"
                  onClick={() => navigate(s.ruta)}
                >
                  <span className="admin-card-icon">{s.icono}</span>

                  <span className="admin-card-text">
                    <strong>{s.titulo}</strong>
                    <small>{s.descripcion}</small>
                  </span>

                  <svg
                    className="admin-card-chevron"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M9 6l6 6-6 6" />
                  </svg>
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}