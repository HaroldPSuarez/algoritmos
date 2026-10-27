import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import "./Usuarios.css";

interface Sede {
  id: number;
  nombre: string;
}

interface Usuario {
  id: number;
  nombre_completo: string;
  email: string;
  estado: boolean;
  id_rol: number;
  id_sede?: number;
}

const ROLES = [
  { id: 1, nombre: "Administrador" },
  { id: 2, nombre: "Mesero" },
  { id: 3, nombre: "Cajero" },
];

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [sedes, setSedes] = useState<Sede[]>([]);

  // FORMULARIO
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const [nombreCompleto, setNombreCompleto] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [idRol, setIdRol] = useState<number>(2);
  const [idSede, setIdSede] = useState<number | "">("");

  // BUSQUEDA Y FILTROS
  const [busqueda, setBusqueda] = useState("");
  const [filtroRol, setFiltroRol] = useState<number | "">("");
  const [filtroSede, setFiltroSede] = useState<number | "">("");
  const [filtroEstado, setFiltroEstado] = useState<
    "todos" | "activos" | "inactivos"
  >("todos");

  // ESTADOS
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarSedes();
    cargarUsuarios();
  }, []);

  // =========================================
  // CARGAR SEDES
  // =========================================

  const cargarSedes = async () => {
    try {
      const res = await api.get("/listar_sedes");
      setSedes(res.data);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar las sedes");
    }
  };

  // =========================================
  // CARGAR USUARIOS
  // =========================================

  const cargarUsuarios = async () => {
    try {
      const res = await api.get("/usuarios");
      setUsuarios(res.data);
    } catch (err) {
      console.error("No se pudieron cargar los usuarios", err);
    }
  };

  // =========================================
  // GENERAR CORREO
  // =========================================

  const handleNombreChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const val = e.target.value;

    setNombreCompleto(val);

    const formatoCorreo = val
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, ".");

    if (formatoCorreo) {
      setEmail(`${formatoCorreo}@barpolaypunto.com`);
    } else {
      setEmail("");
    }
  };

  // =========================================
  // CREAR USUARIO
  // =========================================

  const crearUsuario = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await api.post("/registrar_usuarios", {
        nombre_completo: nombreCompleto,
        email,
        password,
        id_rol: idRol,
        id_sede: idSede === "" ? null : idSede,
      });

      await cargarUsuarios();

      // Limpiar formulario
      setNombreCompleto("");
      setEmail("");
      setPassword("");
      setIdRol(2);
      setIdSede("");

      // Cerrar formulario
      setMostrarFormulario(false);

    } catch (err: any) {
      setError(
        err?.response?.data?.detail ||
        "Error al crear el usuario"
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // ELIMINAR USUARIO
  // =========================================

  const eliminarUsuario = async (id: number) => {
    const confirmar = window.confirm(
      "¿Estás seguro de eliminar este usuario?"
    );

    if (!confirmar) return;

    try {
      await api.delete(`/usuarios/${id}`);

      setUsuarios(
        usuarios.filter((u) => u.id !== id)
      );

    } catch (err: any) {
      alert(
        err?.response?.data?.detail ||
        "Error al eliminar el usuario"
      );
    }
  };

  // =========================================
  // CAMBIAR PASSWORD
  // =========================================

  const cambiarPassword = async (
    id: number,
    nombre: string
  ) => {
    const nuevaClave = window.prompt(
      `Ingresa la nueva Contraseña para ${nombre}:`
    );

    if (!nuevaClave) return;

    try {
      await api.put(
        `/usuarios/${id}/password`,
        {
          password: nuevaClave,
        }
      );

      alert(
        "┬íContraseña actualizada exitosamente!"
      );

    } catch (err: any) {
      alert(
        err?.response?.data?.detail ||
        "Error al actualizar la Contraseña"
      );
    }
  };

  // =========================================
  // NOMBRES
  // =========================================

  const nombreRol = (id: number) =>
    ROLES.find((r) => r.id === id)?.nombre ||
    "Sin rol";

  const nombreSede = (id?: number) =>
    sedes.find((s) => s.id === id)?.nombre ||
    "Sin asignar";

  // =========================================
  // FILTRAR USUARIOS
  // =========================================

  const usuariosFiltrados = useMemo(() => {
    return usuarios.filter((u) => {

      const textoBusqueda =
        busqueda.trim().toLowerCase();

      const coincideBusqueda =
        !textoBusqueda ||
        u.nombre_completo
          .toLowerCase()
          .includes(textoBusqueda) ||
        u.email
          .toLowerCase()
          .includes(textoBusqueda);

      const coincideRol =
        filtroRol === "" ||
        u.id_rol === filtroRol;

      const coincideSede =
        filtroSede === "" ||
        u.id_sede === filtroSede;

      const coincideEstado =
        filtroEstado === "todos" ||
        (filtroEstado === "activos" && u.estado) ||
        (filtroEstado === "inactivos" && !u.estado);

      return (
        coincideBusqueda &&
        coincideRol &&
        coincideSede &&
        coincideEstado
      );
    });
  }, [
    usuarios,
    busqueda,
    filtroRol,
    filtroSede,
    filtroEstado,
  ]);

  // =========================================
  // LIMPIAR FORMULARIO
  // =========================================

  const cerrarFormulario = () => {
    setMostrarFormulario(false);
    setError("");

    setNombreCompleto("");
    setEmail("");
    setPassword("");
    setIdRol(2);
    setIdSede("");
  };

  // =========================================
  // RETURN
  // =========================================

  return (
    <div className="usuarios-page">

      {/* =====================================
          ENCABEZADO
      ====================================== */}

      <div className="usuarios-heading">

        <div>
          <span className="usuarios-eyebrow">
            ADMINISTRACIÓN
          </span>

          <h1>Usuarios</h1>

          <p>
            Gestiona los usuarios, roles y sedes
            del sistema.
          </p>
        </div>

        <div className="usuarios-heading-right">

          <div className="usuarios-counter">
            <strong>{usuarios.length}</strong>
            <span>Usuarios registrados</span>
          </div>

          <button
            type="button"
            className="nuevo-usuario-btn"
            onClick={() =>
              setMostrarFormulario(!mostrarFormulario)
            }
          >
            <i className="fa-solid fa-user-plus" aria-hidden="true"></i>
            {mostrarFormulario
              ? "Cerrar formulario"
              : "Nuevo usuario"}
          </button>

        </div>

      </div>


      {/* =====================================
          FORMULARIO DESPLEGABLE
      ====================================== */}

      <div
        className={
          mostrarFormulario
            ? "usuario-form-wrapper open"
            : "usuario-form-wrapper"
        }
      >

        <section className="nuevo-usuario-card">

          <div className="nuevo-usuario-header">

            <div className="nuevo-usuario-icon">
              ÔÖÖ
            </div>

            <div className="nuevo-usuario-title">

              <span>NUEVO REGISTRO</span>

              <h2>Crear usuario</h2>

              <p>
                Añade una persona y asigna sus
                permisos de acceso.
              </p>

            </div>

            <button
              type="button"
              className="close-user-form"
              onClick={cerrarFormulario}
            >
              ├ù
            </button>

          </div>


          <form
            onSubmit={crearUsuario}
            className="usuario-form"
          >

            {/* NOMBRE */}

            <div className="form-group">

              <label htmlFor="nombre">
                Nombre completo
                <b>*</b>
              </label>

              <input
                id="nombre"
                type="text"
                placeholder="Ej. Juan P├®rez"
                value={nombreCompleto}
                onChange={handleNombreChange}
                required
              />

            </div>


            {/* CORREO */}

            <div className="form-group">

              <label htmlFor="email">
                Correo electrónico
              </label>

              <input
                id="email"
                type="email"
                value={email}
                readOnly
                placeholder="Se autocompleta con el nombre"
                className="input-autogenerated"
                required
              />

              <small className="input-help">
                El correo se genera automáticamente.
              </small>

            </div>


            {/* PASSWORD */}

            <div className="form-group">

              <label htmlFor="password">
                Contraseña
                <b>*</b>
              </label>

              <input
                id="password"
                type="password"
                placeholder="Contraseña segura"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                required
              />

            </div>


            {/* ROL */}

            <div className="form-group">

              <label htmlFor="rol">
                Rol
                <b>*</b>
              </label>

              <select
                id="rol"
                value={idRol}
                onChange={(e) =>
                  setIdRol(Number(e.target.value))
                }
              >

                {ROLES.map((r) => (
                  <option
                    key={r.id}
                    value={r.id}
                  >
                    {r.nombre}
                  </option>
                ))}

              </select>

            </div>


            {/* SEDE */}

            <div className="form-group">

              <label htmlFor="sede">
                Sede
              </label>

              <select
                id="sede"
                value={idSede}
                onChange={(e) =>
                  setIdSede(
                    e.target.value === ""
                      ? ""
                      : Number(e.target.value)
                  )
                }
              >

                <option value="">
                  Sin asignar
                </option>

                {sedes.map((s) => (
                  <option
                    key={s.id}
                    value={s.id}
                  >
                    {s.nombre}
                  </option>
                ))}

              </select>

            </div>


            {/* ERROR */}

            {error && (
              <div className="usuario-error">

                <span>!</span>

                {error}

              </div>
            )}


            {/* ACCIONES */}

            <div className="form-actions">

              <button
                type="button"
                className="btn-cancel-user"
                onClick={cerrarFormulario}
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="crear-usuario-btn"
                disabled={loading}
              >

                {loading ? (
                  <>
                    <span className="button-spinner"></span>
                    Creando...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-user-plus" aria-hidden="true"></i>
                    Crear usuario
                  </>
                )}

              </button>

            </div>

          </form>

        </section>

      </div>


      {/* =====================================
          BUSCADOR Y FILTROS
      ====================================== */}

      <div className="usuarios-tools">

        <div className="usuario-search">

          <i className="fa-solid fa-magnifying-glass" aria-hidden="true"></i>

          <input
            type="text"
            placeholder="Buscar usuario..."
            value={busqueda}
            onChange={(e) =>
              setBusqueda(e.target.value)
            }
          />

        </div>


        <select
          className="usuario-filter"
          value={filtroRol}
          onChange={(e) =>
            setFiltroRol(
              e.target.value === ""
                ? ""
                : Number(e.target.value)
            )
          }
        >

          <option value="">
            Todos los roles
          </option>

          {ROLES.map((rol) => (
            <option
              key={rol.id}
              value={rol.id}
            >
              {rol.nombre}
            </option>
          ))}

        </select>


        <select
          className="usuario-filter"
          value={filtroSede}
          onChange={(e) =>
            setFiltroSede(
              e.target.value === ""
                ? ""
                : Number(e.target.value)
            )
          }
        >

          <option value="">
            Todas las sedes
          </option>

          {sedes.map((sede) => (
            <option
              key={sede.id}
              value={sede.id}
            >
              {sede.nombre}
            </option>
          ))}

        </select>


        <select
          className="usuario-filter estado-filter"
          value={filtroEstado}
          onChange={(e) =>
            setFiltroEstado(
              e.target.value as
                | "todos"
                | "activos"
                | "inactivos"
            )
          }
        >

          <option value="todos">
            Todos
          </option>

          <option value="activos">
            Activos
          </option>

          <option value="inactivos">
            Inactivos
          </option>

        </select>

      </div>


      {/* =====================================
          RESULTADO
      ====================================== */}

      <div className="usuarios-result-count">

        Mostrando{" "}
        <strong>
          {usuariosFiltrados.length}
        </strong>{" "}
        de{" "}
        <strong>
          {usuarios.length}
        </strong>{" "}
        usuarios

      </div>


      {/* =====================================
          LISTADO
      ====================================== */}

      {usuariosFiltrados.length > 0 ? (

        <div className="usuarios-grid">

          {usuariosFiltrados.map((u) => (

            <article
              className="usuario-card"
              key={u.id}
            >

              {/* CABECERA */}

              <div className="usuario-card-top">

                <div className="usuario-main">

                  <div className="usuario-avatar">

                    {u.nombre_completo
                      .charAt(0)
                      .toUpperCase()}

                  </div>

                  <div>

                    <h3>
                      {u.nombre_completo}
                    </h3>

                    <p>
                      {u.email}
                    </p>

                  </div>

                </div>


                <span
                  className={
                    u.estado
                      ? "estado-badge estado-activo"
                      : "estado-badge estado-inactivo"
                  }
                >

                  <span></span>

                  {u.estado
                    ? "Activo"
                    : "Inactivo"}

                </span>

              </div>


              {/* DETALLES */}

              <div className="usuario-details">

                <div>

                  <small>ROL</small>

                  <span
                    className={`rol-badge rol-${u.id_rol}`}
                  >
                    {nombreRol(u.id_rol)}
                  </span>

                </div>


                <div>

                  <small>SEDE</small>

                  <strong>
                    {nombreSede(u.id_sede)}
                  </strong>

                </div>

              </div>


              {/* ACCIONES */}

              <div className="usuario-actions">

                <button
                  className="btn-password"
                  onClick={() =>
                    cambiarPassword(
                      u.id,
                      u.nombre_completo
                    )
                  }
                >
                  Cambiar contraseña
                </button>

                <button
                  className="btn-delete"
                  onClick={() =>
                    eliminarUsuario(u.id)
                  }
                  title="Eliminar usuario"
                >
                  <i className="fa-solid fa-trash" aria-hidden="true"></i>
                </button>

              </div>

            </article>

          ))}

        </div>

      ) : (

        <div className="usuarios-empty">

          <div className="empty-icon">
            ÔÖÖ
          </div>

          <h3>
            No se encontraron usuarios
          </h3>

          <p>
            Intenta cambiar los filtros o
            crea un nuevo usuario.
          </p>

        </div>

      )}

    </div>
  );
}
