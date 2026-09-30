// src/pages/AdminMesas.tsx
import { useEffect, useState } from "react";
import api from "../api/axios";

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

export default function AdminMesas() {
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [idSede, setIdSede] = useState<number | "">("");
  const [numero, setNumero] = useState("");
  const [capacidad, setCapacidad] = useState("4");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarSedes();
    cargarMesas();
  }, []);

  const cargarSedes = async () => {
    const res = await api.get("/listar_sedes");
    setSedes(res.data);
  };

  const cargarMesas = async () => {
    const res = await api.get("/mesas");
    setMesas(res.data);
  };

  const crearMesa = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/mesas", {
        numero: Number(numero),
        capacidad: Number(capacidad),
        id_sede: idSede,
      });
      setNumero("");
      setCapacidad("4");
      cargarMesas();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Error al crear la mesa");
    } finally {
      setLoading(false);
    }
  };

  const nombreSede = (id: number) => sedes.find((s) => s.id === id)?.nombre || id;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Mesas</h2>

      <table border={1} cellPadding={8} style={{ borderCollapse: "collapse", width: "100%", marginBottom: "20px" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Número</th>
            <th>Capacidad</th>
            <th>Sede</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {mesas.map((m) => (
            <tr key={m.id}>
              <td>{m.id}</td>
              <td>{m.numero}</td>
              <td>{m.capacidad}</td>
              <td>{nombreSede(m.id_sede)}</td>
              <td>{m.estado}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Nueva mesa</h3>
      <form onSubmit={crearMesa} style={{ display: "flex", flexDirection: "column", gap: "8px", maxWidth: "300px" }}>
        <label>Sede</label>
        <select value={idSede} onChange={(e) => setIdSede(Number(e.target.value))} required>
          <option value="">Selecciona una sede</option>
          {sedes.map((s) => (
            <option key={s.id} value={s.id}>{s.nombre}</option>
          ))}
        </select>

        <input type="number" placeholder="Número de mesa" value={numero} onChange={(e) => setNumero(e.target.value)} required />
        <input type="number" placeholder="Capacidad" value={capacidad} onChange={(e) => setCapacidad(e.target.value)} required />

        {error && <p style={{ color: "red" }}>{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Creando..." : "Crear mesa"}
        </button>
      </form>
    </div>
  );
}