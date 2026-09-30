import { useEffect, useState } from "react";
import api from "../api/axios";
import Button from "../components/ui/Button";
import { Input } from "../components/ui/FormField";
import DataTable, { type Column } from "../components/ui/DataTable";
import "./Sedes.css";

interface Sede {
  id: number;
  nombre: string;
  direccion: string;
  telefono?: string;
  estado: boolean;
}

export default function Sedes() {
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [editNombre, setEditNombre] = useState("");
  const [editDireccion, setEditDireccion] = useState("");
  const [editTelefono, setEditTelefono] = useState("");

  useEffect(() => {
    cargarSedes();
  }, []);

  const cargarSedes = async () => {
    try {
      const res = await api.get("/listar_sedes");
      setSedes(res.data);
    } catch {
      setError("No se pudieron cargar las sedes");
    }
  };

  const crearSede = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/crear_sedes", { nombre, direccion, telefono });
      setNombre("");
      setDireccion("");
      setTelefono("");
      cargarSedes();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Error al crear la sede");
    } finally {
      setLoading(false);
    }
  };

  const empezarEdicion = (sede: Sede) => {
    setEditandoId(sede.id);
    setEditNombre(sede.nombre);
    setEditDireccion(sede.direccion);
    setEditTelefono(sede.telefono || "");
  };

  const guardarEdicion = async (id: number) => {
    setError("");
    try {
      await api.put(`/sedes/${id}`, {
        nombre: editNombre,
        direccion: editDireccion,
        telefono: editTelefono,
      });
      setEditandoId(null);
      cargarSedes();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Error al actualizar la sede");
    }
  };

  const desactivarSede = async (id: number) => {
    if (!confirm("¿Desactivar esta sede? No se borrará, solo quedará inactiva.")) return;
    setError("");
    try {
      await api.delete(`/sedes/${id}`);
      cargarSedes();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Error al desactivar la sede");
    }
  };

  const columns: Column<Sede>[] = [
    {
      header: "Nombre",
      render: (sede) =>
        editandoId === sede.id ? (
          <input className="field__control" value={editNombre} onChange={(e) => setEditNombre(e.target.value)} />
        ) : (
          sede.nombre
        ),
    },
    {
      header: "Dirección",
      render: (sede) =>
        editandoId === sede.id ? (
          <input className="field__control" value={editDireccion} onChange={(e) => setEditDireccion(e.target.value)} />
        ) : (
          sede.direccion
        ),
    },
    {
      header: "Teléfono",
      render: (sede) =>
        editandoId === sede.id ? (
          <input className="field__control" value={editTelefono} onChange={(e) => setEditTelefono(e.target.value)} />
        ) : (
          sede.telefono || "—"
        ),
    },
    {
      header: "Estado",
      render: (sede) => (
        <span className={`badge ${sede.estado ? "badge--success" : "badge--muted"}`}>
          {sede.estado ? "Activa" : "Inactiva"}
        </span>
      ),
    },
    {
      header: "Acciones",
      render: (sede) =>
        editandoId === sede.id ? (
          <div className="actions">
            <Button size="sm" onClick={() => guardarEdicion(sede.id)}>Guardar</Button>
            <Button size="sm" variant="ghost" onClick={() => setEditandoId(null)}>Cancelar</Button>
          </div>
        ) : (
          <div className="actions">
            <Button size="sm" variant="secondary" onClick={() => empezarEdicion(sede)}>Editar</Button>
            {sede.estado && (
              <Button size="sm" variant="danger" onClick={() => desactivarSede(sede.id)}>Desactivar</Button>
            )}
          </div>
        ),
    },
  ];

  return (
    <div className="page">
      <h1>Sedes</h1>

      <DataTable columns={columns} data={sedes} keyField={(s) => s.id} emptyLabel="Todavía no hay sedes creadas" />

      <section className="page__section">
        <h2>Nueva sede</h2>
        <form onSubmit={crearSede} className="form-grid">
          <Input label="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
          <Input label="Dirección" value={direccion} onChange={(e) => setDireccion(e.target.value)} required />
          <Input label="Teléfono (opcional)" value={telefono} onChange={(e) => setTelefono(e.target.value)} />

          {error && <p className="form-error">{error}</p>}

          <Button type="submit" disabled={loading}>
            {loading ? "Creando..." : "Crear sede"}
          </Button>
        </form>
      </section>
    </div>
  );
}