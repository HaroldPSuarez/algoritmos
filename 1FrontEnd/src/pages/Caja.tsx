import { useEffect, useState } from "react";
import api from "../api/axios";

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

  useEffect(() => {
    cargarPedidos();
  }, []);

  const cargarPedidos = async () => {
    const res = await api.get("/pedidos/activos");
    setPedidos(res.data);
  };

  const procesarPago = async () => {
    if (!pedidoSeleccionado) return;
    setError("");
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
    }
  };

  return (
    <div>
      <h2>Caja — Pedidos listos para cobro</h2>

      <table border={1} cellPadding={8} style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th>Pedido</th>
            <th>Mesa</th>
            <th>Total</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {pedidos.map((p) => (
            <tr key={p.id}>
              <td>#{p.id}</td>
              <td>{p.id_mesa}</td>
              <td>${p.total}</td>
              <td>
                <button onClick={() => setPedidoSeleccionado(p)}>Cobrar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {pedidoSeleccionado && (
        <div style={{ marginTop: "20px" }}>
          <h3>Cobrar pedido #{pedidoSeleccionado.id}</h3>
          <p>Total: ${pedidoSeleccionado.total}</p>

          <label>Método de pago: </label>
          <select value={metodo} onChange={(e) => setMetodo(e.target.value)}>
            <option value="efectivo">Efectivo</option>
            <option value="tarjeta_debito">Tarjeta débito</option>
            <option value="tarjeta_credito">Tarjeta crédito</option>
          </select>

          {error && <p style={{ color: "red" }}>{error}</p>}

          <div style={{ marginTop: "10px" }}>
            <button onClick={procesarPago}>Confirmar pago</button>
            <button onClick={() => setPedidoSeleccionado(null)}>Cancelar</button>
          </div>
        </div>
      )}

      {factura && (
        <div style={{ marginTop: "20px", border: "1px solid green", padding: "10px" }}>
          <h3>✅ Pago registrado</h3>
          <p>Factura: {factura.numero_factura}</p>
          <p>Monto: ${factura.monto}</p>
          <p>Método: {factura.metodo}</p>
        </div>
      )}
    </div>
  );
}