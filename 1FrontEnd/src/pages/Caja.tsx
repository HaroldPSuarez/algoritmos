// src/pages/Caja.tsx
import { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import "./Mesas.css";

interface DetallePedido {
  id: number;
  id_producto: number;
  cantidad: number;
  precio_unitario: number;
}

interface Pedido {
  id: number;
  id_mesa: number;
  estado: string;
  total: number;
  detalles: DetallePedido[];
}

interface Factura {
  numero_factura: string;
  monto: number;
  metodo: string;
}

export default function Caja() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<Pedido | null>(null);
  const [metodo, setMetodo] = useState("efectivo");
  const [factura, setFactura] = useState<Factura | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    cargarPedidos();
  }, []);

  const cargarPedidos = async () => {
    try {
      setLoading(true);
      const res = await api.get("/pedidos/activos");
      setPedidos(res.data);
    } catch (err) {
      console.error("Error al cargar pedidos activos", err);
    } finally {
      setLoading(false);
    }
  };

  const procesarPago = async () => {
    if (!pedidoSeleccionado) return;
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/pagos", {
        id_pedido: pedidoSeleccionado.id,
        metodo,
      });
      setFactura(res.data);
      setPedidoSeleccionado(null);
      cargarPedidos();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Error al procesar el pago");
    } finally {
      setLoading(false);
    }
  };

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="productos-page">
      {/* HEADER CON BOTÓN DE CERRAR SESIÓN */}
      <div className="productos-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <span className="productos-eyebrow">CAJA Y FACTURACIÓN</span>
          <h1>Control de Pagos</h1>
          <p>Supervisa los pedidos activos listos para cobro y genera las facturas correspondientes.</p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <div className="productos-counter" style={{ margin: 0 }}>
            <span>{pedidos.length}</span>
            <small>Pedidos activos</small>
          </div>
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
              transition: "all 0.2s",
            }}
          >
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* MENSAJES DE ERROR */}
      {error && (
        <div className="producto-error form-full" style={{ marginBottom: "20px" }}>
          <span>⚠️</span>
          {error}
        </div>
      )}

      {/* FACTURA RECIÉN GENERADA */}
      {factura && (
        <div
          style={{
            backgroundColor: "rgba(16, 185, 129, 0.15)",
            color: "#34d399",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            padding: "18px",
            borderRadius: "12px",
            marginBottom: "25px",
            fontSize: "14px",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "bold", fontSize: "16px" }}>
            <span>✅</span> Pago registrado con éxito
          </div>
          <div><strong>Factura N°:</strong> {factura.numero_factura}</div>
          <div><strong>Monto pagado:</strong> ${factura.monto}</div>
          <div><strong>Método de pago:</strong> {factura.metodo.replace("_", " ")}</div>
        </div>
      )}

      {/* TABLA DE PEDIDOS ACTIVOS */}
      <section className="productos-card" style={{ marginBottom: "30px" }}>
        <div className="section-header">
          <div>
            <h2>Pedidos en espera de pago</h2>
            <p>Selecciona un pedido para gestionar su cobro y cerrar la mesa.</p>
          </div>
        </div>

        {pedidos.length > 0 ? (
          <div className="productos-table-wrapper">
            <table className="productos-table">
              <thead>
                <tr>
                  <th>N° Pedido</th>
                  <th>Mesa</th>
                  <th>Total a Pagar</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.map((p) => (
                  <tr key={p.id}>
                    <td className="producto-id">#{p.id}</td>
                    <td>
                      <div className="producto-info">
                        <div className="producto-icon">🪑</div>
                        <span>Mesa #{p.id_mesa}</span>
                      </div>
                    </td>
                    <td style={{ color: "#34d399", fontWeight: "bold", fontSize: "15px" }}>
                      ${p.total}
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => {
                          setPedidoSeleccionado(p);
                          setFactura(null);
                        }}
                        style={{
                          backgroundColor: "#2563eb",
                          color: "#fff",
                          border: "none",
                          padding: "8px 16px",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontWeight: "bold",
                          fontSize: "13px",
                        }}
                      >
                        Cobrar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="productos-empty">
            <div className="empty-icon">💵</div>
            <h3>No hay pedidos activos</h3>
            <p>En este momento no hay cuentas pendientes de pago en el bar.</p>
          </div>
        )}
      </section>

      {/* SECCIÓN DE COBRO SELECCIONADO */}
      {pedidoSeleccionado && (
        <section className="nuevo-producto-card">
          <div className="section-header">
            <div>
              <span className="section-label">PROCESAR COBRO</span>
              <h2>Cobrar Pedido #{pedidoSeleccionado.id}</h2>
              <p>Mesa #{pedidoSeleccionado.id_mesa} — Total: <strong>${pedidoSeleccionado.total}</strong></p>
            </div>
          </div>

          <div className="producto-form">
            <div className="form-group form-full">
              <label htmlFor="metodoPago">Método de pago</label>
              <select
                id="metodoPago"
                value={metodo}
                onChange={(e) => setMetodo(e.target.value)}
              >
                <option value="efectivo">Efectivo</option>
                <option value="tarjeta_debito">Tarjeta Débito</option>
                <option value="tarjeta_credito">Tarjeta Crédito</option>
              </select>
            </div>

            <div className="form-actions form-full" style={{ display: "flex", gap: "10px" }}>
              <button
                type="button"
                onClick={procesarPago}
                disabled={loading}
                className="crear-producto-btn"
                style={{ flex: 1 }}
              >
                {loading ? "Procesando pago..." : "Confirmar pago y generar factura"}
              </button>

              <button
                type="button"
                onClick={() => setPedidoSeleccionado(null)}
                disabled={loading}
                style={{
                  background: "#374151",
                  color: "#fff",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "13px",
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}