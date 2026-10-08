from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    ForeignKey,
    DateTime,
    Enum,
    DECIMAL,
    UniqueConstraint
)
from sqlalchemy.orm import relationship
from datetime import datetime
from app.config import Base
import enum


# =========================================================
# ENUMS
# =========================================================

class EstadoMesa(str, enum.Enum):
    disponible = "disponible"
    ocupada = "ocupada"


class EstadoPedido(str, enum.Enum):
    activo = "activo"
    pagado = "pagado"
    cancelado = "cancelado"


class MetodoPago(str, enum.Enum):
    efectivo = "efectivo"
    tarjeta_debito = "tarjeta_debito"
    tarjeta_credito = "tarjeta_credito"


# =========================================================
# MESAS
# =========================================================

class Mesa(Base):
    __tablename__ = "mesas"

    id = Column(Integer, primary_key=True, index=True)

    numero = Column(
        Integer,
        nullable=False
    )

    capacidad = Column(
        Integer,
        default=4
    )

    estado = Column(
        Enum(EstadoMesa),
        default=EstadoMesa.disponible
    )

    id_sede = Column(
        Integer,
        ForeignKey("sedes.id"),
        nullable=False
    )

    sede = relationship("Sede")

    pedidos = relationship(
        "Pedido",
        back_populates="mesa"
    )

    # Una mesa puede repetir su número en otra sede,
    # pero no puede repetirse dentro de la misma sede.
    __table_args__ = (
        UniqueConstraint(
            "id_sede",
            "numero",
            name="uq_mesa_sede"
        ),
    )


# =========================================================
# PRODUCTOS
# =========================================================

class Producto(Base):
    __tablename__ = "productos"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    nombre = Column(
        String(100),
        nullable=False
    )

    categoria = Column(
        String(50)
    )

    precio = Column(
        DECIMAL(10, 2),
        nullable=False
    )

    estado = Column(
        Boolean,
        default=True
    )


# =========================================================
# INVENTARIO
# =========================================================

class Inventario(Base):
    __tablename__ = "inventario"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    id_producto = Column(
        Integer,
        ForeignKey("productos.id"),
        nullable=False
    )

    id_sede = Column(
        Integer,
        ForeignKey("sedes.id"),
        nullable=False
    )

    cantidad = Column(
        Integer,
        nullable=False,
        default=0
    )

    stock_minimo = Column(
        Integer,
        default=0
    )

    actualizado_en = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    producto = relationship("Producto")

    sede = relationship("Sede")

    __table_args__ = (
        UniqueConstraint(
            "id_producto",
            "id_sede",
            name="uq_producto_sede"
        ),
    )


# =========================================================
# MOVIMIENTOS DE INVENTARIO
# =========================================================

class MovimientoInventario(Base):
    __tablename__ = "movimientos_inventario"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    id_inventario = Column(
        Integer,
        ForeignKey("inventario.id"),
        nullable=False
    )

    tipo = Column(
        Enum(
            "entrada",
            "salida",
            name="tipo_movimiento"
        ),
        nullable=False
    )

    cantidad = Column(
        Integer,
        nullable=False
    )

    motivo = Column(
        String(200)
    )

    id_usuario = Column(
        Integer,
        ForeignKey("usuarios.id"),
        nullable=False
    )

    creado_en = Column(
        DateTime,
        default=datetime.utcnow
    )


# =========================================================
# PEDIDOS
# =========================================================

class Pedido(Base):
    __tablename__ = "pedidos"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    id_mesa = Column(
        Integer,
        ForeignKey("mesas.id"),
        nullable=False
    )

    id_mesero = Column(
        Integer,
        ForeignKey("usuarios.id"),
        nullable=False
    )

    id_sede = Column(
        Integer,
        ForeignKey("sedes.id"),
        nullable=False
    )

    estado = Column(
        Enum(EstadoPedido),
        default=EstadoPedido.activo
    )

    total = Column(
        DECIMAL(10, 2),
        default=0
    )

    creado_en = Column(
        DateTime,
        default=datetime.utcnow
    )

    mesa = relationship(
        "Mesa",
        back_populates="pedidos"
    )

    detalles = relationship(
        "DetallePedido",
        back_populates="pedido",
        cascade="all, delete-orphan"
    )
    id_mesa = Column(
    Integer,
    ForeignKey("mesas.id"),
    nullable=True
)


# =========================================================
# DETALLE DE PEDIDO
# =========================================================

class DetallePedido(Base):
    __tablename__ = "detalle_pedidos"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    id_pedido = Column(
        Integer,
        ForeignKey("pedidos.id"),
        nullable=False
    )

    id_producto = Column(
        Integer,
        ForeignKey("productos.id"),
        nullable=False
    )

    cantidad = Column(
        Integer,
        nullable=False
    )

    precio_unitario = Column(
        DECIMAL(10, 2),
        nullable=False
    )

    pedido = relationship(
        "Pedido",
        back_populates="detalles"
    )

    producto = relationship("Producto")


# =========================================================
# PAGOS
# =========================================================

class Pago(Base):
    __tablename__ = "pagos"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    id_pedido = Column(
        Integer,
        ForeignKey("pedidos.id"),
        nullable=False
    )

    id_cajero = Column(
        Integer,
        ForeignKey("usuarios.id"),
        nullable=False
    )

    metodo = Column(
        Enum(MetodoPago),
        nullable=False
    )

    monto = Column(
        DECIMAL(10, 2),
        nullable=False
    )

    numero_factura = Column(
        String(30),
        unique=True
    )

    creado_en = Column(
        DateTime,
        default=datetime.utcnow
    )


# =========================================================
# AUDITORÍA
# =========================================================

class Auditoria(Base):
    __tablename__ = "auditoria"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    id_usuario = Column(
        Integer,
        ForeignKey("usuarios.id"),
        nullable=False
    )

    accion = Column(
        String(150),
        nullable=False
    )

    id_sede = Column(
        Integer,
        ForeignKey("sedes.id"),
        nullable=True
    )

    creado_en = Column(
        DateTime,
        default=datetime.utcnow
    )