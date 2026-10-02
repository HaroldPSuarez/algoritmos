import { useEffect, useState } from "react";
import api from "../api/axios";
import "./Usuarios.css";

interface Sede {
  id: number;
  nombre: string;
}

interface Usuario {
  id: number;
  nombre_completo: string;
  email: string;
  estado: boolean;
  id_rol: number;
  id_sede?: number;
}

const ROLES = [
  { id: 1, nombre: "Administrador" },
  { id: 2, nombre: "Mesero" },
  { id: 3, nombre: "Cajero" },
];

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [sedes, setSedes] = useState<Sede[]>([]);

  const [nombreCompleto, setNombreCompleto] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [idRol, setIdRol] = useState<number>(2);
  const [idSede, setIdSede] = useState<number | "">("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarSedes();
    cargarUsuarios();
  }, []);

  const cargarSedes = async () => {
    try {
      const res = await api.get("/listar_sedes");
      setSedes(res.data);
    } catch (err) {
      setError("No se pudieron cargar las sedes");
    }
  };

  const cargarUsuarios = async () => {
    try {
      const res = await api.get("/usuarios");
      setUsuarios(res.data);
    } catch (err) {
      console.error("No se pudieron cargar los usuarios", err);
    }
  };

  // Autogenerar correo basado en el nombre completo
  const handleNombreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setNombreCompleto(val);

    const formatoCorreo = val
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remueve tildes
      .replace(/\s+/g, "."); // Cambia espacios por puntos

    if (formatoCorreo) {
      setEmail(`${formatoCorreo}@barpolaypunto.com`);
    } else {
      setEmail("");
    }
  };

  const crearUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/registrar_usuarios", {
        nombre_completo: nombreCompleto,
        email,
        password,
        id_rol: idRol,
        id_sede: idSede === "" ? null : idSede,
      });

      cargarUsuarios();
      setNombreCompleto("");
      setEmail("");
      setPassword("");
      setIdRol(2);
      setIdSede("");
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Error al crear el usuario");
    } finally {
      setLoading(false);
    }
  };

  const eliminarUsuario = async (id: number) => {
    if (!window.confirm("¿Estás seguro de eliminar este usuario?")) return;

    try {
      await api.delete(`/usuarios/${id}`);
      setUsuarios(usuarios.filter((u) => u.id !== id));
    } catch (err: any) {
      alert(err?.response?.data?.detail || "Error al eliminar el usuario");
    }
  };

  const cambiarPassword = async (id: number, nombre: string) => {
    const nuevaClave = prompt(`Ingresa la nueva contraseña para ${nombre}:`);
    if (!nuevaClave) return;

    try {
      await api.put(`/usuarios/${id}/password`, { password: nuevaClave });
      alert("¡Contraseña actualizada exitosamente!");
    } catch (err: any) {
      alert(err?.response?.data?.detail || "Error al actualizar la contraseña");
    }
  };

  const nombreRol = (id: number) =>
    ROLES.find((r) => r.id === id)?.nombre || "Sin rol";

  const nombreSede = (id?: number) =>
    sedes.find((s) => s.id === id)?.nombre || "Sin asignar";

  return (
    <div className="usuarios-page">
      {/* ENCABEZADO */}
      <div className="usuarios-header">
        <div>
          <span className="usuarios-eyebrow">ADMINISTRACIÓN</span>
          <h1>Usuarios</h1>
          <p>Gestiona los usuarios, roles y sedes del sistema.</p>
        </div>

        <div className="usuarios-counter">
          <span>{usuarios.length}</span>
          <small>Usuarios registrados</small>
        </div>
      </div>

      {/* TABLA */}
      <section className="usuarios-card">
        <div className="section-header">
          <div>
            <h2>Usuarios registrados</h2>
            <p>Personas con acceso al sistema</p>
          </div>
        </div>

        {usuarios.length > 0 ? (
          <div className="usuarios-table-wrapper">
            <table className="usuarios-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Usuario</th>
                  <th>Correo</th>
                  <th>Rol</th>
                  <th>Sede</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {usuarios.map((u) => (
                  <tr key={u.id}>
                    <td className="usuario-id">#{u.id}</td>

                    <td>
                      <div className="usuario-info">
                        <div className="usuario-avatar">
                          {u.nombre_completo.charAt(0).toUpperCase()}
                        </div>
                        <span>{u.nombre_completo}</span>
                      </div>
                    </td>

                    <td className="usuario-email">{u.email}</td>

                    <td>
                      <span className={`rol-badge rol-${u.id_rol}`}>
                        {nombreRol(u.id_rol)}
                      </span>
                    </td>

                    <td>{nombreSede(u.id_sede)}</td>

                    <td>
                      <span
                        className={
                          u.estado
                            ? "estado-badge estado-activo"
                            : "estado-badge estado-inactivo"
                        }
                      >
                        <span className="estado-dot"></span>
                        {u.estado ? "Activo" : "Inactivo"}
                      </span>
                    </td>

                    <td>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button
                          onClick={() => cambiarPassword(u.id, u.nombre_completo)}
                          style={{
                            backgroundColor: "#d97706",
                            color: "#fff",
                            border: "none",
                            padding: "6px 10px",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontWeight: "bold",
                            fontSize: "12px"
                          }}
                        >
                          Clave
                        </button>
                        <button
                          onClick={() => eliminarUsuario(u.id)}
                          style={{
                            backgroundColor: "#ef4444",
                            color: "#fff",
                            border: "none",
                            padding: "6px 10px",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontWeight: "bold",
                            fontSize: "12px"
                          }}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="usuarios-empty">
            <div className="empty-icon">♙</div>
            <h3>No hay usuarios registrados</h3>
            <p>Crea el primer usuario utilizando el formulario de abajo.</p>
          </div>
        )}
      </section>

      {/* FORMULARIO */}
      <section className="nuevo-usuario-card">
        <div className="section-header">
          <div>
            <span className="section-label">NUEVO REGISTRO</span>
            <h2>Crear usuario</h2>
            <p>Añade una persona y asigna sus permisos de acceso.</p>
          </div>
        </div>

        <form onSubmit={crearUsuario} className="usuario-form">
          {/* NOMBRE */}
          <div className="form-group form-full">
            <label htmlFor="nombre">Nombre completo</label>
            <input
              id="nombre"
              type="text"
              placeholder="Ej. Juan Pérez"
              value={nombreCompleto}
              onChange={handleNombreChange}
              required
            />
          </div>

          {/* CORREO (AUTOCOMPLETADO Y DE SÓLO LECTURA) */}
          <div className="form-group">
            <label htmlFor="email">Correo electrónico (Autogenerado)</label>
            <input
              id="email"
              type="email"
              value={email}
              readOnly
              placeholder="Se autocompleta con el nombre"
              style={{ backgroundColor: "#111827", cursor: "not-allowed", color: "#9ca3af" }}
              required
            />
          </div>

          {/* CONTRASEÑA */}
          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              placeholder="Contraseña segura"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* ROL */}
          <div className="form-group">
            <label htmlFor="rol">Rol</label>
            <select
              id="rol"
              value={idRol}
              onChange={(e) => setIdRol(Number(e.target.value))}
            >
              {ROLES.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* SEDE */}
          <div className="form-group">
            <label htmlFor="sede">Sede</label>
            <select
              id="sede"
              value={idSede}
              onChange={(e) =>
                setIdSede(e.target.value === "" ? "" : Number(e.target.value))
              }
            >
              <option value="">Sin asignar</option>
              {sedes.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* ERROR */}
          {error && (
            <div className="usuario-error form-full">
              <span>!</span>
              {error}
            </div>
          )}

          {/* BOTÓN */}
          <div className="form-actions form-full">
            <button
              type="submit"
              disabled={loading}
              className="crear-usuario-btn"
            >
              {loading ? (
                <>
                  <span className="button-spinner"></span>
                  Creando...
                </>
              ) : (
                <>
                  <span>+</span>
                  Crear usuario
                </>
              )}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}