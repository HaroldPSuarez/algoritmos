# app/schemas/schemas_operaciones.py

from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from decimal import Decimal


# ---------- MESAS ----------
class MesaBase(BaseModel):
    numero: int
    capacidad: int = 4
    id_sede: int

class MesaCreate(MesaBase):
    pass

class MesaResponse(MesaBase):
    id: int
    estado: str
    class Config:
        from_attributes = True


# ---------- PRODUCTOS ----------
class ProductoBase(BaseModel):
    nombre: str
    categoria: Optional[str] = None
    precio: Decimal

class ProductoCreate(ProductoBase):
    pass

class ProductoResponse(ProductoBase):
    id: int
    estado: bool
    class Config:
        from_attributes = True


# ---------- INVENTARIO ----------
class InventarioCreate(BaseModel):
    id_producto: int
    id_sede: int
    cantidad: int
    stock_minimo: int = 0

class InventarioResponse(BaseModel):
    id: int
    id_producto: int
    id_sede: int
    cantidad: int
    stock_minimo: int
    class Config:
        from_attributes = True

class MovimientoInventarioCreate(BaseModel):
    id_inventario: int
    tipo: str  # "entrada" | "salida"
    cantidad: int
    motivo: Optional[str] = None


# ---------- PEDIDOS ----------
class DetallePedidoCreate(BaseModel):
    id_producto: int
    cantidad: int

class PedidoCreate(BaseModel):
    id_mesa: int
    id_sede: int
    detalles: List[DetallePedidoCreate]

class DetallePedidoResponse(BaseModel):
    id: int
    id_producto: int
    cantidad: int
    precio_unitario: Decimal
    class Config:
        from_attributes = True

class PedidoResponse(BaseModel):
    id: int
    id_mesa: int
    id_mesero: int
    id_sede: int
    estado: str
    total: Decimal
    creado_en: datetime
    detalles: List[DetallePedidoResponse] = []
    class Config:
        from_attributes = True


# ---------- PAGOS ----------
class PagoCreate(BaseModel):
    id_pedido: int
    metodo: str  # "efectivo" | "tarjeta_debito" | "tarjeta_credito"

class PagoResponse(BaseModel):
    id: int
    id_pedido: int
    id_cajero: int
    metodo: str
    monto: Decimal
    numero_factura: str
    creado_en: datetime
    class Config:
        from_attributes = True