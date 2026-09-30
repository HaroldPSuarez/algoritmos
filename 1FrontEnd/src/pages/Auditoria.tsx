// src/pages/Auditoria.tsx
import { useEffect, useState } from "react";
import api from "../api/axios";

interface AuditoriaItem {
  id: number;
  id_usuario: number;
  accion: string;
  id_sede?: number;
  creado_en: string;
}

export default function Auditoria() {
  const [registros, setRegistros] = useState<AuditoriaItem[]>([]);

  useEffect(() => {
    api.get("/auditoria").then((res) => setRegistros(res.data));
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Auditoría — Trazabilidad de operaciones</h2>

      <table border={1} cellPadding={8} style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Usuario (ID)</th>
            <th>Acción</th>
            <th>Sede</th>
          </tr>
        </thead>
        <tbody>
          {registros.map((r) => (
            <tr key={r.id}>
              <td>{new Date(r.creado_en).toLocaleString()}</td>
              <td>{r.id_usuario}</td>
              <td>{r.accion}</td>
              <td>{r.id_sede ?? "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}