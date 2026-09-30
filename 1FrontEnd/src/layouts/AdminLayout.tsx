// src/layouts/AdminLayout.tsx
import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import "./AdminLayout.css";

const links = [
  { to: "/admin/sedes", label: "Sedes" },
  { to: "/admin/usuarios", label: "Usuarios" },
  { to: "/admin/productos", label: "Productos" },
  { to: "/admin/mesas", label: "Mesas" },
  { to: "/admin/inventario", label: "Inventario" },
  { to: "/admin/reportes", label: "Reportes" },
  { to: "/admin/auditoria", label: "Auditoría" },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const [menuAbierto, setMenuAbierto] = useState(false);

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="admin-layout">
      <header className="admin-topbar">
        <span className="admin-topbar__brand">Bar Pola y Punto</span>
        <button
          className="admin-topbar__toggle"
          onClick={() => setMenuAbierto((v) => !v)}
          aria-label="Abrir menú"
        >
          ☰
        </button>
      </header>

      <aside className={`admin-sidebar ${menuAbierto ? "admin-sidebar--open" : ""}`}>
        <div className="admin-sidebar__brand">Bar Pola y Punto</div>

        <nav className="admin-nav">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `admin-nav__link ${isActive ? "admin-nav__link--active" : ""}`
              }
              onClick={() => setMenuAbierto(false)}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <button className="admin-sidebar__logout" onClick={cerrarSesion}>
          Cerrar sesión
        </button>
      </aside>

      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}