import { useEffect, useState } from "react";
import api from "../api/axios";
import "./Usuarios.css"; // Reutilizamos los estilos unificados de administración

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

export default function GestionMesas() {
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [sedes, setSedes] = useState<Sede[]>([]);

  // Filtro de sede para la tabla superior
  const [filtroSede, setFiltroSede] = useState<number | "">("");

  // Formulario de creación
  const [idSedeCrear, setIdSedeCrear] = useState<number | "">("");
  const [numeroMesa, setNumeroMesa] = useState<number | "">("");
  const [capacidad, setCapacidad] = useState<number>(4);

  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, [filtroSede]);

  const cargarDatos = async () => {
    try {
      const resSedes = await api.get("/listar_sedes");
      setSedes(resSedes.data);

      // Si hay filtro de sede, consultamos filtrado; si no, todas
      const urlMesas = filtroSede !== "" ? `/mesas?id_sede=${filtroSede}` : "/mesas";
      const resMesas = await api.get(urlMesas);
      setMesas(resMesas.data);
    } catch (err) {
      console.error("Error al cargar mesas y sedes", err);
    }
  };

  const crearMesa = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setExito("");

    if (idSedeCrear === "") {
      setError("Por favor selecciona una sede para la nueva mesa.");
      return;
    }

    if (typeof numeroMesa !== "number" || numeroMesa <= 0) {
      setError("El número de la mesa debe ser un valor positivo mayor a 0.");
      return;
    }

    if (capacidad <= 0) {
      setError("La capacidad de la mesa debe ser mayor a 0.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/mesas", {
        numero: Number(numeroMesa),
        capacidad: Number(capacidad),
        id_sede: Number(idSedeCrear),
        estado: "disponible"
      });

      setExito(`¡Mesa #${numeroMesa} creada exitosamente!`);
      setNumeroMesa("");
      setCapacidad(4);
      cargarDatos();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Error al crear la mesa");
    } finally {
      setLoading(false);
    }
  };

  const eliminarMesa = async (id: number, numero: number) => {
    if (!window.confirm(`¿Estás seguro de eliminar la Mesa #${numero}?`)) return;

    try {
      await api.delete(`/mesas/${id}`);
      setMesas(mesas.filter((m) => m.id !== id));
      setExito(`Mesa #${numero} eliminada correctamente.`);
    } catch (err: any) {
      alert(err?.response?.data?.detail || "No se puede eliminar la mesa porque tiene pedidos asociados.");
    }
  };

  const nombreSede = (idSedeVal: number) => {
    return sedes.find((s) => s.id === idSedeVal)?.nombre || "Sede Principal";
  };

  return (
    <div className="usuarios-page">
      {/* ENCABEZADO */}
      <div className="usuarios-header">
        <div>
          <span className="usuarios-eyebrow">ADMINISTRACIÓN</span>
          <h1>Gestión de Mesas</h1>
          <p>Configura las mesas, capacidad y su disponibilidad por sede.</p>
        </div>

        <div className="usuarios-counter">
          <span>{mesas.length}</span>
          <small>Mesas en vista</small>
        </div>
      </div>

      {error && (
        <div className="usuario-error form-full" style={{ marginBottom: "20px" }}>
          <span>⚠️</span> {error}
        </div>
      )}
      {exito && (
        <div style={{ backgroundColor: "rgba(16, 185, 129, 0.15)", color: "#34d399", border: "1px solid rgba(16, 185, 129, 0.3)", padding: "12px", borderRadius: "8px", marginBottom: "20px" }}>
          ✅ {exito}
        </div>
      )}

      {/* FILTRAR POR SEDE */}
      <div style={{ marginBottom: "20px", display: "flex", gap: "10px", alignItems: "center", background: "#1f2937", padding: "15px", borderRadius: "8px", border: "1px solid #374151" }}>
        <label style={{ color: "#9ca3af", fontSize: "14px", fontWeight: "500" }}>Filtrar listado por Sede:</label>
        <select
          value={filtroSede}
          onChange={(e) => setFiltroSede(e.target.value === "" ? "" : Number(e.target.value))}
          style={{ background: "#111827", border: "1px solid #374151", color: "#fff", padding: "8px 12px", borderRadius: "6px", outline: "none" }}
        >
          <option value="">Todas las sedes</option>
          {sedes.map((s) => (
            <option key={s.id} value={s.id}>{s.nombre}</option>
          ))}
        </select>
      </div>

      {/* TABLA DE MESAS */}
      <section className="usuarios-card">
        <div className="section-header">
          <div>
            <h2>Mesas registradas</h2>
            <p>Distribución de mesas por sucursal</p>
          </div>
        </div>

        {mesas.length > 0 ? (
          <div className="usuarios-table-wrapper">
            <table className="usuarios-table">
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
                    <td className="usuario-id">#{m.id}</td>
                    <td>
                      <div className="usuario-info">
                        <div className="usuario-avatar" style={{ background: "#d97706", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          🪑
                        </div>
                        <span>Mesa #{m.numero}</span>
                      </div>
                    </td>
                    <td>👥 {m.capacidad} personas</td>
                    <td>{nombreSede(m.id_sede)}</td>
                    <td>
                      <span className={m.estado === "disponible" ? "estado-badge estado-activo" : "estado-badge estado-inactivo"}>
                        <span className="estado-dot"></span>
                        {m.estado}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => eliminarMesa(m.id, m.numero)}
                        style={{
                          backgroundColor: "#ef4444",
                          color: "#fff",
                          border: "none",
                          padding: "6px 12px",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontWeight: "bold",
                          fontSize: "12px"
                        }}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="usuarios-empty">
            <div className="empty-icon">🪑</div>
            <h3>No hay mesas registradas</h3>
            <p>Crea la primera mesa utilizando el formulario de abajo.</p>
          </div>
        )}
      </section>

      {/* FORMULARIO DE NUEVA MESA */}
      <section className="nuevo-usuario-card">
        <div className="section-header">
          <div>
            <span className="section-label">NUEVO REGISTRO</span>
            <h2>Crear mesa</h2>
            <p>Añade una nueva mesa indicando su sede, número y capacidad.</p>
          </div>
        </div>

        <form onSubmit={crearMesa} className="usuario-form">
          {/* SEDE */}
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

          {/* NÚMERO DE MESA */}
          <div className="form-group">
            <label htmlFor="numero">Número de Mesa</label>
            <input
              id="numero"
              type="number"
              min="1"
              placeholder="Ej. 1, 2, 5..."
              value={numeroMesa}
              onChange={(e) => setNumeroMesa(e.target.value === "" ? "" : Number(e.target.value))}
              required
            />
          </div>

          {/* CAPACIDAD */}
          <div className="form-group">
            <label htmlFor="capacidad">Capacidad (Personas)</label>
            <input
              id="capacidad"
              type="number"
              min="1"
              max="20"
              placeholder="Ej. 4"
              value={capacidad}
              onChange={(e) => setCapacidad(Number(e.target.value))}
              required
            />
          </div>

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
                  Crear mesa
                </>
              )}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}