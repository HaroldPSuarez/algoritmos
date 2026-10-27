
import { useState } from "react";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import "./AdminLayout.css";

const links = [
  { to: "/admin/sedes", label: "Sedes", icon: "fa-solid fa-house" },
  { to: "/admin/usuarios", label: "Usuarios", icon: "fa-solid fa-user" },
  { to: "/admin/productos", label: "Productos", icon: "fa-solid fa-box" },
  { to: "/admin/mesas", label: "Mesas", icon: "fa-solid fa-table" },
  { to: "/admin/inventario", label: "Inventario", icon: "fa-solid fa-clipboard-list" },
  { to: "/admin/reportes", label: "Reportes", icon: "fa-solid fa-chart-column" },
  { to: "/admin/auditoria", label: "Auditoría", icon: "fa-solid fa-file-lines" },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const [menuAbierto, setMenuAbierto] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    navigate("/login");
  };

  const cerrarMenu = () => setMenuAbierto(false);

  return (
    <div className="admin-layout">
      <header className="top-navbar">
        <NavLink
          to="/admin"
          className="navbar-brand"
          onClick={cerrarMenu}
        >
          <span className="brand-icon">
            <img
              src="/logo-pola-y-punto.svg"
              alt="Bar Pola y Punto"
            />
          </span>

          <span className="navbar-brand-name">
            Bar Pola y Punto
          </span>
        </NavLink>

        <nav
          id="admin-navigation"
          className={`navbar-menu ${menuAbierto ? "navbar-menu--open" : ""}`}
        >
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={cerrarMenu}
              className={({ isActive }) =>
                isActive ? "navbar-link active" : "navbar-link"
              }
            >
              <i className={`${link.icon} navbar-link-icon`} aria-hidden="true" />
              <span className="navbar-link-label">{link.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="navbar-actions">
          <button
            type="button"
            className="logout-button"
            onClick={handleLogout}
          >
            <i className="fas fa-right-from-bracket" aria-hidden="true" />
            <span>Cerrar sesión</span>
          </button>

          <button
            type="button"
            className="navbar-toggle"
            onClick={() => setMenuAbierto((prev) => !prev)}
            aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menuAbierto}
            aria-controls="admin-navigation"
          >
            <i
              className={menuAbierto ? "fa-solid fa-xmark" : "fa-solid fa-bars"}
              aria-hidden="true"
            />
          </button>
        </div>
      </header>

      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}
