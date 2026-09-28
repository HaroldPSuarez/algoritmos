import { useEffect, useState } from "react";
import api from "../api/axios";
import "./Sedes.css";

interface Sede {
  id: number;
  nombre: string;
  direccion: string;
  telefono?: string;
  estado: boolean;
}

export default function Sedes() {
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");
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

  const crearSede = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/crear_sedes", { nombre, direccion, telefono });

      setNombre("");
      setDireccion("");
      setTelefono("");

      cargarSedes();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Error al crear la sede");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sedes-page">

      <div className="sedes-header">
        <div>
          <span className="sedes-subtitle">GESTIÓN</span>
          <h2>Sedes</h2>
          <p>Administra las sedes registradas en el sistema.</p>
        </div>

        <div className="sedes-counter">
          <span>{sedes.length}</span>
          <small>Sedes registradas</small>
        </div>
      </div>

      <div className="sedes-content">

        {/* Tabla */}
        <section className="sedes-card">
          <div className="card-header">
            <div>
              <h3>Listado de sedes</h3>
              <p>Sedes disponibles actualmente</p>
            </div>
          </div>

          <div className="table-container">
            <table className="sedes-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Dirección</th>
                  <th>Teléfono</th>
                  <th>Estado</th>
                </tr>
              </thead>

              <tbody>
                {sedes.map((sede) => (
                  <tr key={sede.id}>
                    <td>
                      <span className="id-badge">
                        #{sede.id}
                      </span>
                    </td>

                    <td className="sede-name">
                      {sede.nombre}
                    </td>

                    <td className="sede-address">
                      {sede.direccion}
                    </td>

                    <td>
                      {sede.telefono || "-"}
                    </td>

                    <td>
                      <span
                        className={
                          sede.estado
                            ? "status active"
                            : "status inactive"
                        }
                      >
                        <span className="status-dot"></span>
                        {sede.estado ? "Activa" : "Inactiva"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Crear sede */}
        <section className="create-card">
          <div className="card-header">
            <div>
              <span className="form-icon">＋</span>
              <div>
                <h3>Nueva sede</h3>
                <p>Registra una nueva sede</p>
              </div>
            </div>
          </div>

          <form onSubmit={crearSede} className="sede-form">

            <div className="input-group">
              <label htmlFor="nombre">
                Nombre
              </label>

              <input
                id="nombre"
                type="text"
                placeholder="Ej. Sede Principal"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="direccion">
                Dirección
              </label>

              <input
                id="direccion"
                type="text"
                placeholder="Ej. Calle 123 #45-67"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="telefono">
                Teléfono
                <span>Opcional</span>
              </label>

              <input
                id="telefono"
                type="text"
                placeholder="Ej. 300 123 4567"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
              />
            </div>

            {error && (
              <div className="error-message">
                <span>!</span>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="create-button"
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Creando...
                </>
              ) : (
                <>
                  <span>＋</span>
                  Crear sede
                </>
              )}
            </button>

          </form>
        </section>

      </div>
    </div>
  );
}