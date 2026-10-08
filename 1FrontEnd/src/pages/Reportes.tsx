// src/pages/Reportes.tsx
import { useEffect, useState } from "react";
import api from "../api/axios";
import "./Reportes.css";

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

const moneda = (valor: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(valor);

export default function Reportes() {
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [idSede, setIdSede] = useState<number | "">("");
  const [ventas, setVentas] = useState<VentaItem[]>([]);
  const [inventario, setInventario] = useState<InventarioItem[]>([]);

  useEffect(() => {
    api
      .get("/listar_sedes")
      .then((res) => setSedes(res.data))
      .catch((err) => console.error("No se pudieron cargar las sedes", err));
    cargarReportes();
  }, []);

  const cargarReportes = async (sede?: number) => {
    const params = sede ? { id_sede: sede } : {};
    try {
      const [resVentas, resInv] = await Promise.all([
        api.get("/reportes/ventas", { params }),
        api.get("/reportes/inventario", { params }),
      ]);
      setVentas(resVentas.data);
      setInventario(resInv.data);
    } catch (err) {
      console.error("No se pudieron cargar los reportes", err);
    }
  };

  const nombreSede = (id: number) =>
    sedes.find((s) => s.id === id)?.nombre || `Sede #${id}`;

  // Resumen
  const totalVendido = ventas.reduce((acc, v) => acc + Number(v.total_vendido), 0);
  const totalVentas = ventas.reduce((acc, v) => acc + Number(v.cantidad_ventas), 0);
  const bajoStock = inventario.filter((i) => i.cantidad <= i.stock_minimo).length;

  return (
    <div className="reportes-page">
      {/* ENCABEZADO + FILTRO */}
      <div className="reportes-header">
        <div>
          <span className="reportes-eyebrow">ANÁLISIS</span>
          <h1>Reportes</h1>
          <p>Ventas e inventario de tus sedes en un solo lugar.</p>
        </div>

        <div className="reportes-filtro">
          <label htmlFor="filtro-sede">Filtrar por sede</label>
          <select
            id="filtro-sede"
            value={idSede}
            onChange={(e) => {
              const id = e.target.value === "" ? "" : Number(e.target.value);
              setIdSede(id);
              cargarReportes(id === "" ? undefined : id);
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

      {/* RESUMEN */}
      <div className="reportes-stats">
        <div className="stat-card">
          <span className="stat-label">Total vendido</span>
          <span className="stat-value">{moneda(totalVendido)}</span>
          <span className="stat-hint">Suma del periodo mostrado</span>
        </div>

        <div className="stat-card">
          <span className="stat-label">Cantidad de ventas</span>
          <span className="stat-value">{totalVentas}</span>
          <span className="stat-hint">Transacciones registradas</span>
        </div>

        <div className="stat-card">
          <span className="stat-label">Productos con stock bajo</span>
          <span className={`stat-value ${bajoStock > 0 ? "alerta" : ""}`}>
            {bajoStock}
          </span>
          <span className="stat-hint">En o por debajo del mínimo</span>
        </div>
      </div>

      {/* VENTAS */}
      <section className="reportes-card">
        <div className="reportes-card-header">
          <div>
            <h2>Ventas</h2>
            <p>Resumen diario por sede</p>
          </div>
          <span className="reportes-pill">{ventas.length} registros</span>
        </div>

        {ventas.length > 0 ? (
          <div className="reportes-table-wrapper">
            <table className="reportes-table">
              <thead>
                <tr>
                  <th>Sede</th>
                  <th>Fecha</th>
                  <th className="num">Cant. ventas</th>
                  <th className="num">Total vendido</th>
                </tr>
              </thead>
              <tbody>
                {ventas.map((v, i) => (
                  <tr key={i}>
                    <td>
                      <span className="rep-sede">{nombreSede(v.id_sede)}</span>
                    </td>
                    <td className="rep-fecha">{v.fecha}</td>
                    <td className="num rep-num">{v.cantidad_ventas}</td>
                    <td className="num rep-total">
                      {moneda(Number(v.total_vendido))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="reportes-empty">
            <div className="empty-icon">◈</div>
            <h3>Sin ventas registradas</h3>
            <p>Cuando haya ventas, aparecerán aquí.</p>
          </div>
        )}
      </section>

      {/* INVENTARIO */}
      <section className="reportes-card">
        <div className="reportes-card-header">
          <div>
            <h2>Inventario</h2>
            <p>Existencias actuales frente al stock mínimo</p>
          </div>
          <span className="reportes-pill">{inventario.length} productos</span>
        </div>

        {inventario.length > 0 ? (
          <div className="reportes-table-wrapper">
            <table className="reportes-table">
              <thead>
                <tr>
                  <th>Sede</th>
                  <th>Producto</th>
                  <th className="num">Cantidad</th>
                  <th className="num">Stock mínimo</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {inventario.map((item, i) => {
                  const bajo = item.cantidad <= item.stock_minimo;
                  // Barra: llena cuando hay el doble del mínimo o más
                  const porcentaje = Math.min(
                    100,
                    item.stock_minimo > 0
                      ? (item.cantidad / (item.stock_minimo * 2)) * 100
                      : 100
                  );

                  return (
                    <tr key={i}>
                      <td>
                        <span className="rep-sede">{nombreSede(item.id_sede)}</span>
                      </td>
                      <td className="rep-producto">{item.nombre}</td>
                      <td className="num">
                        <div className="stock-cell">
                          <div className={`stock-bar ${bajo ? "bajo" : ""}`}>
                            <span style={{ width: `${porcentaje}%` }} />
                          </div>
                          <span className="rep-num">{item.cantidad}</span>
                        </div>
                      </td>
                      <td className="num rep-num">{item.stock_minimo}</td>
                      <td>
                        <span className={`rep-badge ${bajo ? "bajo" : "ok"}`}>
                          {bajo ? "Stock bajo" : "Disponible"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="reportes-empty">
            <div className="empty-icon">◈</div>
            <h3>Sin inventario</h3>
            <p>No hay productos para mostrar en esta sede.</p>
          </div>
        )}
      </section>
    </div>
  );
}