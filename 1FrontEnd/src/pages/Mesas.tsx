// src/pages/Mesas.tsx

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
// import { useNavigate } from "react-router-dom";

import api from "../api/axios";

import {
  faChevronLeft,
  faChevronRight,
  faEye,
  faMagnifyingGlass,
  faPlus,
  faRotate,
  faTrash,
  faPen,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import "./Mesas.css";


// ======================================================
// INTERFACES
// ======================================================

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

interface Producto {
  id: number;
  nombre: string;
  precio: number;
}

interface ItemPedido {
  id_producto: number;
  cantidad: number;
}

interface DetallePedido {
  id: number;
  id_producto: number;
  cantidad: number;
  precio_unitario: number;
}

interface PedidoActivo {
  id: number;
  id_mesa: number;
  estado: string;
  total: number;
  detalles: DetallePedido[];
}


// ======================================================
// COMPONENTE
// ======================================================

export default function MesasMesero() {

  // const navigate = useNavigate();

  // ----------------------------------------------------
  // DATOS
  // ----------------------------------------------------

  const [sedes, setSedes] = useState<Sede[]>([]);
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [pedidosActivos, setPedidosActivos] = useState<PedidoActivo[]>([]);

  // ----------------------------------------------------
  // FILTROS
  // ----------------------------------------------------

  const [idSedeSeleccionada, setIdSedeSeleccionada] =
    useState<number | "">("");

  const [busqueda, setBusqueda] = useState("");

  const [pagina, setPagina] = useState(1);

  const mesasPorPagina = 10;

  // ----------------------------------------------------
  // MODAL / PEDIDO
  // ----------------------------------------------------

  const [mesaSeleccionada, setMesaSeleccionada] =
    useState<Mesa | null>(null);

  const [pedidoActualMesa, setPedidoActualMesa] =
    useState<PedidoActivo | null>(null);

  const [itemsPedido, setItemsPedido] =
    useState<ItemPedido[]>([]);

  const [idProductoActual, setIdProductoActual] =
    useState<number | "">("");

  const [cantidadActual, setCantidadActual] =
    useState("1");

  // ----------------------------------------------------
  // ESTADOS
  // ----------------------------------------------------

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [exito, setExito] = useState("");

  // ====================================================
  // CARGA INICIAL
  // ====================================================

  useEffect(() => {
    cargarSedes();
    cargarProductos();
  }, []);

  // ====================================================
  // CARGAR SEDES
  // ====================================================

  const cargarSedes = async () => {

    try {

      const res = await api.get("/listar_sedes");

      setSedes(Array.isArray(res.data) ? res.data : []);

    } catch (err) {

      console.error("Error al cargar sedes:", err);

      setError("No fue posible cargar las sedes.");

    }
  };

  // ====================================================
  // CARGAR PRODUCTOS
  // ====================================================

  const cargarProductos = async () => {

    try {

      const res = await api.get("/productos");

      setProductos(Array.isArray(res.data) ? res.data : []);

    } catch (err) {

      console.error("Error al cargar productos:", err);

    }
  };

  // ====================================================
  // CARGAR MESAS
  // ====================================================

  const cargarMesas = async () => {

    try {

      setLoading(true);
      setError("");

      // ----------------------------------------------
      // SI SE SELECCIONÓ UNA SEDE
      // ----------------------------------------------

      if (idSedeSeleccionada !== "") {

        const [resMesas, resPedidos] = await Promise.all([
          api.get(`/mesas?id_sede=${idSedeSeleccionada}`),
          api.get(`/pedidos/activos?id_sede=${idSedeSeleccionada}`),
        ]);

        setMesas(
          Array.isArray(resMesas.data)
            ? resMesas.data
            : []
        );

        setPedidosActivos(
          Array.isArray(resPedidos.data)
            ? resPedidos.data
            : []
        );

        return;
      }

      // ----------------------------------------------
      // TODAS LAS SEDES
      // ----------------------------------------------

      if (sedes.length === 0) {

        setMesas([]);
        setPedidosActivos([]);

        return;
      }

      const respuestas = await Promise.all(
        sedes.map(async (sede) => {

          try {

            const [resMesas, resPedidos] = await Promise.all([
              api.get(`/mesas?id_sede=${sede.id}`),
              api.get(`/pedidos/activos?id_sede=${sede.id}`),
            ]);

            return {
              mesas: Array.isArray(resMesas.data)
                ? resMesas.data
                : [],

              pedidos: Array.isArray(resPedidos.data)
                ? resPedidos.data
                : [],
            };

          } catch (err) {

            console.error(
              `Error cargando sede ${sede.id}:`,
              err
            );

            return {
              mesas: [],
              pedidos: [],
            };
          }
        })
      );

      setMesas(
        respuestas.flatMap((item) => item.mesas)
      );

      setPedidosActivos(
        respuestas.flatMap((item) => item.pedidos)
      );

    } catch (err) {

      console.error("Error cargando mesas:", err);

      setError(
        "No fue posible cargar la información de las mesas."
      );

    } finally {

      setLoading(false);

    }
  };

  // ====================================================
  // RECARGAR CUANDO CAMBIA LA SEDE
  // ====================================================

  useEffect(() => {

    if (sedes.length > 0) {
      cargarMesas();
    }

  }, [idSedeSeleccionada, sedes]);

  // ====================================================
  // NOMBRE DE SEDE
  // ====================================================

  const nombreSede = (idSede: number) => {

    return (
      sedes.find((sede) => sede.id === idSede)?.nombre ||
      "Sin sede"
    );
  };

  // ====================================================
  // NORMALIZAR ESTADO
  // ====================================================

  const obtenerEstado = (estado: string): "Disponible" | "Ocupada" => {
  const estadoNormalizado = estado?.toLowerCase().trim();

  if (
    estadoNormalizado === "ocupada" ||
    estadoNormalizado === "ocupado"
  ) {
    return "Ocupada";
  }

  return "Disponible";
};

  // ====================================================
  // MESAS FILTRADAS
  // ====================================================

  const mesasFiltradas = useMemo(() => {

    const texto = busqueda.toLowerCase().trim();

    return mesas.filter((mesa) => {

      const sede = nombreSede(mesa.id_sede);

      const coincideSede =
        idSedeSeleccionada === "" ||
        mesa.id_sede === Number(idSedeSeleccionada);

      const coincideBusqueda =
        texto === "" ||
        `mesa ${mesa.numero}`
          .toLowerCase()
          .includes(texto) ||
        sede.toLowerCase().includes(texto) ||
        obtenerEstado(mesa.estado)
          .toLowerCase()
          .includes(texto);

      return coincideSede && coincideBusqueda;

    });

  }, [
    mesas,
    busqueda,
    idSedeSeleccionada,
    sedes,
  ]);

  // ====================================================
  // ESTADÍSTICAS
  // ====================================================

  const totalMesas = mesasFiltradas.length;

  const mesasDisponibles = mesasFiltradas.filter(
    (mesa) => obtenerEstado(mesa.estado) === "Disponible"
  ).length;

  const mesasOcupadas = mesasFiltradas.filter(
    (mesa) => obtenerEstado(mesa.estado) === "Ocupada"
  ).length;

  // ====================================================
  // PAGINACIÓN
  // ====================================================

  const totalPaginas =
    Math.ceil(totalMesas / mesasPorPagina);

  const indiceInicial =
    (pagina - 1) * mesasPorPagina;

  const indiceFinal =
    indiceInicial + mesasPorPagina;

  const mesasPagina =
    mesasFiltradas.slice(
      indiceInicial,
      indiceFinal
    );

  // ====================================================
  // CAMBIO DE FILTRO
  // ====================================================

  const cambiarSede = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {

    const value = e.target.value;

    setIdSedeSeleccionada(
      value === "" ? "" : Number(value)
    );

    setPagina(1);
  };

  // ====================================================
  // BUSCAR
  // ====================================================

  const cambiarBusqueda = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {

    setBusqueda(e.target.value);

    setPagina(1);
  };

  // ====================================================
  // ABRIR MESA
  // ====================================================

  const abrirMesa = (mesa: Mesa) => {

    setError("");
    setExito("");

    setMesaSeleccionada(mesa);

    setItemsPedido([]);

    const pedido = pedidosActivos.find(
      (p) => p.id_mesa === mesa.id
    );

    setPedidoActualMesa(
      pedido || null
    );
  };

  // ====================================================
  // CERRAR MODAL
  // ====================================================

  const cerrarModal = () => {

    setMesaSeleccionada(null);

    setPedidoActualMesa(null);

    setItemsPedido([]);

    setIdProductoActual("");

    setCantidadActual("1");

    setError("");
  };

  // ====================================================
  // PRODUCTO
  // ====================================================

  const nombreProducto = (id: number) => {

    return (
      productos.find(
        (producto) => producto.id === id
      )?.nombre ||
      `Producto #${id}`
    );
  };

  const precioProducto = (id: number) => {

    return (
      productos.find(
        (producto) => producto.id === id
      )?.precio || 0
    );
  };

  // ====================================================
  // AGREGAR PRODUCTO LOCAL
  // ====================================================

  const agregarItemLocal = (
    e: FormEvent
  ) => {

    e.preventDefault();

    if (
      idProductoActual === "" ||
      Number(cantidadActual) <= 0
    ) {
      return;
    }

    const idProducto =
      Number(idProductoActual);

    const cantidad =
      Number(cantidadActual);

    const existente =
      itemsPedido.find(
        (item) =>
          item.id_producto === idProducto
      );

    if (existente) {

      setItemsPedido(
        itemsPedido.map((item) =>
          item.id_producto === idProducto
            ? {
                ...item,
                cantidad:
                  item.cantidad + cantidad,
              }
            : item
        )
      );

    } else {

      setItemsPedido([
        ...itemsPedido,
        {
          id_producto: idProducto,
          cantidad,
        },
      ]);
    }

    setIdProductoActual("");

    setCantidadActual("1");
  };

  // ====================================================
  // ELIMINAR PRODUCTO LOCAL
  // ====================================================

  const removerItemLocal = (
    idProducto: number
  ) => {

    setItemsPedido(
      itemsPedido.filter(
        (item) =>
          item.id_producto !== idProducto
      )
    );
  };

  // ====================================================
  // TOTAL LOCAL
  // ====================================================

  const calcularTotalLocal = () => {

    return itemsPedido.reduce(
      (total, item) =>
        total +
        precioProducto(item.id_producto) *
          item.cantidad,
      0
    );
  };

  // ====================================================
  // CREAR PEDIDO
  // ====================================================

  const confirmarNuevoPedido = async () => {

    if (
      !mesaSeleccionada ||
      itemsPedido.length === 0
    ) {

      setError(
        "Debes agregar al menos un producto."
      );

      return;
    }

    setLoading(true);

    setError("");
    setExito("");

    try {

      await api.post("/pedidos", {

        id_mesa:
          mesaSeleccionada.id,

        id_sede:
          mesaSeleccionada.id_sede,

        detalles:
          itemsPedido,
      });

      setExito(
        `Pedido registrado correctamente para la Mesa #${mesaSeleccionada.numero}.`
      );

      setItemsPedido([]);

      setMesaSeleccionada(null);

      await cargarMesas();

    } catch (err: any) {

      setError(
        err?.response?.data?.detail ||
        "Error al registrar el pedido."
      );

    } finally {

      setLoading(false);
    }
  };

  // ====================================================
  // AGREGAR PRODUCTOS A PEDIDO EXISTENTE
  // ====================================================

  const agregarProductosAPedidoExistente =
    async () => {

      if (
        !mesaSeleccionada ||
        itemsPedido.length === 0
      ) {

        setError(
          "Debes agregar al menos un producto."
        );

        return;
      }

      setLoading(true);

      setError("");
      setExito("");

      try {

        await api.post(
          `/mesas/${mesaSeleccionada.id}/detalles-pedido`,
          itemsPedido
        );

        setExito(
          "Productos añadidos al pedido correctamente."
        );

        setItemsPedido([]);

        await cargarMesas();

      } catch (err: any) {

        setError(
          err?.response?.data?.detail ||
          "Error al añadir productos."
        );

      } finally {

        setLoading(false);
      }
    };

  // ====================================================
  // QUITAR DETALLE
  // ====================================================

  const quitarDetallePedido =
    async (idDetalle: number) => {

      const confirmar =
        window.confirm(
          "¿Deseas quitar este producto del pedido?"
        );

      if (!confirmar) {
        return;
      }

      setLoading(true);

      setError("");
      setExito("");

      try {

        const res = await api.delete(
          `/pedidos/detalles/${idDetalle}`
        );

        setExito(
          "Producto retirado correctamente."
        );

        if (
          !res.data?.detalles ||
          res.data.detalles.length === 0
        ) {

          setPedidoActualMesa(null);

        } else {

          setPedidoActualMesa(
            res.data
          );
        }

        await cargarMesas();

      } catch (err: any) {

        setError(
          err?.response?.data?.detail ||
          "No fue posible retirar el producto."
        );

      } finally {

        setLoading(false);
      }
    };

  // ====================================================
  // CANCELAR PEDIDO
  // ====================================================

  const cancelarPedidoActual =
    async (idPedido: number) => {

      const confirmar =
        window.confirm(
          "¿Deseas cancelar este pedido completo?"
        );

      if (!confirmar) {
        return;
      }

      setLoading(true);

      setError("");
      setExito("");

      try {

        await api.put(
          `/pedidos/${idPedido}/cancelar`
        );

        setExito(
          "Pedido cancelado correctamente."
        );

        setMesaSeleccionada(null);

        setPedidoActualMesa(null);

        await cargarMesas();

      } catch (err: any) {

        setError(
          err?.response?.data?.detail ||
          "No fue posible cancelar el pedido."
        );

      } finally {

        setLoading(false);
      }
    };

  // ====================================================
  // NUEVA MESA
  // ====================================================

  const nuevaMesa = () => {

    setError(
      "La creación de mesas requiere el endpoint correspondiente en el backend."
    );
  };

  // ====================================================
  // ELIMINAR MESA
  // ====================================================

  const eliminarMesa = (mesa: Mesa) => {

    setError(
      `La eliminación de la Mesa #${mesa.numero} requiere un endpoint de eliminación en el backend.`
    );
  };

  // ====================================================
  // CERRAR SESIÓN
  // ====================================================
  // const cerrarSesion = () => {
  //   localStorage.removeItem("token");
  //   sessionStorage.removeItem("token");
  //   navigate("/login");
  // };

  // ====================================================
  // RENDER
  // ====================================================

  return (

    <div className="mesas-page">

      {/* ==============================================
          HEADER
      =============================================== */}

      <header className="mesas-header">

        <div>

          <span className="mesas-eyebrow">
            ADMINISTRACIÓN
          </span>

          <h1>
            Gestión de Mesas
          </h1>

          <p>
            Administra, filtra y configura las mesas
            por cada sede del bar.
          </p>

        </div>

      </header>


      {/* ==============================================
          MENSAJES
      =============================================== */}

      {error && (

        <div className="mesas-alert mesas-alert-error">

          <span>
            {error}
          </span>

          <button
            type="button"
            onClick={() => setError("")}
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>

        </div>

      )}

      {exito && (

        <div className="mesas-alert mesas-alert-success">

          <span>
            {exito}
          </span>

          <button
            type="button"
            onClick={() => setExito("")}
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>

        </div>

      )}


      {/* ==============================================
          ESTADÍSTICAS
      =============================================== */}

      <section className="mesas-stats">

        <div className="mesa-stat-card">

          <div className="mesa-stat-icon">
            <FontAwesomeIcon icon={faEye} />
          </div>

          <div>

            <span>
              Total de mesas
            </span>

            <strong>
              {totalMesas}
            </strong>

          </div>

        </div>


        <div className="mesa-stat-card">

          <div className="mesa-stat-icon">
            <span className="stat-dot stat-dot-green" />
          </div>

          <div>

            <span>
              Disponibles
            </span>

            <strong>
              {mesasDisponibles}
            </strong>

          </div>

        </div>


        <div className="mesa-stat-card">

          <div className="mesa-stat-icon">
            <span className="stat-dot stat-dot-red" />
          </div>

          <div>

            <span>
              Ocupadas
            </span>

            <strong>
              {mesasOcupadas}
            </strong>

          </div>

        </div>


        <div className="mesa-stat-card">

          <div className="mesa-stat-icon">
            <span className="stat-building">
              S
            </span>
          </div>

          <div>

            <span>
              Sedes
            </span>

            <strong>
              {sedes.length}
            </strong>

          </div>

        </div>

      </section>


      {/* ==============================================
          FILTROS
      =============================================== */}

      <section className="mesas-toolbar">

        <div className="mesas-filter">

          <label>
            Filtrar por Sede:
          </label>

          <select
            value={idSedeSeleccionada}
            onChange={cambiarSede}
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

        </div>


        <div className="mesas-search">

          <FontAwesomeIcon
            icon={faMagnifyingGlass}
          />

          <input
            type="text"
            placeholder="Buscar mesa..."
            value={busqueda}
            onChange={cambiarBusqueda}
          />

        </div>


        <button
          type="button"
          className="btn-nueva-mesa"
          onClick={nuevaMesa}
        >

          <FontAwesomeIcon icon={faPlus} />

          Nueva mesa

        </button>

      </section>


      {/* ==============================================
          TABLA
      =============================================== */}

      <section className="mesas-card">

        <div className="mesas-table-header">

          <div>

            <h2>
              Mesas registradas
            </h2>

            <p>
              Consulta y administra el estado
              de las mesas en tiempo real.
            </p>

          </div>


          <button
            type="button"
            className="btn-refresh"
            onClick={cargarMesas}
            title="Actualizar"
          >

            <FontAwesomeIcon
              icon={faRotate}
              spin={loading}
            />

          </button>

        </div>


        <div className="mesas-table-wrapper">

          <table className="mesas-table">

            <thead>

              <tr>

                <th>
                  #
                </th>

                <th>
                  Mesa
                </th>

                <th>
                  Sede
                </th>

                <th>
                  Capacidad
                </th>

                <th>
                  Estado
                </th>

                <th className="acciones-column">
                  Acciones
                </th>

              </tr>

            </thead>


            <tbody>

              {loading ? (

                <tr>

                  <td
                    colSpan={6}
                    className="mesas-empty"
                  >

                    <div className="empty-loading">

                      <FontAwesomeIcon
                        icon={faRotate}
                        spin
                      />

                      <span>
                        Cargando mesas...
                      </span>

                    </div>

                  </td>

                </tr>

              ) : mesasPagina.length > 0 ? (

                mesasPagina.map(
                  (mesa, index) => {

                    const estado =
                      obtenerEstado(
                        mesa.estado
                      );

                    return (

                      <tr
                        key={mesa.id}
                        className="mesa-row"
                      >

                        <td className="numero-cell">

                          {indiceInicial +
                            index +
                            1}

                        </td>


                        <td>

                          <div className="mesa-name">

                            <div className="mesa-number-circle">
                              {mesa.numero}
                            </div>

                            <div>

                              <strong>
                                Mesa {mesa.numero}
                              </strong>

                              <span>
                                ID #{mesa.id}
                              </span>

                            </div>

                          </div>

                        </td>


                        <td>

                          <span className="sede-name">
                            {nombreSede(
                              mesa.id_sede
                            )}
                          </span>

                        </td>


                        <td>

                          <span className="capacidad">

                            {mesa.capacidad}

                            <small>
                              personas
                            </small>

                          </span>

                        </td>


                        <td>

                          <span
                            className={
                              `mesa-status status-${estado.toLowerCase()}`
                            }
                          >

                            <span className="status-dot" />

                            {estado}

                          </span>

                        </td>


                        <td>

                          <div className="mesa-actions">

                            <button
                              type="button"
                              className="action-btn action-view"
                              title="Ver mesa"
                              onClick={() =>
                                abrirMesa(mesa)
                              }
                            >

                              <FontAwesomeIcon
                                icon={faEye}
                              />

                            </button>


                            <button
                              type="button"
                              className="action-btn action-edit"
                              title="Editar mesa"
                              onClick={() =>
                                setError(
                                  "La edición de mesas requiere el endpoint correspondiente en el backend."
                                )
                              }
                            >

                              <FontAwesomeIcon
                                icon={faPen}
                              />

                            </button>


                            <button
                              type="button"
                              className="action-btn action-delete"
                              title="Eliminar mesa"
                              onClick={() =>
                                eliminarMesa(mesa)
                              }
                            >

                              <FontAwesomeIcon
                                icon={faTrash}
                              />

                            </button>

                          </div>

                        </td>

                      </tr>

                    );
                  }
                )

              ) : (

                <tr>

                  <td
                    colSpan={6}
                    className="mesas-empty"
                  >

                    <div className="empty-state">

                      <div className="empty-state-icon">
                        🪑
                      </div>

                      <h3>
                        No hay mesas registradas
                      </h3>

                      <p>
                        No encontramos mesas
                        con los filtros seleccionados.
                      </p>

                    </div>

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>


        {/* ==========================================
            FOOTER TABLA
        =========================================== */}

        <div className="mesas-table-footer">

          <span>

            Mostrando{" "}

            {totalMesas === 0
              ? 0
              : indiceInicial + 1}

            {" - "}

            {Math.min(
              indiceFinal,
              totalMesas
            )}

            {" "}de{" "}

            {totalMesas}

            {" "}mesas

          </span>


          <div className="pagination">

            <button
              type="button"
              disabled={pagina <= 1}
              onClick={() =>
                setPagina(
                  (actual) =>
                    Math.max(1, actual - 1)
                )
              }
            >

              <FontAwesomeIcon
                icon={faChevronLeft}
              />

            </button>


            {Array.from(
              {
                length: Math.max(
                  totalPaginas,
                  1
                ),
              },
              (_, index) =>
                index + 1
            )
              .slice(0, 5)
              .map((numero) => (

                <button
                  key={numero}
                  type="button"
                  className={
                    pagina === numero
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setPagina(numero)
                  }
                >
                  {numero}
                </button>

              ))}


            <button
              type="button"
              disabled={
                pagina >= totalPaginas ||
                totalPaginas === 0
              }
              onClick={() =>
                setPagina(
                  (actual) =>
                    Math.min(
                      totalPaginas,
                      actual + 1
                    )
                )
              }
            >

              <FontAwesomeIcon
                icon={faChevronRight}
              />

            </button>

          </div>


          <div className="page-size">

            <span>
              10 por página
            </span>

          </div>

        </div>

      </section>


      {/* ==============================================
          MODAL DE MESA
      =============================================== */}

      {mesaSeleccionada && (

        <div
          className="mesa-modal-overlay"
          onClick={cerrarModal}
        >

          <div
            className="mesa-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="mesa-modal-header">

              <div>

                <span>
                  GESTIÓN DE MESA
                </span>

                <h2>
                  Mesa #{mesaSeleccionada.numero}
                </h2>

                <p>
                  {nombreSede(
                    mesaSeleccionada.id_sede
                  )}
                  {" · "}
                  {mesaSeleccionada.capacidad}
                  {" personas"}
                </p>

              </div>


              <button
                type="button"
                onClick={cerrarModal}
              >

                <FontAwesomeIcon
                  icon={faXmark}
                />

              </button>

            </div>


            <div className="mesa-modal-body">

              {pedidoActualMesa ? (

                <>

                  <div className="pedido-summary">

                    <div>

                      <span>
                        Pedido actual
                      </span>

                      <strong>
                        #{pedidoActualMesa.id}
                      </strong>

                    </div>

                    <div>

                      <span>
                        Total
                      </span>

                      <strong>
                        $
                        {Number(
                          pedidoActualMesa.total
                        ).toLocaleString(
                          "es-CO"
                        )}
                      </strong>

                    </div>

                  </div>


                  <h3>
                    Productos solicitados
                  </h3>


                  <div className="pedido-details">

                    {pedidoActualMesa.detalles?.length >
                    0 ? (

                      pedidoActualMesa.detalles.map(
                        (detalle) => (

                          <div
                            className="pedido-item"
                            key={detalle.id}
                          >

                            <div>

                              <strong>
                                {nombreProducto(
                                  detalle.id_producto
                                )}
                              </strong>

                              <span>
                                {detalle.cantidad}
                                {" × "}
                                $
                                {Number(
                                  detalle.precio_unitario
                                ).toLocaleString(
                                  "es-CO"
                                )}
                              </span>

                            </div>


                            <strong>

                              $
                              {Number(
                                detalle.precio_unitario *
                                detalle.cantidad
                              ).toLocaleString(
                                "es-CO"
                              )}

                            </strong>


                            <button
                              type="button"
                              onClick={() =>
                                quitarDetallePedido(
                                  detalle.id
                                )
                              }
                            >

                              <FontAwesomeIcon
                                icon={faTrash}
                              />

                            </button>

                          </div>

                        )
                      )

                    ) : (

                      <p className="sin-productos">
                        No hay productos registrados.
                      </p>

                    )}

                  </div>


                  <form
                    className="pedido-form"
                    onSubmit={agregarItemLocal}
                  >

                    <div>

                      <label>
                        Producto
                      </label>

                      <select
                        value={
                          idProductoActual
                        }
                        onChange={(e) =>
                          setIdProductoActual(
                            e.target.value === ""
                              ? ""
                              : Number(
                                  e.target.value
                                )
                          )
                        }
                      >

                        <option value="">
                          Selecciona un producto
                        </option>

                        {productos.map(
                          (producto) => (

                            <option
                              key={producto.id}
                              value={producto.id}
                            >

                              {producto.nombre}
                              {" - $"}
                              {Number(
                                producto.precio
                              ).toLocaleString(
                                "es-CO"
                              )}

                            </option>

                          )
                        )}

                      </select>

                    </div>


                    <div>

                      <label>
                        Cantidad
                      </label>

                      <input
                        type="number"
                        min="1"
                        value={
                          cantidadActual
                        }
                        onChange={(e) =>
                          setCantidadActual(
                            e.target.value
                          )
                        }
                      />

                    </div>


                    <button
                      type="submit"
                      className="btn-add-product"
                    >

                      <FontAwesomeIcon
                        icon={faPlus}
                      />

                      Agregar

                    </button>

                  </form>


                  {itemsPedido.length > 0 && (

                    <div className="items-pendientes">

                      <h3>
                        Nuevos productos
                      </h3>

                      {itemsPedido.map(
                        (item) => (

                          <div
                            className="pending-item"
                            key={item.id_producto}
                          >

                            <span>
                              {nombreProducto(
                                item.id_producto
                              )}
                            </span>

                            <strong>
                              x{item.cantidad}
                            </strong>

                            <button
                              type="button"
                              onClick={() =>
                                removerItemLocal(
                                  item.id_producto
                                )
                              }
                            >

                              <FontAwesomeIcon
                                icon={faXmark}
                              />

                            </button>

                          </div>

                        )
                      )}


                      <div className="pending-total">

                        <span>
                          Total nuevos
                        </span>

                        <strong>
                          $
                          {calcularTotalLocal().toLocaleString(
                            "es-CO"
                          )}
                        </strong>

                      </div>


                      <button
                        type="button"
                        className="btn-confirm-order"
                        onClick={
                          agregarProductosAPedidoExistente
                        }
                        disabled={loading}
                      >

                        Agregar al pedido

                      </button>

                    </div>

                  )}


                  <button
                    type="button"
                    className="btn-cancel-order"
                    onClick={() =>
                      cancelarPedidoActual(
                        pedidoActualMesa.id
                      )
                    }
                  >

                    Cancelar pedido

                  </button>

                </>

              ) : (

                <>

                  <div className="mesa-disponible">

                    <div>
                      ✓
                    </div>

                    <h3>
                      Mesa disponible
                    </h3>

                    <p>
                      Agrega los productos
                      para registrar un nuevo pedido.
                    </p>

                  </div>


                  <form
                    className="pedido-form pedido-form-new"
                    onSubmit={agregarItemLocal}
                  >

                    <div>

                      <label>
                        Producto
                      </label>

                      <select
                        value={
                          idProductoActual
                        }
                        onChange={(e) =>
                          setIdProductoActual(
                            e.target.value === ""
                              ? ""
                              : Number(
                                  e.target.value
                                )
                          )
                        }
                        required
                      >

                        <option value="">
                          Selecciona un producto
                        </option>

                        {productos.map(
                          (producto) => (

                            <option
                              key={producto.id}
                              value={producto.id}
                            >

                              {producto.nombre}
                              {" - $"}
                              {Number(
                                producto.precio
                              ).toLocaleString(
                                "es-CO"
                              )}

                            </option>

                          )
                        )}

                      </select>

                    </div>


                    <div>

                      <label>
                        Cantidad
                      </label>

                      <input
                        type="number"
                        min="1"
                        value={
                          cantidadActual
                        }
                        onChange={(e) =>
                          setCantidadActual(
                            e.target.value
                          )
                        }
                      />

                    </div>


                    <button
                      type="submit"
                      className="btn-add-product"
                    >

                      <FontAwesomeIcon
                        icon={faPlus}
                      />

                      Agregar

                    </button>

                  </form>


                  {itemsPedido.length > 0 && (

                    <div className="items-pendientes">

                      <h3>
                        Productos del pedido
                      </h3>

                      {itemsPedido.map(
                        (item) => (

                          <div
                            className="pending-item"
                            key={item.id_producto}
                          >

                            <span>
                              {nombreProducto(
                                item.id_producto
                              )}
                            </span>

                            <strong>
                              x{item.cantidad}
                            </strong>

                            <button
                              type="button"
                              onClick={() =>
                                removerItemLocal(
                                  item.id_producto
                                )
                              }
                            >

                              <FontAwesomeIcon
                                icon={faXmark}
                              />

                            </button>

                          </div>

                        )
                      )}


                      <div className="pending-total">

                        <span>
                          Total
                        </span>

                        <strong>
                          $
                          {calcularTotalLocal().toLocaleString(
                            "es-CO"
                          )}
                        </strong>

                      </div>


                      <button
                        type="button"
                        className="btn-confirm-order"
                        onClick={
                          confirmarNuevoPedido
                        }
                        disabled={loading}
                      >

                        Registrar pedido

                      </button>

                    </div>

                  )}

                </>

              )}

            </div>

          </div>

        </div>

      )}

    </div>
  );
}