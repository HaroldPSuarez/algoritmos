import { useEffect, useState } from "react";
import api from "../api/axios";
import "./Productos.css";

interface Producto {
  id: number;
  nombre: string;
  categoria?: string;
  precio: number;
  estado: boolean;
}

const CATEGORIAS_VALIDAS = [
  "Licores y Destilados",
  "Coctelería",
  "Cervezas",
  "Vinos y Espumosos",
  "Bebidas Sin Alcohol"
];

export default function Productos() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [nombre, setNombre] = useState("");
  const [categoria, setCategoria] = useState("Bebidas Sin Alcohol");
  const [precio, setPrecio] = useState("");
  
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      const res = await api.get("/productos");
      setProductos(res.data);
    } catch {
      setError("No se pudieron cargar los productos");
    }
  };

  const guardarProducto = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setExito("");

    if (!nombre.trim()) {
      setError("El nombre del producto es obligatorio.");
      return;
    }

    const precioNum = Number(precio);
    if (isNaN(precioNum) || precioNum < 0) {
      setError("El precio debe ser un número válido mayor o igual a 0.");
      return;
    }

    setLoading(true);
    try {
      if (editandoId !== null) {
        await api.put(`/productos/${editandoId}`, {
          nombre,
          categoria,
          precio: precioNum,
        });
        setExito("¡Producto actualizado exitosamente!");
      } else {
        await api.post("/productos", {
          nombre,
          categoria,
          precio: precioNum,
        });
        setExito("¡Producto creado exitosamente!");
      }

      limpiarFormulario();
      cargarProductos();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Error al guardar el producto");
    } finally {
      setLoading(false);
    }
  };

  const iniciarEdicion = (p: Producto) => {
    setEditandoId(p.id);
    setNombre(p.nombre);
    setCategoria(p.categoria || "Bebidas Sin Alcohol");
    setPrecio(p.precio.toString());
    setError("");
    setExito("");
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  };

  const cancelarEdicion = () => {
    limpiarFormulario();
  };

  const limpiarFormulario = () => {
    setEditandoId(null);
    setNombre("");
    setCategoria("Bebida con alcohol");
    setPrecio("");
  };

  const eliminarProducto = async (id: number, nombreProd: string) => {
    if (!window.confirm(`¿Estás seguro de eliminar el producto "${nombreProd}"?`)) return;

    try {
      await api.delete(`/productos/${id}`);
      setExito(`Producto "${nombreProd}" eliminado correctamente.`);
      cargarProductos();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "No se pudo eliminar el producto.");
    }
  };

  const formatearPrecio = (valor: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(valor);
  };

  return (
    <div className="usuarios-page">
      {/* ENCABEZADO */}
      <div className="usuarios-header">
        <div>
          <span className="usuarios-eyebrow">ADMINISTRACIÓN</span>
          <h1>Catálogo de Productos</h1>
          <p>Gestiona los artículos, categorías y precios del bar.</p>
        </div>

        <div className="usuarios-counter">
          <span>{productos.length}</span>
          <small>Productos registrados</small>
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

      {/* TABLA DE PRODUCTOS */}
      <section className="usuarios-card">
        <div className="section-header">
          <div>
            <h2>Inventario de productos</h2>
            <p>Lista general de artículos disponibles</p>
          </div>
        </div>

        {productos.length > 0 ? (
          <div className="usuarios-table-wrapper">
            <table className="usuarios-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th>Precio</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productos.map((p) => (
                  <tr key={p.id}>
                    <td className="usuario-id">#{p.id}</td>
                    <td>
                      <div className="usuario-info">
                        <div className="usuario-avatar" style={{ background: "#d97706", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {p.nombre.charAt(0).toUpperCase()}
                        </div>
                        <span>{p.nombre}</span>
                      </div>
                    </td>
                    <td>
                      <span className="categoria-badge" style={{ background: "rgba(217, 119, 6, 0.15)", color: "#fbbf24", padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "600" }}>
                        {p.categoria || "General"}
                      </span>
                    </td>
                    <td style={{ fontWeight: "600", color: "#34d399" }}>
                      {formatearPrecio(p.precio)}
                    </td>
                    <td>
                      <span className={p.estado ? "estado-badge estado-activo" : "estado-badge estado-inactivo"}>
                        <span className="estado-dot"></span>
                        {p.estado ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          onClick={() => iniciarEdicion(p)}
                          style={{
                            backgroundColor: "#d97706",
                            color: "#fff",
                            border: "none",
                            padding: "6px 12px",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontWeight: "bold",
                            fontSize: "12px"
                          }}
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => eliminarProducto(p.id, p.nombre)}
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
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="usuarios-empty">
            <div className="empty-icon">📦</div>
            <h3>No hay productos registrados</h3>
            <p>Añade el primer artículo utilizando el formulario de abajo.</p>
          </div>
        )}
      </section>

      {/* FORMULARIO */}
      <section className="nuevo-usuario-card">
        <div className="section-header">
          <div>
            <span className="section-label">{editandoId !== null ? "MODIFICANDO REGISTRO" : "NUEVO REGISTRO"}</span>
            <h2>{editandoId !== null ? "Editar producto" : "Crear producto"}</h2>
            <p>{editandoId !== null ? `Actualizando información del artículo #${editandoId}` : "Añade un nuevo producto seleccionando su categoría y precio."}</p>
          </div>
        </div>

        <form onSubmit={guardarProducto} className="usuario-form">
          {/* NOMBRE */}
          <div className="form-group">
            <label htmlFor="nombre">Nombre del producto</label>
            <input
              id="nombre"
              type="text"
              placeholder="Ej. Cerveza Águila 330ml"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>

          {/* CATEGORÍA (SELECT RESTRINGIDO) */}
          <div className="form-group">
            <label htmlFor="categoria">Categoría</label>
            <select
              id="categoria"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              required
            >
              {CATEGORIAS_VALIDAS.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* PRECIO */}
          <div className="form-group">
            <label htmlFor="precio">Precio (COP)</label>
            <input
              id="precio"
              type="number"
              min="0"
              step="1"
              placeholder="Ej. 5000"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
              required
            />
          </div>

          {/* BOTONES */}
          <div className="form-actions form-full" style={{ display: "flex", gap: "10px" }}>
            <button
              type="submit"
              disabled={loading}
              className="crear-usuario-btn"
              style={{ flex: 1 }}
            >
              {loading ? (
                <>
                  <span className="button-spinner"></span> Guardando...
                </>
              ) : (
                <>
                  <span>{editandoId !== null ? "💾" : "+"}</span>
                  {editandoId !== null ? "Guardar cambios" : "Crear producto"}
                </>
              )}
            </button>

            {editandoId !== null && (
              <button
                type="button"
                onClick={cancelarEdicion}
                style={{
                  backgroundColor: "#4b5563",
                  color: "#fff",
                  border: "none",
                  padding: "12px 20px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "bold"
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