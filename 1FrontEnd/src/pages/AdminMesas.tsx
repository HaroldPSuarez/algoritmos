// src/pages/AdminMesas.tsx
import { useEffect, useState } from "react";
import api from "../api/axios";
import "./Mesas.css";

interface Sede {
  id: number;
  nombre: string;
}

interface Mesa {
  id: number;
  numero: number;
  capacidad: number;
  estado: string;
  id_sede: number;
}

export default function AdminMesas() {
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [mesas, setMesas] = useState<Mesa[]>([]);
  
  // Filtros y estados del formulario
  const [filtroSede, setFiltroSede] = useState<number | "">("");
  const [idSedeCrear, setIdSedeCrear] = useState<number | "">("");
  const [numero, setNumero] = useState("");
  const [capacidad, setCapacidad] = useState("4");
  
  const [mesaEditando, setMesaEditando] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarSedes();
  }, []);

  // Cargar mesas cada vez que cambie el filtro de sede
  useEffect(() => {
    cargarMesas();
  }, [filtroSede]);

  const cargarSedes = async () => {
    try {
      const res = await api.get("/listar_sedes");
      setSedes(res.data);
    } catch (err) {
      console.error("Error al cargar sedes", err);
      setError("No se pudieron cargar las sedes.");
    }
  };

  const cargarMesas = async () => {
    try {
      setLoading(true);
      // Si hay un filtro de sede seleccionado, consultamos directo al backend por sede si lo soporta, o filtramos
      const url = filtroSede !== "" ? `/mesas?id_sede=${filtroSede}` : "/mesas";
      const res = await api.get(url);
      setMesas(res.data);
    } catch (err: any) {
      console.error("Error al cargar mesas", err);
      setError(err?.response?.data?.detail || "No se pudieron cargar las mesas.");
    } finally {
      setLoading(false);
    }
  };

  const limpiarFormulario = () => {
    setNumero("");
    setCapacidad("4");
    setIdSedeCrear("");
    setMesaEditando(null);
  };

  const guardarMesa = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setExito("");

    if (idSedeCrear === "") {
      setError("Por favor selecciona una sede.");
      return;
    }

    if (Number(numero) <= 0) {
      setError("El número de la mesa debe ser mayor a 0.");
      return;
    }

    setLoading(true);
    try {
      const datos = {
        numero: Number(numero),
        capacidad: Number(capacidad),
        id_sede: Number(idSedeCrear),
      };

      if (mesaEditando !== null) {
        await api.put(`/mesas/${mesaEditando}`, datos);
        setExito(`Mesa #${numero} actualizada correctamente.`);
      } else {
        await api.post("/mesas", datos);
        setExito(`Mesa #${numero} creada correctamente.`);
      }

      limpiarFormulario();
      cargarMesas();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Error al guardar la mesa");
    } finally {
      setLoading(false);
    }
  };

  const editarMesa = (m: Mesa) => {
    setError("");
    setExito("");
    setMesaEditando(m.id);
    setNumero(String(m.numero));
    setCapacidad(String(m.capacidad));
    setIdSedeCrear(m.id_sede);

    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth",
    });
  };

  const eliminarMesa = async (id: number, numMes: number) => {
    if (!window.confirm(`¿Estás seguro de eliminar la Mesa #${numMes}?`)) return;

    setError("");
    setExito("");
    try {
      setLoading(true);
      await api.delete(`/mesas/${id}`);
      setExito(`Mesa #${numMes} eliminada correctamente.`);
      cargarMesas();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "No se pudo eliminar la mesa.");
    } finally {
      setLoading(false);
    }
  };

  const nombreSede = (id: number) => sedes.find((s) => s.id === id)?.nombre || "Sede Principal";

  return (
    <div className="productos-page">
      {/* HEADER */}
      <div className="productos-header">
        <div>
          <span className="productos-eyebrow">ADMINISTRACIÓN</span>
          <h1>Gestión de Mesas</h1>
          <p>Administra, filtra y configura las mesas por cada sede del bar.</p>
        </div>

        <div className="productos-counter">
          <span>{mesas.length}</span>
          <small>Mesas en vista</small>
        </div>
      </div>

      {/* MENSAJES DE ERROR / ÉXITO */}
      {error && (
        <div className="producto-error form-full" style={{ marginBottom: "20px" }}>
          <span>⚠️</span>
          {error}
        </div>
      )}

      {exito && (
        <div
          style={{
            backgroundColor: "rgba(16, 185, 129, 0.15)",
            color: "#34d399",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            padding: "12px",
            borderRadius: "8px",
            marginBottom: "20px",
            fontSize: "13px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span>✅</span> {exito}
        </div>
      )}

      {/* FILTRO SUPERIOR POR SEDE */}
      <div
        style={{
          marginBottom: "25px",
          display: "flex",
          gap: "20px",
          alignItems: "center",
          background: "#19130f",
          padding: "18px 22px",
          borderRadius: "12px",
          border: "1px solid #30251e",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%" }}>
          <label style={{ color: "#bcae9e", fontSize: "12px", fontWeight: "600", whiteSpace: "nowrap" }}>
            Filtrar por Sede:
          </label>
          <select
            value={filtroSede}
            onChange={(e) => setFiltroSede(e.target.value === "" ? "" : Number(e.target.value))}
            style={{
              background: "#241b15",
              border: "1px solid #3b2d23",
              color: "#eee5da",
              padding: "8px 12px",
              borderRadius: "6px",
              outline: "none",
              fontSize: "13px",
              maxWidth: "300px",
              width: "100%",
            }}
          >
            <option value="">Todas las sedes</option>
            {sedes.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* TABLA DE MESAS */}
      <section className="productos-card">
        <div className="section-header">
          <div>
            <h2>Mesas registradas</h2>
            <p>Consulta y administra el estado de las mesas en tiempo real.</p>
          </div>
        </div>

        {mesas.length > 0 ? (
          <div className="productos-table-wrapper">
            <table className="productos-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Número de Mesa</th>
                  <th>Capacidad</th>
                  <th>Sede</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {mesas.map((m) => (
                  <tr key={m.id}>
                    <td className="producto-id">#{m.id}</td>
                    <td>
                      <div className="producto-info">
                        <div className="producto-icon">🪑</div>
                        <span>Mesa #{m.numero}</span>
                      </div>
                    </td>
                    <td>
                      <span className="categoria-badge">
                        👥 {m.capacidad} {m.capacidad === 1 ? "persona" : "personas"}
                      </span>
                    </td>
                    <td style={{ color: "#ded4c9", fontWeight: 500 }}>
                      {nombreSede(m.id_sede)}
                    </td>
                    <td>
                      <span
                        className={
                          m.estado === "disponible"
                            ? "estado-badge estado-activo"
                            : "estado-badge estado-inactivo"
                        }
                      >
                        <span className="estado-dot"></span>
                        {m.estado}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          type="button"
                          onClick={() => editarMesa(m)}
                          disabled={loading}
                          style={{
                            backgroundColor: "#2563eb",
                            color: "#fff",
                            border: "none",
                            padding: "6px 12px",
                            borderRadius: "4px",
                            cursor: loading ? "not-allowed" : "pointer",
                            fontWeight: "bold",
                            fontSize: "12px",
                          }}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => eliminarMesa(m.id, m.numero)}
                          disabled={loading}
                          style={{
                            backgroundColor: "#ef4444",
                            color: "#fff",
                            border: "none",
                            padding: "6px 12px",
                            borderRadius: "4px",
                            cursor: loading ? "not-allowed" : "pointer",
                            fontWeight: "bold",
                            fontSize: "12px",
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
          <div className="productos-empty">
            <div className="empty-icon">🪑</div>
            <h3>No hay mesas registradas con este filtro</h3>
            <p>Cambia de sede en el filtro superior o crea una nueva mesa abajo.</p>
          </div>
        )}
      </section>

      {/* FORMULARIO CREAR / EDITAR */}
      <section className="nuevo-producto-card">
        <div className="section-header">
          <div>
            <span className="section-label">
              {mesaEditando !== null ? "EDITAR REGISTRO" : "NUEVO REGISTRO"}
            </span>
            <h2>{mesaEditando !== null ? "Editar mesa" : "Crear mesa"}</h2>
            <p>
              {mesaEditando !== null
                ? "Modifica los datos de la mesa seleccionada."
                : "Añade una nueva mesa indicando su sede, número y capacidad."}
            </p>
          </div>
        </div>

        <form onSubmit={guardarMesa} className="producto-form">
          <div className="form-group">
            <label htmlFor="sede">Sede</label>
            <select
              id="sede"
              value={idSedeCrear}
              onChange={(e) => setIdSedeCrear(e.target.value === "" ? "" : Number(e.target.value))}
              required
            >
              <option value="">Selecciona una sede</option>
              {sedes.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="numero">Número de Mesa</label>
            <input
              id="numero"
              type="number"
              min="1"
              placeholder="Ej. 1, 2, 5..."
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="capacidad">Capacidad (Personas)</label>
            <input
              id="capacidad"
              type="number"
              min="1"
              max="20"
              placeholder="Ej. 4"
              value={capacidad}
              onChange={(e) => setCapacidad(e.target.value)}
              required
            />
          </div>

          <div className="form-actions form-full">
            <button type="submit" disabled={loading} className="crear-producto-btn">
              {loading ? (
                <>
                  <span className="button-spinner"></span>
                  Procesando...
                </>
              ) : (
                <>
                  <span>{mesaEditando !== null ? "✓" : "+"}</span>
                  {mesaEditando !== null ? "Guardar cambios" : "Crear mesa"}
                </>
              )}
            </button>

            {mesaEditando !== null && (
              <button
                type="button"
                onClick={limpiarFormulario}
                disabled={loading}
                style={{
                  marginLeft: "10px",
                  background: "#374151",
                  color: "#fff",
                  border: "none",
                  padding: "10px 18px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "13px",
                }}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </section>
    </div>
  );
}