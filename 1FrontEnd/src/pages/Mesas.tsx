import { useEffect, useState } from "react";
import api from "../api/axios";

interface Mesa {
  id: number;
  numero: number;
  capacidad: number;
  estado: "disponible" | "ocupada";
  id_sede: number;
}

interface Producto {
  id: number;
  nombre: string;
  precio: number;
}

export default function Mesas() {
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [mesaSeleccionada, setMesaSeleccionada] = useState<Mesa | null>(null);
  const [carrito, setCarrito] = useState<{ id_producto: number; cantidad: number }[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    cargarMesas();
    cargarProductos();
  }, []);

  const cargarMesas = async () => {
    const res = await api.get("/mesas");
    setMesas(res.data);
  };

  const cargarProductos = async () => {
    const res = await api.get("/productos");
    setProductos(res.data);
  };

  const agregarProducto = (id_producto: number) => {
    setCarrito((prev) => {
      const existe = prev.find((p) => p.id_producto === id_producto);
      if (existe) {
        return prev.map((p) =>
          p.id_producto === id_producto ? { ...p, cantidad: p.cantidad + 1 } : p
        );
      }
      return [...prev, { id_producto, cantidad: 1 }];
    });
  };

  const enviarPedido = async () => {
    if (!mesaSeleccionada || carrito.length === 0) return;
    setError("");
    try {
      await api.post("/pedidos", {
        id_mesa: mesaSeleccionada.id,
        id_sede: mesaSeleccionada.id_sede,
        detalles: carrito,
      });
      setCarrito([]);
      setMesaSeleccionada(null);
      cargarMesas();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Error al crear el pedido");
    }
  };

  return (
    <div>
      <h2>Mesas</h2>
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        {mesas.map((mesa) => (
          <button
            key={mesa.id}
            onClick={() => mesa.estado === "disponible" && setMesaSeleccionada(mesa)}
            disabled={mesa.estado === "ocupada"}
            style={{
              padding: "20px",
              background: mesa.estado === "ocupada" ? "#c0392b" : "#27ae60",
              color: "white",
            }}
          >
            Mesa {mesa.numero}
          </button>
        ))}
      </div>

      {mesaSeleccionada && (
        <div style={{ marginTop: "20px" }}>
          <h3>Nuevo pedido — Mesa {mesaSeleccionada.numero}</h3>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {productos.map((p) => (
              <button key={p.id} onClick={() => agregarProducto(p.id)}>
                {p.nombre} — ${p.precio}
              </button>
            ))}
          </div>

          <h4>Carrito</h4>
          <ul>
            {carrito.map((item) => {
              const producto = productos.find((p) => p.id === item.id_producto);
              return (
                <li key={item.id_producto}>
                  {producto?.nombre} x {item.cantidad}
                </li>
              );
            })}
          </ul>

          {error && <p style={{ color: "red" }}>{error}</p>}
          <button onClick={enviarPedido}>Confirmar pedido</button>
          <button onClick={() => setMesaSeleccionada(null)}>Cancelar</button>
        </div>
      )}
    </div>
  );
}