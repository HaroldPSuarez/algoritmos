# app/services/services_operaciones.py

from sqlalchemy.orm import Session
from fastapi import HTTPException
from datetime import datetime
from app.models.models_operaciones import (
    Mesa, Producto, Inventario, MovimientoInventario,
    Pedido, DetallePedido, Pago, Auditoria, EstadoMesa, EstadoPedido
)
from app.schemas.schemas_operaciones import (
    MesaCreate, ProductoCreate, InventarioCreate, PedidoCreate, PagoCreate
)


# ---------- AUDITORÍA ----------
def registrar_auditoria(db: Session, id_usuario: int, accion: str, id_sede: int = None):
    log = Auditoria(id_usuario=id_usuario, accion=accion, id_sede=id_sede)
    db.add(log)
    db.commit()


# ---------- MESAS ----------
def get_mesas(db: Session, id_sede: int = None):
    query = db.query(Mesa)
    if id_sede:
        query = query.filter(Mesa.id_sede == id_sede)
    return query.all()

def create_mesa(db: Session, mesa: MesaCreate):
    db_mesa = Mesa(**mesa.dict())
    db.add(db_mesa)
    db.commit()
    db.refresh(db_mesa)
    return db_mesa


# ---------- PRODUCTOS ----------
def get_productos(db: Session):
    return db.query(Producto).filter(Producto.estado == True).all()

def create_producto(db: Session, producto: ProductoCreate):
    db_producto = Producto(**producto.dict())
    db.add(db_producto)
    db.commit()
    db.refresh(db_producto)
    return db_producto


# ---------- INVENTARIO ----------
def get_inventario_por_sede(db: Session, id_sede: int):
    return db.query(Inventario).filter(Inventario.id_sede == id_sede).all()

def registrar_entrada_inventario(db: Session, data: InventarioCreate, id_usuario: int):
    inv = db.query(Inventario).filter_by(
        id_producto=data.id_producto, id_sede=data.id_sede
    ).first()
    if inv:
        inv.cantidad += data.cantidad
    else:
        inv = Inventario(**data.dict())
        db.add(inv)
    db.commit()
    db.refresh(inv)

    mov = MovimientoInventario(
        id_inventario=inv.id, tipo="entrada",
        cantidad=data.cantidad, motivo="Ingreso de stock", id_usuario=id_usuario
    )
    db.add(mov)
    db.commit()
    return inv


def _descontar_inventario(db: Session, id_producto: int, id_sede: int, cantidad: int, id_usuario: int):
    inv = db.query(Inventario).filter_by(id_producto=id_producto, id_sede=id_sede).first()
    if not inv or inv.cantidad < cantidad:
        raise HTTPException(status_code=400, detail=f"Stock insuficiente para el producto {id_producto}")
    inv.cantidad -= cantidad
    db.add(MovimientoInventario(
        id_inventario=inv.id, tipo="salida",
        cantidad=cantidad, motivo="Descuento por pedido", id_usuario=id_usuario
    ))
    db.commit()


# ---------- PEDIDOS ----------
def crear_pedido(db: Session, pedido: PedidoCreate, id_mesero: int):
    mesa = db.query(Mesa).filter(Mesa.id == pedido.id_mesa).first()
    if not mesa:
        raise HTTPException(status_code=404, detail="Mesa no encontrada")
    if mesa.estado == EstadoMesa.ocupada:
        raise HTTPException(status_code=400, detail="La mesa ya está ocupada")

    total = 0
    detalles_db = []
    for item in pedido.detalles:
        producto = db.query(Producto).filter(Producto.id == item.id_producto).first()
        if not producto:
            raise HTTPException(status_code=404, detail=f"Producto {item.id_producto} no encontrado")
        _descontar_inventario(db, item.id_producto, pedido.id_sede, item.cantidad, id_mesero)
        subtotal = float(producto.precio) * item.cantidad
        total += subtotal
        detalles_db.append(DetallePedido(
            id_producto=item.id_producto,
            cantidad=item.cantidad,
            precio_unitario=producto.precio
        ))

    db_pedido = Pedido(
        id_mesa=pedido.id_mesa, id_mesero=id_mesero, id_sede=pedido.id_sede,
        estado=EstadoPedido.activo, total=total, detalles=detalles_db
    )
    mesa.estado = EstadoMesa.ocupada
    db.add(db_pedido)
    db.commit()
    db.refresh(db_pedido)

    registrar_auditoria(db, id_mesero, f"Creó el pedido #{db_pedido.id}", pedido.id_sede)
    return db_pedido


