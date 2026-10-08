// src/pages/Auditoria.tsx
import { useEffect, useState } from "react";
import api from "../api/axios";
import "./Auditoria.css";

interface AuditoriaItem {
  id: number;
  id_usuario: number;
  accion: string;
  id_sede?: number;
  creado_en: string;
}

interface Usuario {
  id: number;
  nombre_completo: string;
}

interface Sede {
  id: number;
  nombre: string;
}

// Clasifica la acción para darle color al badge
const tipoAccion = (accion: string) => {
  const a = accion.toLowerCase();
  if (/elimin|borr|delete|desactiv/.test(a)) return "accion-eliminar";
  if (/cre|registr|agreg|add|insert|login|inici/.test(a)) return "accion-crear";
  if (/actualiz|modific|edit|cambi|update|clave|password/.test(a))
    return "accion-editar";
  return "accion-otro";
};

export default function Auditoria() {
  const [registros, setRegistros] = useState<AuditoriaItem[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [sedes, setSedes] = useState<Sede[]>([]);

  useEffect(() => {
    api
      .get("/auditoria")
      .then((res) => setRegistros(res.data))
      .catch((err) => console.error("No se pudo cargar la auditoría", err));

    // Para mostrar nombres en lugar de IDs (si fallan, se muestra el ID)
    api
      .get("/usuarios")
      .then((res) => setUsuarios(res.data))
      .catch(() => {});
    api
      .get("/listar_sedes")
      .then((res) => setSedes(res.data))
      .catch(() => {});
  }, []);

  const nombreUsuario = (id: number) =>
    usuarios.find((u) => u.id === id)?.nombre_completo || `Usuario #${id}`;

  const nombreSede = (id?: number) =>
    id ? sedes.find((s) => s.id === id)?.nombre || `Sede #${id}` : null;

  return (
    <div className="auditoria-page">
      {/* ENCABEZADO */}
      <div className="auditoria-header">
        <div>
          <span className="auditoria-eyebrow">SEGURIDAD</span>
          <h1>Auditoría</h1>
          <p>Trazabilidad de las operaciones realizadas en el sistema.</p>
        </div>

        <div className="auditoria-counter">
          <span>{registros.length}</span>
          <small>Eventos registrados</small>
        </div>
      </div>

      {/* TABLA */}
      <section className="auditoria-card">
        <div className="auditoria-card-header">
          <h2>Historial de actividad</h2>
          <p>Quién hizo qué, cuándo y en qué sede</p>
        </div>

        {registros.length > 0 ? (
          <div className="auditoria-table-wrapper">
            <table className="auditoria-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Fecha</th>
                  <th>Usuario</th>
                  <th>Acción</th>
                  <th>Sede</th>
                </tr>
              </thead>
              <tbody>
                {registros.map((r) => {
                  const fecha = new Date(r.creado_en);
                  const sede = nombreSede(r.id_sede);
                  const nombre = nombreUsuario(r.id_usuario);

                  return (
                    <tr key={r.id}>
                      <td className="audit-id">#{r.id}</td>

                      <td>
                        <div className="audit-fecha">
                          <strong>{fecha.toLocaleDateString()}</strong>
                          <small>{fecha.toLocaleTimeString()}</small>
                        </div>
                      </td>

                      <td>
                        <div className="audit-usuario">
                          <div className="audit-avatar">
                            {nombre.charAt(0).toUpperCase()}
                          </div>
                          <span>{nombre}</span>
                        </div>
                      </td>

                      <td>
                        <span className={`audit-badge ${tipoAccion(r.accion)}`}>
                          {r.accion}
                        </span>
                      </td>

                      <td>
                        {sede ? (
                          <span className="audit-sede">{sede}</span>
                        ) : (
                          <span className="audit-sede vacia">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="auditoria-empty">
            <div className="empty-icon">◈</div>
            <h3>Sin actividad registrada</h3>
            <p>Las operaciones del sistema aparecerán aquí.</p>
          </div>
        )}
      </section>
    </div>
  );
}