// src/pages/Inventario.tsx
import { useEffect, useState } from "react";
import api from "../api/axios";
import "./Mesas.css"; // Reutilizamos el archivo de estilos unificado del panel

interface Sede {
  id: number;
  nombre: string;
}

interface Producto {
  id: number;
  nombre: string;
}

interface ItemInventario {
  id: number;
  id_producto: number;
  id_sede: number;
  cantidad: number;
  stock_minimo: number;
}

export default function Inventario() {
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [inventario, setInventario] = useState<ItemInventario[]>([]);

  const [idSedeConsulta, setIdSedeConsulta] = useState<number | "">("");
  const [idSedeEntrada, setIdSedeEntrada] = useState<number | "">("");
  const [idProducto, setIdProducto] = useState<number | "">("");
  const [cantidad, setCantidad] = useState("");
  const [stockMinimo, setStockMinimo] = useState("0");

  const [itemEditando, setItemEditando] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarSedes();
    cargarProductos();
  }, []);

  const cargarSedes = async () => {
    try {
      const res = await api.get("/listar_sedes");
      setSedes(res.data);
    } catch (err) {
      console.error("Error al cargar sedes", err);
    }
  };

  const cargarProductos = async () => {
    try {
      const res = await api.get("/productos");
      setProductos(res.data);
    } catch (err) {
      console.error("Error al cargar productos", err);
    }
  };

  const consultarInventario = async (idSede: number) => {
    try {
      setLoading(true);
      const res = await api.get(`/inventario/${idSede}`);
      setInventario(res.data);
    } catch (err: any) {
      console.error("Error al consultar inventario", err);
      setInventario([]);
      setError(err?.response?.data?.detail || "No se pudo cargar el inventario de esta sede.");
    } finally {
      setLoading(false);
    }
  };

  const limpiarFormulario = () => {
    setIdSedeEntrada("");
    setIdProducto("");
    setCantidad("");
    setStockMinimo("0");
    setItemEditando(null);
  };

  const registrarOActualizarInventario = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setExito("");

    if (idSedeEntrada === "" || idProducto === "") {
      setError("Por favor selecciona una sede y un producto.");
      return;
    }

    setLoading(true);
    try {
      const datos = {
        id_producto: Number(idProducto),
        id_sede: Number(idSedeEntrada),
        cantidad: Number(cantidad),
        stock_minimo: Number(stockMinimo),
      };

      if (itemEditando !== null) {
        // Si tu backend soporta actualización por PUT o endpoint de ajuste
        await api.put(`/inventario/${itemEditando}`, datos);
        setExito("Inventario actualizado correctamente.");
      } else {
        await api.post("/inventario/entrada", datos);
        setExito("Entrada de stock registrada correctamente.");
      }

      limpiarFormulario();

      // Si la sede actual consultada es la misma donde se hizo el cambio, refrescar tabla
      if (idSedeConsulta === Number(idSedeEntrada)) {
        consultarInventario(Number(idSedeEntrada));
      }
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Error al procesar la solicitud de inventario.");
    } finally {
      setLoading(false);
    }
  };

  const editarItem = (item: ItemInventario) => {
    setError("");
    setExito("");
    setItemEditando(item.id);
    setIdSedeEntrada(item.id_sede);
    setIdProducto(item.id_producto);
    setCantidad(String(item.cantidad));
    setStockMinimo(String(item.stock_minimo));

    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth",
    });
  };

  const eliminarItem = async (id: number, nombreProd: string) => {
    if (!window.confirm(`¿Estás seguro de eliminar el registro de stock para "${nombreProd}"?`)) return;

    setError("");
    setExito("");
    try {
      setLoading(true);
      await api.delete(`/inventario/${id}`);
      setExito("Registro eliminado correctamente.");
      if (idSedeConsulta !== "") {
        consultarInventario(Number(idSedeConsulta));
      }
    } catch (err: any) {
      setError(err?.response?.data?.detail || "No se pudo eliminar el registro.");
    } finally {
      setLoading(false);
    }
  };

  const nombreProducto = (id: number) => productos.find((p) => p.id === id)?.nombre || `Producto #${id}`;
  const nombreSede = (id: number) => sedes.find((s) => s.id === id)?.nombre || "";

  return (
    <div className="productos-page">
      {/* HEADER */}
      <div className="productos-header">
        <div>
          <span className="productos-eyebrow">ADMINISTRACIÓN</span>
          <h1>Control de Inventario</h1>
          <p>Supervisa las existencias de productos y administra el stock por cada sede.</p>
        </div>

        <div className="productos-counter">
          <span>{inventario.length}</span>
          <small>Ítems en sede</small>
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

      {/* FILTRO / CONSULTA POR SEDE */}
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
            Consultar existencias por sede:
          </label>
          <select
            value={idSedeConsulta}
            onChange={(e) => {
              const id = e.target.value === "" ? "" : Number(e.target.value);
              setIdSedeConsulta(id);
              if (id !== "") {
                consultarInventario(id);
              } else {
                setInventario([]);
              }
            }}
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
            <option value="">Selecciona una sede</option>
            {sedes.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* TABLA DE INVENTARIO */}
      <section className="productos-card" style={{ marginBottom: "30px" }}>
        <div className="section-header">
          <div>
            <h2>Existencias {idSedeConsulta !== "" && `en ${nombreSede(Number(idSedeConsulta))}`}</h2>
            <p>Lista de productos disponibles y stock actual en la sucursal seleccionada.</p>
          </div>
        </div>

        {inventario.length > 0 ? (
          <div className="productos-table-wrapper">
            <table className="productos-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Cantidad Actual</th>
                  <th>Stock Mínimo</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {inventario.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="producto-info">
                        <div className="producto-icon">📦</div>
                        <span>{nombreProducto(item.id_producto)}</span>
                      </div>
                    </td>
                    <td>
                      <span
                        className={
                          item.cantidad <= item.stock_minimo
                            ? "estado-badge estado-inactivo"
                            : "estado-badge estado-activo"
                        }
                      >
                        <span className="estado-dot"></span>
                        {item.cantidad} unidades
                      </span>
                    </td>
                    <td style={{ color: "#ded4c9", fontWeight: 500 }}>
                      {item.stock_minimo} unidades
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          type="button"
                          onClick={() => editarItem(item)}
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
                          onClick={() => eliminarItem(item.id, nombreProducto(item.id_producto))}
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
            <div className="empty-icon">📦</div>
            <h3>{idSedeConsulta === "" ? "Selecciona una sede para ver su inventario" : "No hay registros de inventario en esta sede"}</h3>
            <p>Usa el selector superior o registra entradas nuevas en el formulario inferior.</p>
          </div>
        )}
      </section>

      {/* FORMULARIO REGISTRAR ENTRADA / EDITAR STOCK */}
      <section className="nuevo-producto-card">
        <div className="section-header">
          <div>
            <span className="section-label">
              {itemEditando !== null ? "MODIFICAR STOCK" : "NUEVO REGISTRO"}
            </span>
            <h2>{itemEditando !== null ? "Editar stock de producto" : "Registrar entrada de stock"}</h2>
            <p>
              {itemEditando !== null
                ? "Actualiza la cantidad o el stock mínimo del producto seleccionado."
                : "Añade unidades al inventario de una sede específica."}
            </p>
          </div>
        </div>

        <form onSubmit={registrarOActualizarInventario} className="producto-form">
          <div className="form-group">
            <label htmlFor="sedeEntrada">Sede</label>
            <select
              id="sedeEntrada"
              value={idSedeEntrada}
              onChange={(e) => setIdSedeEntrada(e.target.value === "" ? "" : Number(e.target.value))}
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
            <label htmlFor="productoEntrada">Producto</label>
            <select
              id="productoEntrada"
              value={idProducto}
              onChange={(e) => setIdProducto(e.target.value === "" ? "" : Number(e.target.value))}
              required
            >
              <option value="">Selecciona un producto</option>
              {productos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="cantidadEntrada">Cantidad a ingresar</label>
            <input
              id="cantidadEntrada"
              type="number"
              min="0"
              placeholder="Ej. 24"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="stockMinimo">Stock mínimo</label>
            <input
              id="stockMinimo"
              type="number"
              min="0"
              placeholder="Ej. 5"
              value={stockMinimo}
              onChange={(e) => setStockMinimo(e.target.value)}
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
                  <span>{itemEditando !== null ? "✓" : "+"}</span>
                  {itemEditando !== null ? "Guardar cambios" : "Registrar entrada"}
                </>
              )}
            </button>

            {itemEditando !== null && (
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