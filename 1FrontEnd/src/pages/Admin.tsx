import { useNavigate } from "react-router-dom";
import { getRoleId } from "../utils/jwt";
import { useEffect } from "react";

export default function Admin() {
  const navigate = useNavigate();

  useEffect(() => {
    const rol = getRoleId();
    if (rol !== 1) { // 1 es Administrador
      navigate("/");
    }
  }, [navigate]);

  return (
    <div style={{ padding: "30px", fontFamily: "sans-serif" }}>
      <h1>Panel de Administración - Bar Pola y Punto</h1>
      <p>Selecciona la sección que deseas gestionar:</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px", marginTop: "20px" }}>
        <button onClick={() => navigate("/admin/mesas")} style={btnStyle}>Gestionar Mesas</button>
        <button onClick={() => navigate("/admin/sedes")} style={btnStyle}>Gestionar Sedes</button>
        <button onClick={() => navigate("/admin/usuarios")} style={btnStyle}>Gestionar Usuarios</button>
        <button onClick={() => navigate("/admin/productos")} style={btnStyle}>Gestionar Productos</button>
        <button onClick={() => navigate("/admin/inventario")} style={btnStyle}>Inventario</button>
        <button onClick={() => navigate("/admin/auditoria")} style={btnStyle}>Auditoría</button>
        <button onClick={() => navigate("/admin/reportes")} style={btnStyle}>Reportes</button>
      </div>

      <button 
        onClick={() => { localStorage.removeItem("token"); navigate("/"); }} 
        style={{ marginTop: "30px", background: "#ff4d4d", color: "white", padding: "10px 20px", border: "none", cursor: "pointer" }}
      >
        Cerrar Sesión
      </button>
    </div>
  );
}

const btnStyle = {
  padding: "15px",
  fontSize: "16px",
  cursor: "pointer",
  backgroundColor: "#d4af37",
  border: "none",
  borderRadius: "8px",
  fontWeight: "bold",
  color: "#fff"
};