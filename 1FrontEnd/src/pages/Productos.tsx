import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import "./Productos.css";

import "@fortawesome/fontawesome-free/css/all.min.css";

interface Producto {
  id: number;
  nombre: string;
  categoria?: string;
  precio: number;
  estado: boolean;
}

const CATEGORIAS = [
  "Licores y Destilados",
  "Coctelería",
  "Cervezas",
  "Vinos y Espumosos",
  "Bebidas Sin Alcohol",
];

export default function Productos() {

  // =========================================================
  // PRODUCTOS
  // =========================================================

  const [productos, setProductos] = useState<Producto[]>([]);


  // =========================================================
  // FORMULARIO
  // =========================================================

  const [nombre, setNombre] = useState("");

  const [categoria, setCategoria] =
    useState("Bebidas Sin Alcohol");

  const [precio, setPrecio] = useState("");

  const [editandoId, setEditandoId] =
    useState<number | null>(null);

  const [mostrarFormulario, setMostrarFormulario] =
    useState(false);


  // =========================================================
  // FILTROS
  // =========================================================

  const [busqueda, setBusqueda] = useState("");

  const [filtroCategoria, setFiltroCategoria] =
    useState("");

  const [filtroEstado, setFiltroEstado] =
    useState("");


  // =========================================================
  // ESTADOS
  // =========================================================

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [exito, setExito] = useState("");


  // =========================================================
  // MODAL VER PRODUCTO
  // =========================================================

  const [productoSeleccionado, setProductoSeleccionado] =
    useState<Producto | null>(null);

  const [mostrarModalProducto, setMostrarModalProducto] =
    useState(false);


  // =========================================================
  // MODAL ELIMINAR
  // =========================================================

  const [productoEliminar, setProductoEliminar] =
    useState<Producto | null>(null);

  const [mostrarModalEliminar, setMostrarModalEliminar] =
    useState(false);

  const [eliminando, setEliminando] =
    useState(false);


  // =========================================================
  // CARGAR PRODUCTOS
  // =========================================================

  useEffect(() => {
    cargarProductos();
  }, []);


  const cargarProductos = async () => {

    try {

      const response =
        await api.get("/productos");

      setProductos(response.data);

    } catch (error) {

      console.error(error);

      setError(
        "No se pudieron cargar los productos."
      );

    }
  };


  // =========================================================
  // ESCAPE PARA CERRAR MODALES
  // =========================================================

  useEffect(() => {

    const manejarEscape = (event: KeyboardEvent) => {

      if (event.key !== "Escape") {
        return;
      }

      setMostrarModalProducto(false);

      setMostrarModalEliminar(false);

    };

    window.addEventListener(
      "keydown",
      manejarEscape
    );

    return () => {

      window.removeEventListener(
        "keydown",
        manejarEscape
      );

    };

  }, []);


  // =========================================================
  // FORMULARIO NUEVO
  // =========================================================

  const abrirFormularioNuevo = () => {

    limpiarFormulario();

    setError("");

    setExito("");

    setMostrarFormulario(true);
  };


  // =========================================================
  // CERRAR FORMULARIO
  // =========================================================

  const cerrarFormulario = () => {

    limpiarFormulario();

    setMostrarFormulario(false);

    setError("");
  };


  // =========================================================
  // LIMPIAR FORMULARIO
  // =========================================================

  const limpiarFormulario = () => {

    setNombre("");

    setCategoria(
      "Bebidas Sin Alcohol"
    );

    setPrecio("");

    setEditandoId(null);
  };


  // =========================================================
  // GUARDAR PRODUCTO
  // =========================================================

  const guardarProducto = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {

    e.preventDefault();

    setError("");

    setExito("");


    // -------------------------------------------------------
    // VALIDAR NOMBRE
    // -------------------------------------------------------

    if (!nombre.trim()) {

      setError(
        "El nombre del producto es obligatorio."
      );

      return;
    }


    // -------------------------------------------------------
    // VALIDAR PRECIO
    // -------------------------------------------------------

    const precioNumerico =
      Number(precio);


    if (
      !precio ||
      Number.isNaN(precioNumerico) ||
      precioNumerico < 0
    ) {

      setError(
        "Ingresa un precio válido."
      );

      return;
    }


    setLoading(true);


    try {

      // =====================================================
      // EDITAR
      // =====================================================

      if (editandoId !== null) {

        await api.put(
          `/productos/${editandoId}`,
          {
            nombre: nombre.trim(),
            categoria,
            precio: precioNumerico,
          }
        );

        setExito(
          "Producto actualizado correctamente."
        );

      }

      // =====================================================
      // CREAR
      // =====================================================

      else {

        await api.post(
          "/productos",
          {
            nombre: nombre.trim(),
            categoria,
            precio: precioNumerico,
          }
        );

        setExito(
          "Producto creado correctamente."
        );
      }


      await cargarProductos();


      limpiarFormulario();


      setMostrarFormulario(false);

    } catch (error: any) {

      console.error(error);

      setError(
        error?.response?.data?.detail ||
          "Ocurrió un error al guardar el producto."
      );

    } finally {

      setLoading(false);

    }
  };


  // =========================================================
  // EDITAR PRODUCTO
  // =========================================================

  const editarProducto = (
    producto: Producto
  ) => {

    setEditandoId(producto.id);

    setNombre(producto.nombre);

    setCategoria(
      producto.categoria ||
        "Bebidas Sin Alcohol"
    );

    setPrecio(
      String(producto.precio)
    );

    setError("");

    setExito("");

    setMostrarFormulario(true);
  };


  // =========================================================
  // ABRIR MODAL ELIMINAR
  // =========================================================

  const abrirModalEliminar = (
    producto: Producto
  ) => {

    setProductoEliminar(producto);

    setMostrarModalEliminar(true);

    setError("");

    setExito("");
  };


  // =========================================================
  // CERRAR MODAL ELIMINAR
  // =========================================================

  const cerrarModalEliminar = () => {

    if (eliminando) {
      return;
    }

    setMostrarModalEliminar(false);

    setProductoEliminar(null);
  };


  // =========================================================
  // CONFIRMAR ELIMINACIÓN
  // =========================================================

  const confirmarEliminar = async () => {

    if (!productoEliminar) {
      return;
    }

    setEliminando(true);

    setError("");

    setExito("");


    try {

      await api.delete(
        `/productos/${productoEliminar.id}`
      );


      await cargarProductos();


      setMostrarModalEliminar(false);

      setProductoEliminar(null);


      setExito(
        "Producto eliminado correctamente."
      );

    } catch (error: any) {

      console.error(error);

      setError(
        error?.response?.data?.detail ||
          "No se pudo eliminar el producto."
      );

    } finally {

      setEliminando(false);

    }
  };


  // =========================================================
  // VER PRODUCTO
  // =========================================================

  const verProducto = (
    producto: Producto
  ) => {

    setProductoSeleccionado(producto);

    setMostrarModalProducto(true);
  };


  // =========================================================
  // CERRAR MODAL PRODUCTO
  // =========================================================

  const cerrarModalProducto = () => {

    setMostrarModalProducto(false);

    setProductoSeleccionado(null);
  };


  // =========================================================
  // FORMATEAR PRECIO
  // =========================================================

  const formatearPrecio = (
    valor: number
  ) => {

    return new Intl.NumberFormat(
      "es-CO",
      {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0,
      }
    ).format(valor);

  };


  // =========================================================
  // FILTROS
  // =========================================================

  const productosFiltrados =
    useMemo(() => {

      const texto =
        busqueda
          .toLowerCase()
          .trim();


      return productos.filter(
        (producto) => {

          const coincideBusqueda =
            !texto ||
            producto.nombre
              .toLowerCase()
              .includes(texto) ||
            (
              producto.categoria ||
              ""
            )
              .toLowerCase()
              .includes(texto);


          const coincideCategoria =
            !filtroCategoria ||
            producto.categoria ===
              filtroCategoria;


          let coincideEstado = true;


          if (
            filtroEstado ===
            "activo"
          ) {

            coincideEstado =
              producto.estado === true;

          }


          if (
            filtroEstado ===
            "inactivo"
          ) {

            coincideEstado =
              producto.estado === false;

          }


          return (
            coincideBusqueda &&
            coincideCategoria &&
            coincideEstado
          );

        }
      );

    }, [
      productos,
      busqueda,
      filtroCategoria,
      filtroEstado,
    ]);


  // =========================================================
  // LIMPIAR FILTROS
  // =========================================================

  const limpiarFiltros = () => {

    setBusqueda("");

    setFiltroCategoria("");

    setFiltroEstado("");
  };


  // =========================================================
  // ESTADÍSTICAS
  // =========================================================

  const totalProductos =
    productos.length;


  const productosActivos =
    productos.filter(
      (producto) =>
        producto.estado
    ).length;


  const productosInactivos =
    productos.filter(
      (producto) =>
        !producto.estado
    ).length;


  const totalCategorias =
    new Set(
      productos
        .map(
          (producto) =>
            producto.categoria
        )
        .filter(Boolean)
    ).size;


  // =========================================================
  // RENDER
  // =========================================================

  return (

    <div className="productos-page">


      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="productos-header">

        <div className="productos-title">

          <span className="productos-eyebrow">
            ADMINISTRACIÓN
          </span>


          <h1>
            Catálogo de Productos
          </h1>


          <p>
            Gestiona los artículos,
            categorías y precios del bar.
          </p>

        </div>


        <button
          type="button"
          className="nuevo-producto-btn"
          onClick={
            mostrarFormulario
              ? cerrarFormulario
              : abrirFormularioNuevo
          }
        >

          <span className="btn-plus">

            {mostrarFormulario
              ? "×"
              : "+"}

          </span>


          {mostrarFormulario
            ? "Cerrar"
            : "Nuevo producto"}

        </button>

      </header>


      {/* =====================================================
          ALERTA ERROR
      ===================================================== */}

      {error && (

        <div className="producto-alerta alerta-error">

          <span className="alerta-icon">
            !
          </span>


          <span>
            {error}
          </span>


          <button
            type="button"
            onClick={() =>
              setError("")
            }
          >
            ×
          </button>

        </div>

      )}


      {/* =====================================================
          ALERTA ÉXITO
      ===================================================== */}

      {exito && (

        <div className="producto-alerta alerta-exito">

          <span className="alerta-icon">
            ✓
          </span>


          <span>
            {exito}
          </span>


          <button
            type="button"
            onClick={() =>
              setExito("")
            }
          >
            ×
          </button>

        </div>

      )}


      {/* =====================================================
          ESTADÍSTICAS
      ===================================================== */}

      <section className="productos-stats">


        <article className="stat-card">

          <div className="stat-icon stat-total">

            <i className="fa-solid fa-cubes"></i>

          </div>


          <div>

            <strong>
              {totalProductos}
            </strong>

            <span>
              Productos registrados
            </span>

          </div>

        </article>


        <article className="stat-card">

          <div className="stat-icon stat-active">

            <i className="fa-solid fa-circle-check"></i>

          </div>


          <div>

            <strong>
              {productosActivos}
            </strong>

            <span>
              Productos activos
            </span>

          </div>

        </article>


        <article className="stat-card">

          <div className="stat-icon stat-inactive">

            <i className="fa-solid fa-circle-xmark"></i>

          </div>


          <div>

            <strong>
              {productosInactivos}
            </strong>

            <span>
              Productos inactivos
            </span>

          </div>

        </article>


        <article className="stat-card">

          <div className="stat-icon stat-category">

            <i className="fa-solid fa-tags"></i>

          </div>


          <div>

            <strong>
              {totalCategorias}
            </strong>

            <span>
              Categorías
            </span>

          </div>

        </article>


      </section>


      {/* =====================================================
          FILTROS
      ===================================================== */}

      <section className="productos-filters">


        {/* BUSCADOR */}

        <div className="producto-search">

          <i className="fa-solid fa-magnifying-glass"></i>


          <input
            type="text"
            placeholder="Buscar producto, categoría..."
            value={busqueda}
            onChange={(e) =>
              setBusqueda(
                e.target.value
              )
            }
          />

        </div>


        {/* CATEGORÍA */}

        <div className="filter-select">

          <select
            value={filtroCategoria}
            onChange={(e) =>
              setFiltroCategoria(
                e.target.value
              )
            }
          >

            <option value="">
              Todas
            </option>


            {CATEGORIAS.map(
              (item) => (

                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>

              )
            )}

          </select>

        </div>


        {/* ESTADO */}

        <div className="filter-select">

          <select
            value={filtroEstado}
            onChange={(e) =>
              setFiltroEstado(
                e.target.value
              )
            }
          >

            <option value="">
              Todos
            </option>


            <option value="activo">
              Activos
            </option>


            <option value="inactivo">
              Inactivos
            </option>

          </select>

        </div>


        {/* LIMPIAR */}

        <button
          type="button"
          className="limpiar-filtros"
          onClick={
            limpiarFiltros
          }
        >

          <i className="fa-solid fa-rotate-left"></i>

          Limpiar

        </button>

      </section>


      {/* =====================================================
          TABLA
      ===================================================== */}

      <section className="productos-card">


        <div className="productos-card-header">

          <div>

            <h2>
              Inventario de productos
            </h2>


            <p>
              Lista general de artículos
              disponibles en el bar.
            </p>

          </div>


          <span className="resultados-count">

            {productosFiltrados.length}{" "}

            {productosFiltrados.length === 1
              ? "resultado"
              : "resultados"}

          </span>

        </div>


        {productosFiltrados.length > 0 ? (

          <div className="productos-table-wrapper">

            <table className="productos-table">


              <thead>

                <tr>

                  <th>
                    ID
                  </th>

                  <th>
                    Producto
                  </th>

                  <th>
                    Categoría
                  </th>

                  <th>
                    Precio (COP)
                  </th>

                  <th>
                    Estado
                  </th>

                  <th>
                    Acciones
                  </th>

                </tr>

              </thead>


              <tbody>

                {productosFiltrados.map(
                  (producto) => (

                    <tr
                      key={
                        producto.id
                      }
                    >


                      <td className="producto-id">

                        #{producto.id}

                      </td>


                      <td>

                        <div className="producto-info">


                          <div className="producto-icon">

                            {producto.nombre
                              .charAt(0)
                              .toUpperCase()}

                          </div>


                          <span>
                            {
                              producto.nombre
                            }
                          </span>


                        </div>

                      </td>


                      <td>

                        <span className="categoria-badge">

                          {producto.categoria ||
                            "General"}

                        </span>

                      </td>


                      <td className="producto-precio">

                        {formatearPrecio(
                          producto.precio
                        )}

                      </td>


                      <td>

                        <span
                          className={
                            producto.estado
                              ? "estado-badge estado-activo"
                              : "estado-badge estado-inactivo"
                          }
                        >

                          <span className="estado-dot" />


                          {producto.estado
                            ? "Activo"
                            : "Inactivo"}

                        </span>

                      </td>


                      {/* =================================================
                          ACCIONES
                      ================================================= */}

                      <td>

                        <div className="producto-acciones">


                          {/* VER */}

                          <button
                            type="button"
                            className="accion-ver"
                            title="Ver producto"
                            onClick={() =>
                              verProducto(
                                producto
                              )
                            }
                          >

                            <i className="fa-solid fa-eye"></i>

                          </button>


                          {/* EDITAR */}

                          <button
                            type="button"
                            className="accion-editar"
                            title="Editar producto"
                            onClick={() =>
                              editarProducto(
                                producto
                              )
                            }
                          >

                            <i className="fa-solid fa-pen"></i>

                          </button>


                          {/* ELIMINAR */}

                          <button
                            type="button"
                            className="accion-eliminar"
                            title="Eliminar producto"
                            onClick={() =>
                              abrirModalEliminar(
                                producto
                              )
                            }
                          >

                            <i className="fa-solid fa-trash"></i>

                          </button>


                        </div>

                      </td>


                    </tr>

                  )
                )}

              </tbody>


            </table>

          </div>

        ) : (

          <div className="productos-empty">


            <div className="empty-icon">

              <i className="fa-solid fa-box-open"></i>

            </div>


            <h3>
              No hay productos
            </h3>


            <p>
              No se encontraron productos
              con los filtros seleccionados.
            </p>


          </div>

        )}

      </section>


      {/* =====================================================
          FORMULARIO LATERAL
      ===================================================== */}

      {mostrarFormulario && (

        <>

          <div
            className="producto-overlay"
            onClick={
              cerrarFormulario
            }
          />


          <aside className="producto-drawer">


            {/* HEADER */}

            <div className="drawer-header">

              <div>

                <span className="section-label">

                  {editandoId !== null
                    ? "EDITAR REGISTRO"
                    : "NUEVO REGISTRO"}

                </span>


                <h2>

                  {editandoId !== null
                    ? "Editar producto"
                    : "Nuevo producto"}

                </h2>


                <p>

                  {editandoId !== null
                    ? "Actualiza la información del producto."
                    : "Añade un artículo al catálogo."}

                </p>

              </div>


              <button
                type="button"
                className="drawer-close"
                onClick={
                  cerrarFormulario
                }
              >
                ×
              </button>

            </div>


            {/* FORMULARIO */}

            <form
              className="drawer-form"
              onSubmit={
                guardarProducto
              }
            >


              {/* NOMBRE */}

              <div className="form-group">

                <label htmlFor="producto-nombre">

                  Nombre del producto

                  <span>
                    *
                  </span>

                </label>


                <input
                  id="producto-nombre"
                  type="text"
                  placeholder="Ej. Cerveza Águila 330ml"
                  value={nombre}
                  onChange={(e) =>
                    setNombre(
                      e.target.value
                    )
                  }
                  autoComplete="off"
                  required
                />

              </div>


              {/* CATEGORIA */}

              <div className="form-group">

                <label htmlFor="producto-categoria">

                  Categoría

                  <span>
                    *
                  </span>

                </label>


                <select
                  id="producto-categoria"
                  value={categoria}
                  onChange={(e) =>
                    setCategoria(
                      e.target.value
                    )
                  }
                  required
                >

                  {CATEGORIAS.map(
                    (item) => (

                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>

                    )
                  )}

                </select>

              </div>


              {/* PRECIO */}

              <div className="form-group">

                <label htmlFor="producto-precio">

                  Precio (COP)

                  <span>
                    *
                  </span>

                </label>


                <div className="precio-input">

                  <span>
                    $
                  </span>


                  <input
                    id="producto-precio"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="Ej. 5000"
                    value={precio}
                    onChange={(e) =>
                      setPrecio(
                        e.target.value
                      )
                    }
                    required
                  />

                </div>

              </div>


              {/* INFORMACIÓN */}

              <div className="drawer-info">

                <span>
                  <i className="fa-solid fa-circle-info"></i>
                </span>


                <p>

                  El producto quedará
                  registrado en el
                  catálogo del bar.

                </p>

              </div>


              {/* BOTONES */}

              <div className="drawer-actions">


                <button
                  type="button"
                  className="drawer-cancel"
                  onClick={
                    cerrarFormulario
                  }
                >
                  Cancelar
                </button>


                <button
                  type="submit"
                  className="drawer-submit"
                  disabled={loading}
                >

                  {loading ? (

                    <>

                      <span className="button-spinner" />

                      Guardando...

                    </>

                  ) : (

                    <>

                      <span>

                        {editandoId !== null
                          ? "✓"
                          : "+"}

                      </span>


                      {editandoId !== null
                        ? "Guardar cambios"
                        : "Crear producto"}

                    </>

                  )}

                </button>


              </div>


            </form>


          </aside>

        </>

      )}


      {/* =====================================================
          MODAL VER PRODUCTO
      ===================================================== */}

      {mostrarModalProducto &&
        productoSeleccionado && (

        <div
          className="product-modal-overlay"
          onClick={
            cerrarModalProducto
          }
        >

          <div
            className="product-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >


            {/* HEADER */}

            <div className="product-modal-header">

              <div className="product-modal-heading">

                <div className="product-modal-icon">

                  <i className="fa-solid fa-box-open"></i>

                </div>


                <div>

                  <span className="product-modal-label">
                    INFORMACIÓN
                  </span>

                  <h2>
                    Producto
                  </h2>

                </div>

              </div>


              <button
                type="button"
                className="product-modal-close"
                onClick={
                  cerrarModalProducto
                }
              >
                ×
              </button>

            </div>


            {/* PRODUCTO */}

            <div className="product-modal-product">

              <div className="product-modal-product-icon">

                {productoSeleccionado.nombre
                  .charAt(0)
                  .toUpperCase()}

              </div>


              <div>

                <h3>
                  {
                    productoSeleccionado.nombre
                  }
                </h3>

                <span>
                  Producto del catálogo
                </span>

              </div>

            </div>


            {/* INFORMACIÓN */}

            <div className="product-modal-info">


              <div className="product-info-item">

                <span className="product-info-label">
                  Categoría
                </span>

                <strong>
                  {
                    productoSeleccionado.categoria ||
                    "General"
                  }
                </strong>

              </div>


              <div className="product-info-item">

                <span className="product-info-label">
                  Precio
                </span>

                <strong className="product-price">

                  {formatearPrecio(
                    productoSeleccionado.precio
                  )}

                </strong>

              </div>


              <div className="product-info-item">

                <span className="product-info-label">
                  Estado
                </span>


                <span
                  className={
                    productoSeleccionado.estado
                      ? "product-modal-status active"
                      : "product-modal-status inactive"
                  }
                >

                  <span />

                  {
                    productoSeleccionado.estado
                      ? "Activo"
                      : "Inactivo"
                  }

                </span>

              </div>


            </div>


            {/* FOOTER */}

            <div className="product-modal-footer">

              <button
                type="button"
                className="product-modal-button"
                onClick={
                  cerrarModalProducto
                }
              >

                Cerrar

              </button>

            </div>


          </div>

        </div>

      )}


      {/* =====================================================
          MODAL ELIMINAR
      ===================================================== */}

      {mostrarModalEliminar &&
        productoEliminar && (

        <div
          className="delete-modal-overlay"
          onClick={
            cerrarModalEliminar
          }
        >

          <div
            className="delete-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >


            {/* ICONO */}

            <div className="delete-modal-icon">

              <i className="fa-solid fa-trash"></i>

            </div>


            {/* TITULO */}

            <h2>
              ¿Eliminar producto?
            </h2>


            <p>

              ¿Estás seguro de que deseas
              eliminar

              <strong>
                {" "}
                "{productoEliminar.nombre}"
              </strong>

              ?

            </p>


            <span className="delete-modal-warning">

              Esta acción no se puede
              deshacer.

            </span>


            {/* BOTONES */}

            <div className="delete-modal-actions">

              <button
                type="button"
                className="delete-modal-cancel"
                onClick={
                  cerrarModalEliminar
                }
                disabled={eliminando}
              >
                Cancelar
              </button>


              <button
                type="button"
                className="delete-modal-confirm"
                onClick={
                  confirmarEliminar
                }
                disabled={eliminando}
              >

                {eliminando ? (

                  <>
                    <span className="button-spinner" />
                    Eliminando...
                  </>

                ) : (

                  <>
                    <i className="fa-solid fa-trash"></i>
                    Eliminar
                  </>

                )}

              </button>

            </div>


          </div>

        </div>

      )}

    </div>
  );
}