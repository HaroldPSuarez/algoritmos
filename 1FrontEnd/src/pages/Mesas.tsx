
import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent, ChangeEvent } from "react";
import {
  faChevronLeft,
  faChevronRight,
  faEye,
  faMagnifyingGlass,
  faRotate,
  faTrash,
  faXmark,
  faUtensils,
  faUsers,
  faClipboardList,
  faBuilding,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import api from "../api/axios";
import "./MesasMesero.css";

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

export default function MesasMesero() {
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [pedidosActivos, setPedidosActivos] = useState<PedidoActivo[]>([]);

  const [idSedeSeleccionada, setIdSedeSeleccionada] = useState<number | "">("");
  const [busqueda, setBusqueda] = useState("");
  const [pagina, setPagina] = useState(1);
  const mesasPorPagina = 8;

  const [mesaSeleccionada, setMesaSeleccionada] = useState<Mesa | null>(null);
  const [pedidoActualMesa, setPedidoActualMesa] = useState<PedidoActivo | null>(null);
  const [itemsPedido, setItemsPedido] = useState<ItemPedido[]>([]);
  const [idProductoActual, setIdProductoActual] = useState<number | "">("");
  const [cantidadActual, setCantidadActual] = useState("1");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");

  const nombreSede = useCallback(
    (id: number) => sedes.find((sede) => sede.id === id)?.nombre || "Sin sede",
    [sedes]
  );

  const obtenerEstado = (estado: string): "Disponible" | "Ocupada" => {
    const normalizado = estado?.toLowerCase().trim();
    return normalizado === "ocupada" || normalizado === "ocupado"
      ? "Ocupada"
      : "Disponible";
  };

  const cargarSedes = useCallback(async () => {
    try {
      const res = await api.get("/listar_sedes");
      setSedes(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error al cargar sedes:", err);
      setError("No fue posible cargar las sedes.");
    }
  }, []);

  const cargarProductos = useCallback(async () => {
    try {
      const res = await api.get("/productos");
      setProductos(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error al cargar productos:", err);
    }
  }, []);

  const cargarMesas = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      let mesasCargadas: Mesa[] = [];
      let pedidosCargados: PedidoActivo[] = [];

      if (idSedeSeleccionada !== "") {
        const [resMesas, resPedidos] = await Promise.all([
          api.get(`/mesas?id_sede=${idSedeSeleccionada}`),
          api.get(`/pedidos/activos?id_sede=${idSedeSeleccionada}`),
        ]);

        mesasCargadas = Array.isArray(resMesas.data) ? resMesas.data : [];
        pedidosCargados = Array.isArray(resPedidos.data) ? resPedidos.data : [];
      } else if (sedes.length > 0) {
        const resultados = await Promise.all(
          sedes.map(async (sede) => {
            try {
              const [resMesas, resPedidos] = await Promise.all([
                api.get(`/mesas?id_sede=${sede.id}`),
                api.get(`/pedidos/activos?id_sede=${sede.id}`),
              ]);

              return {
                mesas: Array.isArray(resMesas.data) ? resMesas.data : [],
                pedidos: Array.isArray(resPedidos.data) ? resPedidos.data : [],
              };
            } catch (err) {
              console.error(`Error cargando sede ${sede.id}:`, err);
              return { mesas: [], pedidos: [] };
            }
          })
        );

        mesasCargadas = resultados.flatMap((resultado) => resultado.mesas);
        pedidosCargados = resultados.flatMap((resultado) => resultado.pedidos);
      }

      setMesas(mesasCargadas);
      setPedidosActivos(pedidosCargados);
    } catch (err) {
      console.error("Error cargando mesas:", err);
      setError("No fue posible cargar la información de las mesas.");
    } finally {
      setLoading(false);
    }
  }, [idSedeSeleccionada, sedes]);

  useEffect(() => {
    void cargarSedes();
    void cargarProductos();
  }, [cargarSedes, cargarProductos]);

  useEffect(() => {
    if (sedes.length > 0 || idSedeSeleccionada !== "") {
      void cargarMesas();
    }
  }, [cargarMesas, sedes.length, idSedeSeleccionada]);

  const mesasFiltradas = useMemo(() => {
    const texto = busqueda.toLowerCase().trim();

    return mesas.filter((mesa) => {
      const sede = nombreSede(mesa.id_sede);
      const estado = obtenerEstado(mesa.estado);

      const coincideTexto =
        texto === "" ||
        `mesa ${mesa.numero}`.toLowerCase().includes(texto) ||
        sede.toLowerCase().includes(texto) ||
        estado.toLowerCase().includes(texto);

      return coincideTexto;
    });
  }, [mesas, busqueda, nombreSede]);

  const totalMesas = mesasFiltradas.length;
  const mesasDisponibles = mesasFiltradas.filter(
    (mesa) => obtenerEstado(mesa.estado) === "Disponible"
  ).length;
  const mesasOcupadas = mesasFiltradas.filter(
    (mesa) => obtenerEstado(mesa.estado) === "Ocupada"
  ).length;

  const totalPaginas = Math.ceil(totalMesas / mesasPorPagina);
  const indiceInicial = (pagina - 1) * mesasPorPagina;
  const mesasPagina = mesasFiltradas.slice(
    indiceInicial,
    indiceInicial + mesasPorPagina
  );

  const cambiarSede = (e: ChangeEvent<HTMLSelectElement>) => {
    setIdSedeSeleccionada(e.target.value === "" ? "" : Number(e.target.value));
    setPagina(1);
  };

  const cambiarBusqueda = (e: ChangeEvent<HTMLInputElement>) => {
    setBusqueda(e.target.value);
    setPagina(1);
  };

  const abrirMesa = (mesa: Mesa) => {
    setError("");
    setExito("");
    setMesaSeleccionada(mesa);
    setItemsPedido([]);
    setIdProductoActual("");
    setCantidadActual("1");

    const pedido = pedidosActivos.find((item) => item.id_mesa === mesa.id);
    setPedidoActualMesa(pedido || null);
  };

  const cerrarModal = () => {
    setMesaSeleccionada(null);
    setPedidoActualMesa(null);
    setItemsPedido([]);
    setIdProductoActual("");
    setCantidadActual("1");
    setError("");
  };

  const nombreProducto = (id: number) =>
    productos.find((producto) => producto.id === id)?.nombre || `Producto #${id}`;

  const precioProducto = (id: number) =>
    productos.find((producto) => producto.id === id)?.precio || 0;

  const agregarItemLocal = (e: FormEvent) => {
    e.preventDefault();

    if (idProductoActual === "" || !Number.isInteger(Number(cantidadActual)) ||
        Number(cantidadActual) <= 0) {
      setError("Selecciona un producto e indica una cantidad válida.");
      return;
    }

    const idProducto = Number(idProductoActual);
    const cantidad = Number(cantidadActual);

    setItemsPedido((actuales) => {
      const existente = actuales.find((item) => item.id_producto === idProducto);

      return existente
        ? actuales.map((item) =>
            item.id_producto === idProducto
              ? { ...item, cantidad: item.cantidad + cantidad }
              : item
          )
        : [...actuales, { id_producto: idProducto, cantidad }];
    });

    setError("");
    setIdProductoActual("");
    setCantidadActual("1");
  };

  const removerItemLocal = (idProducto: number) => {
    setItemsPedido((actuales) =>
      actuales.filter((item) => item.id_producto !== idProducto)
    );
  };

  const calcularTotalLocal = () =>
    itemsPedido.reduce(
      (total, item) => total + precioProducto(item.id_producto) * item.cantidad,
      0
    );

  const confirmarNuevoPedido = async () => {
    if (!mesaSeleccionada || itemsPedido.length === 0) {
      setError("Debes agregar al menos un producto.");
      return;
    }

    setLoading(true);
    setError("");
    setExito("");

    try {
      await api.post("/pedidos", {
        id_mesa: mesaSeleccionada.id,
        id_sede: mesaSeleccionada.id_sede,
        detalles: itemsPedido,
      });

      setExito(`Pedido registrado correctamente para la Mesa #${mesaSeleccionada.numero}.`);
      cerrarModal();
      await cargarMesas();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Error al registrar el pedido.");
    } finally {
      setLoading(false);
    }
  };

  const agregarProductosAPedidoExistente = async () => {
    if (!mesaSeleccionada || itemsPedido.length === 0) {
      setError("Debes agregar al menos un producto.");
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

      setExito("Productos añadidos al pedido correctamente.");
      setItemsPedido([]);
      await cargarMesas();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Error al añadir productos.");
    } finally {
      setLoading(false);
    }
  };

  const quitarDetallePedido = async (idDetalle: number) => {
    if (!window.confirm("¿Deseas quitar este producto del pedido?")) return;

    setLoading(true);
    setError("");
    setExito("");

    try {
      const res = await api.delete(`/pedidos/detalles/${idDetalle}`);
      setExito("Producto retirado correctamente.");

      if (!res.data?.detalles || res.data.detalles.length === 0) {
        setPedidoActualMesa(null);
      } else {
        setPedidoActualMesa(res.data);
      }

      await cargarMesas();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "No fue posible retirar el producto.");
    } finally {
      setLoading(false);
    }
  };

  const cancelarPedidoActual = async (idPedido: number) => {
    if (!window.confirm("¿Deseas cancelar este pedido completo?")) return;

    setLoading(true);
    setError("");
    setExito("");

    try {
      await api.put(`/pedidos/${idPedido}/cancelar`);
      setExito("Pedido cancelado correctamente.");
      setPedidoActualMesa(null);
      setMesaSeleccionada(null);
      await cargarMesas();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "No fue posible cancelar el pedido.");
    } finally {
      setLoading(false);
    }
  };

  const formatoPrecio = (valor: number) =>
    Number(valor || 0).toLocaleString("es-CO");

  return (
    <main className="mesero-page">
      <header className="mesero-header">
        <div>
          <span className="mesero-eyebrow">POLA Y PUNTO · SERVICIO</span>
          <h1>Gestión de Mesas</h1>
          <p>Consulta las mesas y administra los pedidos de cada sede.</p>
        </div>
        <div className="mesero-counter">
          <strong>{totalMesas}</strong>
          <span>Mesas en vista</span>
        </div>
      </header>

      {error && (
        <div className="mesero-alert mesero-alert-error" role="alert">
          <span>{error}</span>
          <button type="button" aria-label="Cerrar mensaje" onClick={() => setError("")}>
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>
      )}

      {exito && (
        <div className="mesero-alert mesero-alert-success" role="status">
          <span>{exito}</span>
          <button type="button" aria-label="Cerrar mensaje" onClick={() => setExito("")}>
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>
      )}

      <section className="mesero-stats">
        <article className="mesero-stat">
          <div className="mesero-stat-icon"><FontAwesomeIcon icon={faUtensils} /></div>
          <div><span>Total de mesas</span><strong>{totalMesas}</strong></div>
        </article>
        <article className="mesero-stat">
          <div className="mesero-stat-icon icon-green"><span className="mesero-dot" /></div>
          <div><span>Disponibles</span><strong>{mesasDisponibles}</strong></div>
        </article>
        <article className="mesero-stat">
          <div className="mesero-stat-icon icon-red"><span className="mesero-dot" /></div>
          <div><span>Ocupadas</span><strong>{mesasOcupadas}</strong></div>
        </article>
        <article className="mesero-stat">
          <div className="mesero-stat-icon icon-gold"><FontAwesomeIcon icon={faBuilding} /></div>
          <div><span>Sedes</span><strong>{sedes.length}</strong></div>
        </article>
      </section>

      <section className="mesero-toolbar">
        <div className="mesero-field">
          <label htmlFor="mesero-sede">Filtrar por sede</label>
          <select id="mesero-sede" value={idSedeSeleccionada} onChange={cambiarSede}>
            <option value="">Todas las sedes</option>
            {sedes.map((sede) => (
              <option key={sede.id} value={sede.id}>{sede.nombre}</option>
            ))}
          </select>
        </div>

        <div className="mesero-search">
          <FontAwesomeIcon icon={faMagnifyingGlass} />
          <input
            aria-label="Buscar mesa"
            type="search"
            placeholder="Buscar por mesa, sede o estado..."
            value={busqueda}
            onChange={cambiarBusqueda}
          />
        </div>

        <button className="mesero-refresh" type="button" onClick={() => void cargarMesas()} disabled={loading}>
          <FontAwesomeIcon icon={faRotate} spin={loading} />
          Actualizar
        </button>
      </section>

      <section className="mesero-list-section">
        <div className="mesero-section-heading">
          <div>
            <h2>Mesas registradas</h2>
            <p>Selecciona una mesa para consultar o gestionar su pedido.</p>
          </div>
          <span className="mesero-result-count">{totalMesas} mesas</span>
        </div>

        {loading && mesas.length === 0 ? (
          <div className="mesero-empty">
            <FontAwesomeIcon icon={faRotate} spin />
            <p>Cargando mesas...</p>
          </div>
        ) : mesasPagina.length > 0 ? (
          <div className="mesero-grid">
            {mesasPagina.map((mesa) => {
              const estado = obtenerEstado(mesa.estado);
              const pedido = pedidosActivos.find((item) => item.id_mesa === mesa.id);

              return (
                <article className="mesero-mesa-card" key={mesa.id}>
                  <div className="mesero-card-top">
                    <div className="mesero-table-number">{mesa.numero}</div>
                    <span className={`mesero-status ${estado === "Ocupada" ? "is-occupied" : "is-available"}`}>
                      <span />
                      {estado}
                    </span>
                  </div>

                  <div className="mesero-card-title">
                    <h3>Mesa {mesa.numero}</h3>
                    <span>ID #{mesa.id}</span>
                  </div>

                  <div className="mesero-card-details">
                    <div>
                      <FontAwesomeIcon icon={faUsers} />
                      <span>{mesa.capacidad} {mesa.capacidad === 1 ? "persona" : "personas"}</span>
                    </div>
                    <div>
                      <FontAwesomeIcon icon={faBuilding} />
                      <span>{nombreSede(mesa.id_sede)}</span>
                    </div>
                  </div>

                  {pedido && (
                    <div className="mesero-order-indicator">
                      <FontAwesomeIcon icon={faClipboardList} />
                      <span>Pedido #{pedido.id}</span>
                      <strong>${formatoPrecio(pedido.total)}</strong>
                    </div>
                  )}

                  <button type="button" className="mesero-open-button" onClick={() => abrirMesa(mesa)}>
                    <FontAwesomeIcon icon={faEye} />
                    {pedido ? "Ver pedido" : "Abrir mesa"}
                  </button>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="mesero-empty">
            <div className="mesero-empty-icon"><FontAwesomeIcon icon={faUtensils} /></div>
            <h3>No hay mesas para mostrar</h3>
            <p>Prueba con otra sede o cambia el texto de búsqueda.</p>
          </div>
        )}

        <footer className="mesero-pagination">
          <span>
            {totalMesas === 0 ? 0 : indiceInicial + 1}–{Math.min(indiceInicial + mesasPorPagina, totalMesas)} de {totalMesas} mesas
          </span>
          <div>
            <button type="button" aria-label="Página anterior" disabled={pagina <= 1} onClick={() => setPagina((p) => Math.max(1, p - 1))}>
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
            <span>Página {totalPaginas === 0 ? 0 : pagina} de {totalPaginas}</span>
            <button type="button" aria-label="Página siguiente" disabled={pagina >= totalPaginas} onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}>
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>
        </footer>
      </section>

      {mesaSeleccionada && (
        <div className="mesero-modal-overlay" onClick={cerrarModal}>
          <section className="mesero-modal" role="dialog" aria-modal="true" aria-labelledby="mesero-modal-title" onClick={(e) => e.stopPropagation()}>
            <header className="mesero-modal-header">
              <div>
                <span>GESTIÓN DE MESA</span>
                <h2 id="mesero-modal-title">Mesa #{mesaSeleccionada.numero}</h2>
                <p>{nombreSede(mesaSeleccionada.id_sede)} · {mesaSeleccionada.capacidad} personas</p>
              </div>
              <button type="button" aria-label="Cerrar modal" onClick={cerrarModal}>
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </header>

            <div className="mesero-modal-body">
              {pedidoActualMesa ? (
                <>
                  <div className="mesero-order-summary">
                    <div><span>Pedido actual</span><strong>#{pedidoActualMesa.id}</strong></div>
                    <div><span>Total del pedido</span><strong>${formatoPrecio(pedidoActualMesa.total)}</strong></div>
                  </div>

                  <h3>Productos solicitados</h3>
                  <div className="mesero-order-details">
                    {pedidoActualMesa.detalles?.length ? pedidoActualMesa.detalles.map((detalle) => (
                      <div className="mesero-order-item" key={detalle.id}>
                        <div>
                          <strong>{nombreProducto(detalle.id_producto)}</strong>
                          <span>{detalle.cantidad} × ${formatoPrecio(detalle.precio_unitario)}</span>
                        </div>
                        <strong>${formatoPrecio(detalle.cantidad * detalle.precio_unitario)}</strong>
                        <button type="button" aria-label="Quitar producto" disabled={loading} onClick={() => void quitarDetallePedido(detalle.id)}>
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    )) : <p className="mesero-no-items">No hay productos en este pedido.</p>}
                  </div>

                  <form className="mesero-product-form" onSubmit={agregarItemLocal}>
                    <div>
                      <label htmlFor="producto-existente">Producto</label>
                      <select id="producto-existente" value={idProductoActual} onChange={(e) => setIdProductoActual(e.target.value === "" ? "" : Number(e.target.value))} required>
                        <option value="">Selecciona un producto</option>
                        {productos.map((producto) => (
                          <option key={producto.id} value={producto.id}>{producto.nombre} — ${formatoPrecio(producto.precio)}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="cantidad-existente">Cantidad</label>
                      <input id="cantidad-existente" type="number" min="1" step="1" value={cantidadActual} onChange={(e) => setCantidadActual(e.target.value)} required />
                    </div>
                    <button type="submit" className="mesero-add-button"><FontAwesomeIcon icon={faPlus} /> Agregar</button>
                  </form>

                  {itemsPedido.length > 0 && (
                    <div className="mesero-pending">
                      <h3>Nuevos productos</h3>
                      {itemsPedido.map((item) => (
                        <div className="mesero-pending-item" key={item.id_producto}>
                          <span>{nombreProducto(item.id_producto)}</span>
                          <strong>×{item.cantidad}</strong>
                          <button type="button" aria-label="Quitar producto pendiente" onClick={() => removerItemLocal(item.id_producto)}>
                            <FontAwesomeIcon icon={faXmark} />
                          </button>
                        </div>
                      ))}
                      <div className="mesero-pending-total"><span>Total adicional</span><strong>${formatoPrecio(calcularTotalLocal())}</strong></div>
                      <button type="button" className="mesero-confirm-button" disabled={loading} onClick={() => void agregarProductosAPedidoExistente()}>
                        {loading ? "Procesando..." : "Agregar al pedido"}
                      </button>
                    </div>
                  )}

                  <button type="button" className="mesero-cancel-order" disabled={loading} onClick={() => void cancelarPedidoActual(pedidoActualMesa.id)}>
                    Cancelar pedido
                  </button>
                </>
              ) : (
                <>
                  <div className="mesero-available-message">
                    <span>✓</span>
                    <h3>Mesa disponible</h3>
                    <p>Agrega productos para registrar un nuevo pedido.</p>
                  </div>

                  <form className="mesero-product-form" onSubmit={agregarItemLocal}>
                    <div>
                      <label htmlFor="producto-nuevo">Producto</label>
                      <select id="producto-nuevo" value={idProductoActual} onChange={(e) => setIdProductoActual(e.target.value === "" ? "" : Number(e.target.value))} required>
                        <option value="">Selecciona un producto</option>
                        {productos.map((producto) => (
                          <option key={producto.id} value={producto.id}>{producto.nombre} — ${formatoPrecio(producto.precio)}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="cantidad-nueva">Cantidad</label>
                      <input id="cantidad-nueva" type="number" min="1" step="1" value={cantidadActual} onChange={(e) => setCantidadActual(e.target.value)} required />
                    </div>
                    <button type="submit" className="mesero-add-button"><FontAwesomeIcon icon={faPlus} /> Agregar</button>
                  </form>

                  {itemsPedido.length > 0 && (
                    <div className="mesero-pending">
                      <h3>Productos del pedido</h3>
                      {itemsPedido.map((item) => (
                        <div className="mesero-pending-item" key={item.id_producto}>
                          <span>{nombreProducto(item.id_producto)}</span>
                          <strong>×{item.cantidad}</strong>
                          <button type="button" aria-label="Quitar producto pendiente" onClick={() => removerItemLocal(item.id_producto)}>
                            <FontAwesomeIcon icon={faXmark} />
                          </button>
                        </div>
                      ))}
                      <div className="mesero-pending-total"><span>Total</span><strong>${formatoPrecio(calcularTotalLocal())}</strong></div>
                      <button type="button" className="mesero-confirm-button" disabled={loading} onClick={() => void confirmarNuevoPedido()}>
                        {loading ? "Registrando..." : "Registrar pedido"}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
