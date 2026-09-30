// src/pages/Reportes.tsx
import { useEffect, useState } from "react";
import api from "../api/axios";

interface Sede {
  id: number;
  nombre: string;
}

interface VentaItem {
  id_sede: number;
  fecha: string;
  cantidad_ventas: number;
  total_vendido: number;
}

interface InventarioItem {
  id_sede: number;
  nombre: string;
  cantidad: number;
  stock_minimo: number;
}

export default function Reportes() {
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [idSede, setIdSede] = useState<number | "">("");
  const [ventas, setVentas] = useState<VentaItem[]>([]);
  const [inventario, setInventario] = useState<InventarioItem[]>([]);

  useEffect(() => {
    api.get("/listar_sedes").then((res) => setSedes(res.data));
    cargarReportes();
  }, []);

  const cargarReportes = async (sede?: number) => {
    const params = sede ? { id_sede: sede } : {};
    const [resVentas, resInv] = await Promise.all([
      api.get("/reportes/ventas", { params }),
      api.get("/reportes/inventario", { params }),
    ]);
    setVentas(resVentas.data);
    setInventario(resInv.data);
  };

  const nombreSede = (id: number) => sedes.find((s) => s.id === id)?.nombre || id;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Reportes</h2>

      <select
        value={idSede}
        onChange={(e) => {
          const id = e.target.value === "" ? "" : Number(e.target.value);
          setIdSede(id);
          cargarReportes(id === "" ? undefined : id);
        }}
      >
        <option value="">Todas las sedes</option>
        {sedes.map((s) => (
          <option key={s.id} value={s.id}>{s.nombre}</option>
        ))}
      </select>

      <h3 style={{ marginTop: "20px" }}>Ventas</h3>
      <table border={1} cellPadding={8} style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th>Sede</th>
            <th>Fecha</th>
            <th>Cant. ventas</th>
            <th>Total vendido</th>
          </tr>
        </thead>
        <tbody>
          {ventas.map((v, i) => (
            <tr key={i}>
              <td>{nombreSede(v.id_sede)}</td>
              <td>{v.fecha}</td>
              <td>{v.cantidad_ventas}</td>
              <td>${v.total_vendido}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 style={{ marginTop: "20px" }}>Inventario</h3>
      <table border={1} cellPadding={8} style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th>Sede</th>
            <th>Producto</th>
            <th>Cantidad</th>
            <th>Stock mínimo</th>
          </tr>
        </thead>
        <tbody>
          {inventario.map((item, i) => (
            <tr key={i}>
              <td>{nombreSede(item.id_sede)}</td>
              <td>{item.nombre}</td>
              <td>{item.cantidad}</td>
              <td>{item.stock_minimo}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}