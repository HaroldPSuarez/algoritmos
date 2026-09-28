import { useEffect, useState } from "react";
import api from "../api/axios";

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
  }, []);

  const cargarSedes = async () => {
    try {
      const res = await api.get("/listar_sedes");
      setSedes(res.data);
    } catch (err) {
      setError("No se pudieron cargar las sedes");
    }
  };

  const crearUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/registrar_usuarios", {
        nombre_completo: nombreCompleto,
        email,
        password,
        id_rol: idRol,
        id_sede: idSede === "" ? null : idSede,
      });
      setUsuarios((prev) => [...prev, res.data]);
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

  const nombreRol = (id: number) => ROLES.find((r) => r.id === id)?.nombre || id;
  const nombreSede = (id?: number) => sedes.find((s) => s.id === id)?.nombre || "Sin asignar";

  return (
    <div style={{ padding: "20px" }}>
      <h2>Usuarios</h2>

      {usuarios.length > 0 && (
        <table border={1} cellPadding={8} style={{ borderCollapse: "collapse", width: "100%", marginBottom: "20px" }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Sede</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.nombre_completo}</td>
                <td>{u.email}</td>
                <td>{nombreRol(u.id_rol)}</td>
                <td>{nombreSede(u.id_sede)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h3>Nuevo usuario</h3>
      <form onSubmit={crearUsuario} style={{ display: "flex", flexDirection: "column", gap: "8px", maxWidth: "300px" }}>
        <input
          placeholder="Nombre completo"
          value={nombreCompleto}
          onChange={(e) => setNombreCompleto(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <label>Rol</label>
        <select value={idRol} onChange={(e) => setIdRol(Number(e.target.value))}>
          {ROLES.map((r) => (
            <option key={r.id} value={r.id}>
              {r.nombre}
            </option>
          ))}
        </select>

        <label>Sede</label>
        <select value={idSede} onChange={(e) => setIdSede(e.target.value === "" ? "" : Number(e.target.value))}>
          <option value="">Sin asignar</option>
          {sedes.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nombre}
            </option>
          ))}
        </select>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Creando..." : "Crear usuario"}
        </button>
      </form>
    </div>
  );
}