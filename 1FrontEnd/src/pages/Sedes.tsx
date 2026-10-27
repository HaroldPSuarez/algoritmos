import { useEffect, useState } from "react";
import api from "../api/axios";
import "./Sedes.css";

import "@fortawesome/fontawesome-free/css/all.min.css";

interface Sede {
  id: number;
  nombre: string;
  direccion: string;
  telefono?: string;
  estado: boolean;
}

export default function Sedes() {
  // =====================================================
  // SEDES
  // =====================================================

  const [sedes, setSedes] = useState<Sede[]>([]);

  // =====================================================
  // NUEVA SEDE
  // =====================================================

  const [formAbierto, setFormAbierto] =
    useState(false);

  const [nombre, setNombre] =
    useState("");

  const [direccion, setDireccion] =
    useState("");

  const [telefono, setTelefono] =
    useState("");

  // =====================================================
  // GENERAL
  // =====================================================

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  // =====================================================
  // EDICIÓN
  // =====================================================

  const [editandoId, setEditandoId] =
    useState<number | null>(null);

  const [editNombre, setEditNombre] =
    useState("");

  const [editDireccion, setEditDireccion] =
    useState("");

  const [editTelefono, setEditTelefono] =
    useState("");

  // =====================================================
  // FILTROS
  // =====================================================

  const [busqueda, setBusqueda] =
    useState("");

  const [filtroEstado, setFiltroEstado] =
    useState("todas");

  // =====================================================
  // CARGAR SEDES
  // =====================================================

  useEffect(() => {
    cargarSedes();
  }, []);

  const cargarSedes = async () => {
    try {
      const res =
        await api.get("/listar_sedes");

      setSedes(res.data);

    } catch (err) {
      console.error(err);

      setError(
        "No se pudieron cargar las sedes"
      );
    }
  };

  // =====================================================
  // ABRIR FORMULARIO
  // =====================================================

  const abrirFormulario = () => {
    setError("");

    setNombre("");
    setDireccion("");
    setTelefono("");

    setFormAbierto(true);

    setTimeout(() => {
      document
        .getElementById(
          "form-nueva-sede"
        )
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 100);
  };

  // =====================================================
  // CERRAR FORMULARIO
  // =====================================================

  const cerrarFormulario = () => {
    setFormAbierto(false);

    setNombre("");
    setDireccion("");
    setTelefono("");

    setError("");
  };

  // =====================================================
  // CREAR SEDE
  // =====================================================

  const crearSede = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await api.post("/crear_sedes", {
        nombre: nombre.trim(),
        direccion: direccion.trim(),
        telefono: telefono.trim(),
      });

      setNombre("");
      setDireccion("");
      setTelefono("");

      await cargarSedes();

      setFormAbierto(false);

    } catch (err: any) {
      console.error(err);

      setError(
        err?.response?.data?.detail ||
          "Error al crear la sede"
      );

    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // EDITAR
  // =====================================================

  const empezarEdicion = (
    sede: Sede
  ) => {
    setEditandoId(sede.id);

    setEditNombre(sede.nombre);

    setEditDireccion(
      sede.direccion
    );

    setEditTelefono(
      sede.telefono || ""
    );

    setError("");
  };

  // =====================================================
  // CANCELAR EDICIÓN
  // =====================================================

  const cancelarEdicion = () => {
    setEditandoId(null);

    setEditNombre("");
    setEditDireccion("");
    setEditTelefono("");

    setError("");
  };

  // =====================================================
  // GUARDAR EDICIÓN
  // =====================================================

  const guardarEdicion = async (
    id: number
  ) => {
    setError("");

    try {
      await api.put(`/sedes/${id}`, {
        nombre: editNombre.trim(),
        direccion:
          editDireccion.trim(),
        telefono:
          editTelefono.trim(),
      });

      cancelarEdicion();

      await cargarSedes();

    } catch (err: any) {
      console.error(err);

      setError(
        err?.response?.data?.detail ||
          "Error al actualizar la sede"
      );
    }
  };

  // =====================================================
  // DESACTIVAR
  // =====================================================

  const desactivarSede = async (
    id: number
  ) => {
    const confirmar = window.confirm(
      "¿Desactivar esta sede? No se borrará, solo quedará inactiva."
    );

    if (!confirmar) {
      return;
    }

    try {
      setError("");

      await api.delete(
        `/sedes/${id}`
      );

      await cargarSedes();

    } catch (err: any) {
      console.error(err);

      setError(
        err?.response?.data?.detail ||
          "Error al desactivar la sede"
      );
    }
  };

  // =====================================================
  // ACTIVAR
  // =====================================================

  const activarSede = async (
    id: number
  ) => {
    const confirmar =
      window.confirm(
        "¿Activar esta sede?"
      );

    if (!confirmar) {
      return;
    }

    try {
      setError("");

      await api.put(
        `/sedes/${id}/activar`
      );

      await cargarSedes();

    } catch (err: any) {
      console.error(err);

      setError(
        err?.response?.data?.detail ||
          "Error al activar la sede"
      );
    }
  };

  // =====================================================
  // FILTRAR SEDES
  // =====================================================

  const sedesFiltradas =
    sedes.filter((sede) => {

      const texto =
        busqueda
          .toLowerCase()
          .trim();

      const coincideBusqueda =
        !texto ||
        sede.nombre
          .toLowerCase()
          .includes(texto) ||
        sede.direccion
          .toLowerCase()
          .includes(texto);

      const coincideEstado =
        filtroEstado === "todas" ||
        (
          filtroEstado ===
            "activas" &&
          sede.estado
        ) ||
        (
          filtroEstado ===
            "inactivas" &&
          !sede.estado
        );

      return (
        coincideBusqueda &&
        coincideEstado
      );
    });

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="sedes-page">

      <main className="sedes-main">

        {/* =================================================
            ENCABEZADO
        ================================================= */}

        <div className="sedes-heading">

          <div>

            <span className="section-label">
              ADMINISTRACIÓN
            </span>

            <h1>
              Sedes
            </h1>

            <p>
              Gestiona las sedes de tu bar
            </p>

          </div>


          <button
            type="button"
            className="sedes-new"
            onClick={
              formAbierto
                ? cerrarFormulario
                : abrirFormulario
            }
          >

            <span>
              {formAbierto
                ? "×"
                : "+"}
            </span>

            {formAbierto
              ? "Cerrar"
              : "Nueva sede"}

          </button>

        </div>


        {/* =================================================
            ERROR GENERAL
        ================================================= */}

        {error && !formAbierto && (
          <div className="sede-error global">

            <span>
              !
            </span>

            {error}

          </div>
        )}


        {/* =================================================
            FORMULARIO
        ================================================= */}

        <div
          id="form-nueva-sede"
          className={
            `new-sede-wrapper ${
              formAbierto
                ? "open"
                : ""
            }`
          }
        >

          <section className="new-sede">

            <div className="new-sede__header">

              <div className="new-sede-icon">
                <i className="fas fa-map-marker-alt" />
              </div>


              <div className="new-sede-title">

                <span>
                  NUEVO REGISTRO
                </span>

                <h2>
                  Registrar nueva sede
                </h2>

                <p>
                  Completa la información
                  para registrar una nueva sede.
                </p>

              </div>


              <button
                type="button"
                className="close-form"
                onClick={
                  cerrarFormulario
                }
              >
                ×
              </button>

            </div>


            <form
              onSubmit={crearSede}
            >

              <div className="form-grid">

                {/* NOMBRE */}

                <div className="sede-field">

                  <label>
                    Nombre <b>*</b>
                  </label>

                  <div className="input-wrapper">

                    <span>
                      <i className="fas fa-building" />
                    </span>

                    <input
                      type="text"
                      value={nombre}
                      onChange={(e) =>
                        setNombre(
                          e.target.value
                        )
                      }
                      placeholder="Ej. Sede Centro"
                      required
                    />

                  </div>

                </div>


                {/* DIRECCIÓN */}

                <div className="sede-field">

                  <label>
                    Dirección <b>*</b>
                  </label>

                  <div className="input-wrapper">

                    <span>
                      <i className="fas fa-location-dot" />
                    </span>

                    <input
                      type="text"
                      value={direccion}
                      onChange={(e) =>
                        setDireccion(
                          e.target.value
                        )
                      }
                      placeholder="Ej. Av. Principal 123, Bogotá"
                      required
                    />

                  </div>

                </div>


                {/* TELÉFONO */}

                <div className="sede-field">

                  <label>
                    Teléfono{" "}
                    <small>
                      (opcional)
                    </small>
                  </label>

                  <div className="input-wrapper">

                    <span>
                      <i className="fas fa-phone" />
                    </span>

                    <input
                      type="text"
                      value={telefono}
                      onChange={(e) =>
                        setTelefono(
                          e.target.value
                        )
                      }
                      placeholder="Ej. +57 300 123 4567"
                    />

                  </div>

                </div>

              </div>


              {error && (
                <div className="sede-error">

                  <span>
                    !
                  </span>

                  {error}

                </div>
              )}


              <div className="form-actions">

                <button
                  type="button"
                  className="btn-cancel-form"
                  onClick={
                    cerrarFormulario
                  }
                >
                  Cancelar
                </button>


                <button
                  type="submit"
                  className="btn-create"
                  disabled={loading}
                >

                  {loading ? (
                    <>
                      <span className="spinner" />
                      Creando...
                    </>
                  ) : (
                    <>
                      <span>
                        +
                      </span>
                      Crear sede
                    </>
                  )}

                </button>

              </div>

            </form>

          </section>

        </div>


        {/* =================================================
            BUSCADOR Y FILTROS
        ================================================= */}

        <div className="sedes-tools">

          <div className="search-box">

            <span>
              <i className="fas fa-search" />
            </span>

            <input
              type="text"
              placeholder="Buscar sedes..."
              value={busqueda}
              onChange={(e) =>
                setBusqueda(
                  e.target.value
                )
              }
            />

          </div>


          {/* SELECT CORREGIDO */}

          <div className="filter-select-wrapper">

            <select
              className="filter-select"
              value={filtroEstado}
              onChange={(e) =>
                setFiltroEstado(
                  e.target.value
                )
              }
            >

              <option value="todas">
                Todas las sedes
              </option>

              <option value="activas">
                Activas
              </option>

              <option value="inactivas">
                Inactivas
              </option>

            </select>

          </div>


          <div className="view-buttons">

            <button
              type="button"
              className="view-button active"
            >
              <i className="fas fa-th-large" />
            </button>

            <button
              type="button"
              className="view-button"
            >
              <i className="fas fa-list" />
            </button>

          </div>

        </div>


        {/* =================================================
            LISTADO
        ================================================= */}

        <div className="sedes-list">

          {sedesFiltradas.length === 0 ? (

            <div className="empty-sedes">

              <div className="empty-icon">
                <i className="fas fa-store-slash" />
              </div>

              <h3>
                No hay sedes
              </h3>

              <p>
                No se encontraron sedes
                con los filtros seleccionados.
              </p>

            </div>

          ) : (

            sedesFiltradas.map(
              (sede) => (

                <div
                  className="sede-card"
                  key={sede.id}
                >

                  {editandoId ===
                  sede.id ? (

                    /* =================================================
                       EDICIÓN
                    ================================================= */

                    <div className="sede-edit">

                      <div className="sede-edit__title">
                        Editar sede
                      </div>

                      <div className="sede-edit__grid">

                        <div className="sede-field">

                          <label>
                            Nombre
                          </label>

                          <input
                            value={
                              editNombre
                            }
                            onChange={(e) =>
                              setEditNombre(
                                e.target.value
                              )
                            }
                          />

                        </div>


                        <div className="sede-field">

                          <label>
                            Dirección
                          </label>

                          <input
                            value={
                              editDireccion
                            }
                            onChange={(e) =>
                              setEditDireccion(
                                e.target.value
                              )
                            }
                          />

                        </div>


                        <div className="sede-field">

                          <label>
                            Teléfono
                          </label>

                          <input
                            value={
                              editTelefono
                            }
                            onChange={(e) =>
                              setEditTelefono(
                                e.target.value
                              )
                            }
                          />

                        </div>

                      </div>


                      <div className="edit-actions">

                        <button
                          type="button"
                          className="btn-save"
                          onClick={() =>
                            guardarEdicion(
                              sede.id
                            )
                          }
                        >
                          ✓ Guardar
                        </button>

                        <button
                          type="button"
                          className="btn-cancel"
                          onClick={
                            cancelarEdicion
                          }
                        >
                          Cancelar
                        </button>

                      </div>

                    </div>

                  ) : (

                    /* =================================================
                       TARJETA NORMAL
                    ================================================= */

                    <>

                      <div className="sede-card-image">

                        <div className="fake-bar-image">

                          <i className="fas fa-beer-mug-empty" />

                        </div>

                      </div>


                      <div className="sede-info">

                        <div className="sede-icon">

                          <i className="fas fa-chess-rook" />

                        </div>


                        <div className="sede-details">

                          <h2>
                            {sede.nombre}
                          </h2>


                          <div className="sede-detail">

                            <span>
                              <i className="fas fa-location-dot" />
                            </span>

                            {sede.direccion}

                          </div>


                          <div className="sede-detail">

                            <span>
                              <i className="fas fa-phone" />
                            </span>

                            {sede.telefono ||
                              "Sin teléfono"}

                          </div>

                        </div>

                      </div>


                      {/* ESTADO */}

                      <div className="sede-status-wrapper">

                        <span
                          className={
                            sede.estado
                              ? "sede-status active"
                              : "sede-status inactive"
                          }
                        >

                          <span />

                          {sede.estado
                            ? "Activa"
                            : "Inactiva"}

                        </span>

                      </div>


                      {/* ACCIONES */}

                      <div className="sede-actions">

                        <button
                          type="button"
                          className="btn-edit"
                          onClick={() =>
                            empezarEdicion(
                              sede
                            )
                          }
                        >
                          <i className="fas fa-pen" />
                          Editar
                        </button>


                        {sede.estado ? (

                          <button
                            type="button"
                            className="btn-danger"
                            onClick={() =>
                              desactivarSede(
                                sede.id
                              )
                            }
                          >
                            <i className="fas fa-power-off" />
                            Desactivar
                          </button>

                        ) : (

                          <button
                            type="button"
                            className="btn-activate"
                            onClick={() =>
                              activarSede(
                                sede.id
                              )
                            }
                          >
                            <i className="fas fa-check" />
                            Activar
                          </button>

                        )}

                      </div>

                    </>

                  )}

                </div>

              )
            )

          )}

        </div>

      </main>

    </div>
  );
}