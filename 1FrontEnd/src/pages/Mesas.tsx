import { useEffect, useState } from "react";
import api from "../api/axios";
import "./Mesas.css";
interface Mesa {
  id: number;
  numero: number;
  capacidad: number;
  estado: "disponible" | "ocupada";
  id_sede: number;
}
interface Producto {
  id: number;
  nombre: string;
  precio: number;
}
interface CarritoItem {
  id_producto: number;
  cantidad: number;
}
export default function Mesas() {
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [mesaSeleccionada, setMesaSeleccionada] = useState<Mesa | null>(null);
  const [carrito, setCarrito] = useState<CarritoItem[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    cargarMesas();
    cargarProductos();
  }, []);
  const cargarMesas = async () => {
    try {
      const res = await api.get("/mesas");
      setMesas(res.data);
    } catch {
      setError("No se pudieron cargar las mesas");
    }
  };
  const cargarProductos = async () => {
    try {
      const res = await api.get("/productos");
      setProductos(res.data);
    } catch {
      setError("No se pudieron cargar los productos");
    }
  };
  const seleccionarMesa = (mesa: Mesa) => {
    if (mesa.estado === "ocupada") return;
    setMesaSeleccionada(mesa);
    setCarrito([]);
    setError("");
  };
  const agregarProducto = (id_producto: number) => {
    setCarrito((prev) => {
      const existe = prev.find((p) => p.id_producto === id_producto);
      if (existe) {
        return prev.map((p) =>
          p.id_producto === id_producto
            ? { ...p, cantidad: p.cantidad + 1 }
            : p,
        );
      }
      return [...prev, { id_producto, cantidad: 1 }];
    });
  };
  const quitarProducto = (id_producto: number) => {
    setCarrito((prev) => {
      const producto = prev.find((p) => p.id_producto === id_producto);
      if (!producto) return prev;
      if (producto.cantidad === 1) {
        return prev.filter((p) => p.id_producto !== id_producto);
      }
      return prev.map((p) =>
        p.id_producto === id_producto ? { ...p, cantidad: p.cantidad - 1 } : p,
      );
    });
  };
  const eliminarProducto = (id_producto: number) => {
    setCarrito((prev) => prev.filter((p) => p.id_producto !== id_producto));
  };
  const cancelarPedido = () => {
    setMesaSeleccionada(null);
    setCarrito([]);
    setError("");
  };
  const enviarPedido = async () => {
    if (!mesaSeleccionada || carrito.length === 0) {
      return;
    }
    setError("");
    setLoading(true);
    try {
      await api.post("/pedidos", {
        id_mesa: mesaSeleccionada.id,
        id_sede: mesaSeleccionada.id_sede,
        detalles: carrito,
      });
      setCarrito([]);
      setMesaSeleccionada(null);
      await cargarMesas();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Error al crear el pedido");
    } finally {
      setLoading(false);
    }
  };
  const obtenerProducto = (id: number) => productos.find((p) => p.id === id);
  const calcularTotal = () => {
    return carrito.reduce((total, item) => {
      const producto = obtenerProducto(item.id_producto);
      if (!producto) return total;
      return total + producto.precio * item.cantidad;
    }, 0);
  };
  const formatearPrecio = (precio: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(precio);
  };
  const mesasDisponibles = mesas.filter(
    (mesa) => mesa.estado === "disponible",
  ).length;
  const mesasOcupadas = mesas.filter(
    (mesa) => mesa.estado === "ocupada",
  ).length;
  return (
    <div className="mesas-page">
      {" "}
      {/* ===================================================== HEADER ===================================================== */}{" "}
      <div className="mesas-header">
        {" "}
        <div>
          {" "}
          <span className="mesas-eyebrow"> OPERACIÓN </span> <h1>Mesas</h1>{" "}
          <p> Gestiona las mesas y crea pedidos. </p>{" "}
        </div>{" "}
        <div className="mesas-resumen">
          {" "}
          <div className="resumen-item">
            {" "}
            <span className="resumen-dot disponible"></span>{" "}
            <div>
              {" "}
              <strong>{mesasDisponibles}</strong>{" "}
              <small>Disponibles</small>{" "}
            </div>{" "}
          </div>{" "}
          <div className="resumen-divider"></div>{" "}
          <div className="resumen-item">
            {" "}
            <span className="resumen-dot ocupada"></span>{" "}
            <div>
              {" "}
              <strong>{mesasOcupadas}</strong> <small>Ocupadas</small>{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
      {/* ===================================================== MESAS ===================================================== */}{" "}
      <section className="mesas-card">
        {" "}
        <div className="mesas-section-header">
          {" "}
          <div>
            {" "}
            <h2>Estado de las mesas</h2>{" "}
            <p> Selecciona una mesa disponible para crear un pedido. </p>{" "}
          </div>{" "}
          <div className="mesas-leyenda">
            {" "}
            <span>
              {" "}
              <i className="leyenda-disponible"></i> Disponible{" "}
            </span>{" "}
            <span>
              {" "}
              <i className="leyenda-ocupada"></i> Ocupada{" "}
            </span>{" "}
          </div>{" "}
        </div>{" "}
        <div className="mesas-grid">
          {" "}
          {mesas.map((mesa) => {
            const seleccionada = mesaSeleccionada?.id === mesa.id;
            return (
              <button
                key={mesa.id}
                type="button"
                className={`mesa-card ${mesa.estado === "ocupada" ? "mesa-ocupada" : "mesa-disponible"} ${seleccionada ? "mesa-seleccionada" : ""}`}
                onClick={() => seleccionarMesa(mesa)}
                disabled={mesa.estado === "ocupada"}
              >
                {" "}
                <div className="mesa-card-top">
                  {" "}
                  <span className="mesa-status">
                    {" "}
                    {mesa.estado === "ocupada" ? "OCUPADA" : "DISPONIBLE"}{" "}
                  </span>{" "}
                  <span className="mesa-number"> #{mesa.numero} </span>{" "}
                </div>{" "}
                <div className="mesa-icon">
                  {" "}
                  {mesa.estado === "ocupada" ? "●" : "○"}{" "}
                </div>{" "}
                <div className="mesa-info">
                  {" "}
                  <strong> Mesa {mesa.numero} </strong>{" "}
                  <span>
                    {" "}
                    {mesa.capacidad}{" "}
                    {mesa.capacidad === 1 ? "persona" : "personas"}{" "}
                  </span>{" "}
                </div>{" "}
              </button>
            );
          })}{" "}
        </div>{" "}
        {mesas.length === 0 && (
          <div className="mesas-empty">
            {" "}
            <div className="empty-icon"> ○ </div>{" "}
            <h3> No hay mesas registradas </h3>{" "}
            <p> Cuando se creen mesas aparecerán aquí. </p>{" "}
          </div>
        )}{" "}
      </section>{" "}
      {/* ===================================================== PEDIDO ===================================================== */}{" "}
      {mesaSeleccionada && (
        <section className="pedido-card">
          {" "}
          <div className="pedido-header">
            {" "}
            <div>
              {" "}
              <span className="section-label"> NUEVO PEDIDO </span>{" "}
              <h2> Mesa {mesaSeleccionada.numero} </h2>{" "}
              <p>
                {" "}
                {mesaSeleccionada.capacidad}{" "}
                {mesaSeleccionada.capacidad === 1 ? "persona" : "personas"} ·
                Selecciona los productos{" "}
              </p>{" "}
            </div>{" "}
            <button
              type="button"
              className="cerrar-pedido"
              onClick={cancelarPedido}
            >
              {" "}
              ×{" "}
            </button>{" "}
          </div>{" "}
          <div className="pedido-layout">
            {" "}
            {/* PRODUCTOS */}{" "}
            <div className="productos-pedido">
              {" "}
              <div className="pedido-subheader">
                {" "}
                <h3>Productos</h3>{" "}
                <span> {productos.length} disponibles </span>{" "}
              </div>{" "}
              <div className="productos-pedido-grid">
                {" "}
                {productos.map((producto) => {
                  const cantidad =
                    carrito.find((item) => item.id_producto === producto.id)
                      ?.cantidad || 0;
                  return (
                    <button
                      key={producto.id}
                      type="button"
                      className="producto-pedido-card"
                      onClick={() => agregarProducto(producto.id)}
                    >
                      {" "}
                      <div className="producto-pedido-icon">
                        {" "}
                        {producto.nombre.charAt(0).toUpperCase()}{" "}
                      </div>{" "}
                      <div className="producto-pedido-info">
                        {" "}
                        <strong> {producto.nombre} </strong>{" "}
                        <span> {formatearPrecio(producto.precio)} </span>{" "}
                      </div>{" "}
                      {cantidad > 0 && (
                        <span className="producto-cantidad"> {cantidad} </span>
                      )}{" "}
                      <span className="producto-add"> + </span>{" "}
                    </button>
                  );
                })}{" "}
              </div>{" "}
            </div>{" "}
            {/* CARRITO */}{" "}
            <aside className="carrito">
              {" "}
              <div className="carrito-header">
                {" "}
                <div>
                  {" "}
                  <h3>Pedido</h3>{" "}
                  <span>
                    {" "}
                    {carrito.reduce(
                      (total, item) => total + item.cantidad,
                      0,
                    )}{" "}
                    productos{" "}
                  </span>{" "}
                </div>{" "}
                {carrito.length > 0 && (
                  <button
                    type="button"
                    className="limpiar-carrito"
                    onClick={() => setCarrito([])}
                  >
                    {" "}
                    Limpiar{" "}
                  </button>
                )}{" "}
              </div>{" "}
              {carrito.length === 0 ? (
                <div className="carrito-vacio">
                  {" "}
                  <div className="carrito-vacio-icon"> + </div>{" "}
                  <strong> Pedido vacío </strong>{" "}
                  <span>
                    {" "}
                    Selecciona productos para agregarlos al pedido.{" "}
                  </span>{" "}
                </div>
              ) : (
                <>
                  {" "}
                  <div className="carrito-items">
                    {" "}
                    {carrito.map((item) => {
                      const producto = obtenerProducto(item.id_producto);
                      if (!producto) return null;
                      return (
                        <div key={item.id_producto} className="carrito-item">
                          {" "}
                          <div className="carrito-item-info">
                            {" "}
                            <strong> {producto.nombre} </strong>{" "}
                            <span>
                              {" "}
                              {formatearPrecio(
                                producto.precio * item.cantidad,
                              )}{" "}
                            </span>{" "}
                          </div>{" "}
                          <div className="cantidad-control">
                            {" "}
                            <button
                              type="button"
                              onClick={() => quitarProducto(item.id_producto)}
                            >
                              {" "}
                              −{" "}
                            </button>{" "}
                            <span> {item.cantidad} </span>{" "}
                            <button
                              type="button"
                              onClick={() => agregarProducto(item.id_producto)}
                            >
                              {" "}
                              +{" "}
                            </button>{" "}
                          </div>{" "}
                          <button
                            type="button"
                            className="eliminar-item"
                            onClick={() => eliminarProducto(item.id_producto)}
                          >
                            {" "}
                            ×{" "}
                          </button>{" "}
                        </div>
                      );
                    })}{" "}
                  </div>{" "}
                  <div className="carrito-total">
                    {" "}
                    <span>Total</span>{" "}
                    <strong> {formatearPrecio(calcularTotal())} </strong>{" "}
                  </div>{" "}
                  {error && (
                    <div className="pedido-error">
                      {" "}
                      <span>!</span> {error}{" "}
                    </div>
                  )}{" "}
                  <button
                    type="button"
                    className="confirmar-pedido"
                    onClick={enviarPedido}
                    disabled={loading}
                  >
                    {" "}
                    {loading ? (
                      <>
                        {" "}
                        <span className="button-spinner"></span> Creando
                        pedido...{" "}
                      </>
                    ) : (
                      <> Confirmar pedido </>
                    )}{" "}
                  </button>{" "}
                  <button
                    type="button"
                    className="cancelar-pedido"
                    onClick={cancelarPedido}
                  >
                    {" "}
                    Cancelar{" "}
                  </button>{" "}
                </>
              )}{" "}
            </aside>{" "}
          </div>{" "}
        </section>
      )}{" "}
    </div>
  );
}
