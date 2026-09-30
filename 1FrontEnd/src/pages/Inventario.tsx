// src/pages/Inventario.tsx
import { useEffect, useState } from "react";
import api from "../api/axios";

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
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarSedes();
    cargarProductos();
  }, []);

  const cargarSedes = async () => {
    const res = await api.get("/listar_sedes");
    setSedes(res.data);
  };

  const cargarProductos = async () => {
    const res = await api.get("/productos");
    setProductos(res.data);
  };

  const consultarInventario = async (id: number) => {
    const res = await api.get(`/inventario/${id}`);
    setInventario(res.data);
  };

  const registrarEntrada = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/inventario/entrada", {
        id_producto: idProducto,
        id_sede: idSedeEntrada,
        cantidad: Number(cantidad),
        stock_minimo: Number(stockMinimo),
      });
      setCantidad("");
      if (idSedeConsulta === idSedeEntrada) {
        consultarInventario(Number(idSedeEntrada));
      }
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Error al registrar la entrada");
    } finally {
      setLoading(false);
    }
  };

  const nombreProducto = (id: number) => productos.find((p) => p.id === id)?.nombre || id;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Inventario</h2>

      <h3>Consultar existencias por sede</h3>
      <select
        value={idSedeConsulta}
        onChange={(e) => {
          const id = Number(e.target.value);
          setIdSedeConsulta(id);
          if (id) consultarInventario(id);
        }}
      >
        <option value="">Selecciona una sede</option>
        {sedes.map((s) => (
          <option key={s.id} value={s.id}>{s.nombre}</option>
        ))}
      </select>

      <table border={1} cellPadding={8} style={{ borderCollapse: "collapse", width: "100%", margin: "16px 0" }}>
        <thead>
          <tr>
            <th>Producto</th>
            <th>Cantidad</th>
            <th>Stock mínimo</th>
          </tr>
        </thead>
        <tbody>
          {inventario.map((item) => (
            <tr key={item.id}>
              <td>{nombreProducto(item.id_producto)}</td>
              <td>{item.cantidad}</td>
              <td>{item.stock_minimo}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Registrar entrada de stock</h3>
      <form onSubmit={registrarEntrada} style={{ display: "flex", flexDirection: "column", gap: "8px", maxWidth: "300px" }}>
        <label>Sede</label>
        <select value={idSedeEntrada} onChange={(e) => setIdSedeEntrada(Number(e.target.value))} required>
          <option value="">Selecciona una sede</option>
          {sedes.map((s) => (
            <option key={s.id} value={s.id}>{s.nombre}</option>
          ))}
        </select>

        <label>Producto</label>
        <select value={idProducto} onChange={(e) => setIdProducto(Number(e.target.value))} required>
          <option value="">Selecciona un producto</option>
          {productos.map((p) => (
            <option key={p.id} value={p.id}>{p.nombre}</option>
          ))}
        </select>

        <input type="number" placeholder="Cantidad a ingresar" value={cantidad} onChange={(e) => setCantidad(e.target.value)} required />
        <input type="number" placeholder="Stock mínimo (opcional)" value={stockMinimo} onChange={(e) => setStockMinimo(e.target.value)} />

        {error && <p style={{ color: "red" }}>{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Registrando..." : "Registrar entrada"}
        </button>
      </form>
    </div>
  );
}