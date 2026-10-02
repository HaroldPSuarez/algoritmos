// src/pages/Mesas.tsx
import { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import "./Mesas.css";

interface Sede {
  id: number;
  nombre: string;
}

interface Mesa {
  id: number;
  numero: number;
  capacidad: number;
  estado: string; // "disponible" o "ocupada"
  id_sede: number;
}

interface Producto {
  id: number;
  nombre: string;
  precio: number;
}

interface ItemPedido {
  id_producto: number;
  cantidad: number;
}

export default function MesasMesero() {
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  
  const [idSedeSeleccionada, setIdSedeSeleccionada] = useState<number | "">("");
  const [mesaSeleccionada, setMesaSeleccionada] = useState<Mesa | null>(null);
  
  // Estado para la toma de pedidos
  const [itemsPedido, setItemsPedido] = useState<ItemPedido[]>([]);
  const [idProductoActual, setIdProductoActual] = useState<number | "">("");
  const [cantidadActual, setCantidadActual] = useState("1");

  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    cargarSedes();
    cargarProductos();
  }, []);

  useEffect(() => {
    if (idSedeSeleccionada !== "") {
      cargarMesasPorSede(Number(idSedeSeleccionada));
    } else {
      setMesas([]);
    }
  }, [idSedeSeleccionada]);

  const cargarSedes = async () => {
    try {
      const res = await api.get("/listar_sedes");
      setSedes(res.data);
      if (res.data.length > 0) {
        setIdSedeSeleccionada(res.data[0].id); // Seleccionar la primera sede por defecto
      }
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

  const cargarMesasPorSede = async (idSede: number) => {
    try {
      const res = await api.get(`/mesas?id_sede=${idSede}`);
      setMesas(res.data);
    } catch (err) {
      console.error("Error al cargar mesas", err);
    }
  };

  const agregarProductoAlPedido = (e: React.FormEvent) => {
    e.preventDefault();
    if (idProductoActual === "" || Number(cantidadActual) <= 0) return;

    const idProd = Number(idProductoActual);
    const cant = Number(cantidadActual);

    const existente = itemsPedido.find((i) => i.id_producto === idProd);
    if (existente) {
      setItemsPedido(
        itemsPedido.map((i) =>
          i.id_producto === idProd ? { ...i, cantidad: i.cantidad + cant } : i
        )
      );
    } else {
      setItemsPedido([...itemsPedido, { id_producto: idProd, cantidad: cant }]);
    }

    setIdProductoActual("");
    setCantidadActual("1");
  };

  const removerItemPedido = (idProd: number) => {
    setItemsPedido(itemsPedido.filter((i) => i.id_producto !== idProd));
  };

  const confirmarPedido = async () => {
    if (!mesaSeleccionada || itemsPedido.length === 0) {
      setError("Debe seleccionar una mesa y agregar al menos un producto.");
      return;
    }

    setError("");
    setExito("");
    setLoading(true);

    try {
      // Endpoint esperado en backend para crear pedidos
      await api.post("/pedidos", {
        id_mesa: mesaSeleccionada.id,
        id_sede: Number(idSedeSeleccionada),
        detalles: itemsPedido,
      });

      setExito(`¡Pedido registrado con éxito para la Mesa #${mesaSeleccionada.numero}!`);
      setMesaSeleccionada(null);
      setItemsPedido([]);
      cargarMesasPorSede(Number(idSedeSeleccionada));
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Error al registrar el pedido");
    } finally {
      setLoading(false);
    }
  };

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    navigate("/login");
  };

  const nombreProducto = (id: number) => productos.find((p) => p.id === id)?.nombre || `Producto #${id}`;
  const precioProducto = (id: number) => productos.find((p) => p.id === id)?.precio || 0;

  const calcularTotalPedido = () => {
    return itemsPedido.reduce((acc, item) => acc + precioProducto(item.id_producto) * item.cantidad, 0);
  };

  return (
    <div className="productos-page">
      {/* HEADER */}
      <div className="productos-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <span className="productos-eyebrow">MÓDULO DE OPERACIÓN</span>
          <h1>Planta de Mesas</h1>
          <p>Selecciona una sede, revisa el estado de las mesas y toma los pedidos de los clientes.</p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <button
            type="button"
            onClick={cerrarSesion}
            style={{
              backgroundColor: "transparent",
              border: "1px solid rgba(239, 68, 68, 0.4)",
              color: "#ef4444",
              padding: "10px 16px",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "13px",
            }}
          >
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* MENSAJES */}
      {error && (
        <div className="producto-error form-full" style={{ marginBottom: "20px" }}>
          <span>⚠️</span> {error}
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

      {/* FILTRO DE SEDE */}
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
            Seleccionar Sede de Servicio:
          </label>
          <select
            value={idSedeSeleccionada}
            onChange={(e) => {
              setIdSedeSeleccionada(e.target.value === "" ? "" : Number(e.target.value));
              setMesaSeleccionada(null);
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

      {/* GRILLA DE MESAS */}
      <section className="productos-card" style={{ marginBottom: "30px" }}>
        <div className="section-header">
          <div>
            <h2>Estado de las Mesas</h2>
            <p>Haz clic en una mesa disponible para iniciar o agregar un pedido.</p>
          </div>
        </div>

        {mesas.length > 0 ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: "16px",
              padding: "10px 0",
            }}
          >
            {mesas.map((m) => {
              const ocupada = m.estado === "ocupada";
              return (
                <div
                  key={m.id}
                  onClick={() => {
                    if (!ocupada) {
                      setMesaSeleccionada(m);
                      setItemsPedido([]);
                      setError("");
                      setExito("");
                    }
                  }}
                  style={{
                    backgroundColor: ocupada ? "#261717" : "#19221b",
                    border: `1px solid ${ocupada ? "#7f1d1d" : "#065f46"}`,
                    borderRadius: "10px",
                    padding: "20px",
                    cursor: ocupada ? "not-allowed" : "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "10px",
                    transition: "transform 0.1s ease",
                  }}
                >
                  <span style={{ fontSize: "28px" }}>🪑</span>
                  <h3 style={{ margin: 0, color: "#eee5da" }}>Mesa #{m.numero}</h3>
                  <span style={{ fontSize: "12px", color: "#bcae9e" }}>👥 Capacidad: {m.capacidad}</span>
                  <span
                    className={ocupada ? "estado-badge estado-inactivo" : "estado-badge estado-activo"}
                    style={{ marginTop: "5px" }}
                  >
                    <span className="estado-dot"></span>
                    {m.estado.toUpperCase()}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="productos-empty">
            <div className="empty-icon">🪑</div>
            <h3>No hay mesas registradas en esta sede</h3>
            <p>Selecciona otra sede en el menú superior.</p>
          </div>
        )}
      </section>

      {/* MODAL / SECCIÓN DE TOMA DE PEDIDO */}
      {mesaSeleccionada && (
        <section className="nuevo-producto-card">
          <div className="section-header">
            <div>
              <span className="section-label">NUEVO PEDIDO</span>
              <h2>Tomar pedido para la Mesa #{mesaSeleccionada.numero}</h2>
              <p>Agrega los productos que el cliente desea consumir.</p>
            </div>
          </div>

          <form onSubmit={agregarProductoAlPedido} className="producto-form" style={{ marginBottom: "20px" }}>
            <div className="form-group">
              <label>Producto</label>
              <select
                value={idProductoActual}
                onChange={(e) => setIdProductoActual(e.target.value === "" ? "" : Number(e.target.value))}
                required
              >
                <option value="">Selecciona un producto</option>
                {productos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre} (${p.precio})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Cantidad</label>
              <input
                type="number"
                min="1"
                value={cantidadActual}
                onChange={(e) => setCantidadActual(e.target.value)}
                required
              />
            </div>

            <div className="form-actions form-full">
              <button type="submit" className="crear-producto-btn">
                + Añadir al pedido
              </button>
            </div>
          </form>

          {/* LISTA DE ÍTEMS SELECCIONADOS */}
          {itemsPedido.length > 0 ? (
            <div style={{ marginBottom: "20px" }}>
              <h3 style={{ color: "#eee5da", fontSize: "15px", marginBottom: "10px" }}>Productos en la orden:</h3>
              <div className="productos-table-wrapper">
                <table className="productos-table">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Cantidad</th>
                      <th>Precio Unit.</th>
                      <th>Subtotal</th>
                      <th>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {itemsPedido.map((item) => (
                      <tr key={item.id_producto}>
                        <td>{nombreProducto(item.id_producto)}</td>
                        <td>{item.cantidad}</td>
                        <td>${precioProducto(item.id_producto)}</td>
                        <td style={{ fontWeight: "bold", color: "#34d399" }}>
                          ${precioProducto(item.id_producto) * item.cantidad}
                        </td>
                        <td>
                          <button
                            type="button"
                            onClick={() => removerItemPedido(item.id_producto)}
                            style={{
                              backgroundColor: "#ef4444",
                              color: "#fff",
                              border: "none",
                              padding: "4px 10px",
                              borderRadius: "4px",
                              cursor: "pointer",
                              fontSize: "12px",
                            }}
                          >
                            Quitar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ marginTop: "15px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#19130f", padding: "15px", borderRadius: "8px", border: "1px solid #30251e" }}>
                <span style={{ fontSize: "16px", fontWeight: "bold", color: "#eee5da" }}>
                  Total a pagar: <span style={{ color: "#34d399" }}>${calcularTotalPedido()}</span>
                </span>
                
                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    type="button"
                    onClick={confirmarPedido}
                    disabled={loading}
                    className="crear-producto-btn"
                    style={{ padding: "10px 20px" }}
                  >
                    {loading ? "Enviando..." : "Confirmar y Enviar Pedido"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setMesaSeleccionada(null)}
                    style={{
                      background: "#374151",
                      color: "#fff",
                      border: "none",
                      padding: "10px 16px",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontWeight: "600",
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <p style={{ color: "#bcae9e", fontStyle: "italic", textAlign: "center" }}>
              Aún no has agregado productos a esta mesa.
            </p>
          )}
        </section>
      )}
    </div>
  );
}