def get_pedidos_activos(db: Session, id_sede: int = None):
    query = db.query(Pedido).filter(Pedido.estado == EstadoPedido.activo)
    if id_sede:
        query = query.filter(Pedido.id_sede == id_sede)
    return query.all()


def cancelar_pedido(db: Session, id_pedido: int, id_usuario: int):
    pedido = db.query(Pedido).filter(Pedido.id == id_pedido).first()
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    pedido.estado = EstadoPedido.cancelado
    mesa = db.query(Mesa).filter(Mesa.id == pedido.id_mesa).first()
    if mesa:
        mesa.estado = EstadoMesa.disponible
    db.commit()
    registrar_auditoria(db, id_usuario, f"Canceló el pedido #{id_pedido}", pedido.id_sede)
    return pedido


# ---------- PAGOS ----------
def registrar_pago(db: Session, pago: PagoCreate, id_cajero: int):
    pedido = db.query(Pedido).filter(Pedido.id == pago.id_pedido).first()
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    if pedido.estado != EstadoPedido.activo:
        raise HTTPException(status_code=400, detail="El pedido no está activo")

    numero_factura = f"FAC-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}-{pedido.id}"
    db_pago = Pago(
        id_pedido=pago.id_pedido, id_cajero=id_cajero,
        metodo=pago.metodo, monto=pedido.total, numero_factura=numero_factura
    )
    pedido.estado = EstadoPedido.pagado
    mesa = db.query(Mesa).filter(Mesa.id == pedido.id_mesa).first()
    if mesa:
        mesa.estado = EstadoMesa.disponible

    db.add(db_pago)
    db.commit()
    db.refresh(db_pago)
    registrar_auditoria(db, id_cajero, f"Registró pago del pedido #{pedido.id}", pedido.id_sede)
    return db_pago

# AGREGAR a app/services/services_operaciones.py:

from sqlalchemy import func
from app.models.models_operaciones import Auditoria, Pago, Pedido, Inventario, Producto, EstadoPedido


def get_auditoria(db: Session, id_sede: int = None, limit: int = 100):
    query = db.query(Auditoria).order_by(Auditoria.creado_en.desc())
    if id_sede:
        query = query.filter(Auditoria.id_sede == id_sede)
    return query.limit(limit).all()


def reporte_ventas(db: Session, id_sede: int = None, fecha_inicio=None, fecha_fin=None):
    query = db.query(
        Pedido.id_sede,
        func.date(Pago.creado_en).label("fecha"),
        func.count(Pago.id).label("cantidad_ventas"),
        func.sum(Pago.monto).label("total_vendido"),
    ).join(Pedido, Pago.id_pedido == Pedido.id)

    if id_sede:
        query = query.filter(Pedido.id_sede == id_sede)
    if fecha_inicio:
        query = query.filter(Pago.creado_en >= fecha_inicio)
    if fecha_fin:
        query = query.filter(Pago.creado_en <= fecha_fin)

    query = query.group_by(Pedido.id_sede, func.date(Pago.creado_en))
    return query.all()


def reporte_inventario(db: Session, id_sede: int = None):
    query = db.query(
        Inventario.id_sede,
        Producto.nombre,
        Inventario.cantidad,
        Inventario.stock_minimo,
    ).join(Producto, Inventario.id_producto == Producto.id)

    if id_sede:
        query = query.filter(Inventario.id_sede == id_sede)

    return query.all()