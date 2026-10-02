
import uvicorn

from datetime import date
from typing import List, Optional

from fastapi import (
    FastAPI,
    Depends,
    HTTPException,
    status
)

from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.config import (
    get_db,
    Base,
    engine
)

from app.services import (
    get_user_by_email,
    create_user,
    get_sedes,
    create_sede,
    update_sede,
    desactivar_sede
)

from app.utils import (
    verify_password,
    create_access_token,
    get_password_hash
)

from app.utils.auth_deps import (
    get_current_user,
    require_role
)

from app.schemas import (
    UsuarioCreate,
    UsuarioResponse,
    Token,
    LoginRequest,
    SedeCreate,
    SedeResponse,
    SedeUpdate
)

from app.schemas.schemas_operaciones import (
    MesaCreate,
    MesaResponse,
    ProductoCreate,
    ProductoResponse,
    InventarioCreate,
    InventarioResponse,
    PedidoCreate,
    InventarioUpdate,
    PedidoResponse,
    PagoCreate,
    PagoResponse,
    AuditoriaResponse,
    ReporteVentasItem,
    ReporteInventarioItem
)

from app.services.services_operaciones import (
    get_mesas,
    create_mesa,
    actualizar_mesa,
    eliminar_mesa,
    get_productos,
    create_producto,
    get_inventario_por_sede,
    registrar_entrada_inventario,
    crear_pedido,
    get_pedidos_activos,
    cancelar_pedido,
    registrar_pago,
    get_auditoria,
    reporte_ventas,
    reporte_inventario
)

from app.models.models_service import Usuario

from app.models.models_operaciones import (
    MovimientoInventario,
    Producto,
    Inventario
)


# =========================================================
# CONFIGURACIÓN
# =========================================================

app = FastAPI(
    title="Sistema de Gestión Integral - Bar Pola y Punto"
)

Base.metadata.create_all(bind=engine)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# INICIO
# =========================================================

@app.get("/")
def inicio():
    return {
        "mensaje": "Backend Bar Pola y Punto funcionando correctamente"
    }


# =========================================================
# AUTENTICACIÓN
# =========================================================

@app.post(
    "/auth/login",
    response_model=Token
)
def login(
    datos: LoginRequest,
    db: Session = Depends(get_db)
):
    user = get_user_by_email(
        db,
        datos.email
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo o contraseña incorrectos"
        )

    if not verify_password(
        datos.password,
        user.hashed_password
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo o contraseña incorrectos"
        )

    if not user.estado:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="El usuario está inactivo"
        )

    rol_id = (
        int(user.id_rol)
        if user.id_rol
        else 1
    )

    token = create_access_token(
        data={
            "sub": user.email,
            "role": rol_id
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer"
    }


# =========================================================
# SEDES
# =========================================================

@app.get(
    "/listar_sedes",
    response_model=List[SedeResponse]
)
def listar_sedes(
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    return get_sedes(db)


@app.post(
    "/crear_sedes",
    response_model=SedeResponse
)
def crear_sede_endpoint(
    sede: SedeCreate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(
        require_role("Administrador")
    )
):
    return create_sede(
        db,
        sede
    )


@app.put(
    "/sedes/{id_sede}",
    response_model=SedeResponse
)
def actualizar_sede_endpoint(
    id_sede: int,
    sede: SedeUpdate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(
        require_role("Administrador")
    )
):
    return update_sede(
        db,
        id_sede,
        sede
    )


@app.delete(
    "/sedes/{id_sede}",
    response_model=SedeResponse
)
def eliminar_sede_endpoint(
    id_sede: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(
        require_role("Administrador")
    )
):
    return desactivar_sede(
        db,
        id_sede
    )


# =========================================================
# USUARIOS
# =========================================================

@app.get(
    "/usuarios",
    response_model=List[UsuarioResponse]
)
def listar_usuarios(
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(
        require_role("Administrador")
    )
):
    return db.query(Usuario).all()


@app.post(
    "/registrar_usuarios",
    response_model=UsuarioResponse
)
def registrar_usuario_endpoint(
    usuario_data: UsuarioCreate,
    db: Session = Depends(get_db)
):
    return create_user(
        db,
        usuario_data
    )


@app.delete(
    "/usuarios/{id_usuario}",
    response_model=UsuarioResponse
)
def eliminar_usuario_endpoint(
    id_usuario: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(
        require_role("Administrador")
    )
):
    usuario_db = (
        db.query(Usuario)
        .filter(
            Usuario.id == id_usuario
        )
        .first()
    )

    if not usuario_db:
        raise HTTPException(
            status_code=404,
            detail="Usuario no encontrado"
        )

    usuario_db.estado = False

    db.commit()
    db.refresh(usuario_db)

    return usuario_db


@app.put(
    "/usuarios/{id_usuario}/password"
)
def cambiar_password(
    id_usuario: int,
    password: str,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(
        require_role("Administrador")
    )
):
    usuario_db = (
        db.query(Usuario)
        .filter(
            Usuario.id == id_usuario
        )
        .first()
    )

    if not usuario_db:
        raise HTTPException(
            status_code=404,
            detail="Usuario no encontrado"
        )

    usuario_db.hashed_password = (
        get_password_hash(password)
    )

    db.commit()

    return {
        "mensaje": "Contraseña actualizada correctamente"
    }


# =========================================================
# MESAS
# =========================================================

@app.get(
    "/mesas",
    response_model=List[MesaResponse]
)
def listar_mesas(
    id_sede: Optional[int] = None,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    return get_mesas(
        db,
        id_sede
    )


@app.post(
    "/mesas",
    response_model=MesaResponse
)
def crear_mesa_endpoint(
    mesa: MesaCreate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(
        require_role("Administrador")
    )
):
    return create_mesa(
        db,
        mesa
    )


@app.put(
    "/mesas/{id_mesa}",
    response_model=MesaResponse
)
def actualizar_mesa_endpoint(
    id_mesa: int,
    mesa: MesaCreate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(
        require_role("Administrador")
    )
):
    return actualizar_mesa(
        db,
        id_mesa,
        mesa
    )


@app.delete(
    "/mesas/{id_mesa}",
    response_model=MesaResponse
)
def eliminar_mesa_endpoint(
    id_mesa: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(
        require_role("Administrador")
    )
):
    return eliminar_mesa(
        db,
        id_mesa
    )


# =========================================================
# PRODUCTOS
# =========================================================

@app.get(
    "/productos",
    response_model=List[ProductoResponse]
)
def listar_productos(
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    return get_productos(db)


@app.post(
    "/productos",
    response_model=ProductoResponse
)
def crear_producto_endpoint(
    producto: ProductoCreate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(
        require_role("Administrador")
    )
):
    return create_producto(
        db,
        producto
    )


@app.put(
    "/productos/{id_producto}",
    response_model=ProductoResponse
)
def actualizar_producto_endpoint(
    id_producto: int,
    producto: ProductoCreate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(
        require_role("Administrador")
    )
):
    producto_db = (
        db.query(Producto)
        .filter(
            Producto.id == id_producto
        )
        .first()
    )

    if not producto_db:
        raise HTTPException(
            status_code=404,
            detail="Producto no encontrado"
        )

    producto_db.nombre = producto.nombre
    producto_db.categoria = producto.categoria
    producto_db.precio = producto.precio

    db.commit()
    db.refresh(producto_db)

    return producto_db


@app.delete(
    "/productos/{id_producto}",
    response_model=ProductoResponse
)
def eliminar_producto_endpoint(
    id_producto: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(
        require_role("Administrador")
    )
):
    producto_db = (
        db.query(Producto)
        .filter(
            Producto.id == id_producto
        )
        .first()
    )

    if not producto_db:
        raise HTTPException(
            status_code=404,
            detail="Producto no encontrado"
        )

    producto_db.estado = False

    db.commit()
    db.refresh(producto_db)

    return producto_db


# =========================================================
# INVENTARIO
# =========================================================

@app.get(
    "/inventario/{id_sede}",
    response_model=List[InventarioResponse]
)
def listar_inventario(
    id_sede: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(
        require_role("Administrador")
    )
):
    return get_inventario_por_sede(
        db,
        id_sede
    )


@app.post(
    "/inventario/entrada",
    response_model=InventarioResponse
)
def entrada_inventario(
    data: InventarioCreate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(
        require_role("Administrador")
    )
):
    return registrar_entrada_inventario(
        db,
        data,
        usuario.id
    )


@app.put(
    "/inventario/{id_inventario}",
    response_model=InventarioResponse
)
def actualizar_inventario_endpoint(
    id_inventario: int,
    data: InventarioUpdate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(
        require_role("Administrador")
    )
):
    item_db = (
        db.query(Inventario)
        .filter(
            Inventario.id == id_inventario
        )
        .first()
    )

    if not item_db:
        raise HTTPException(
            status_code=404,
            detail="Registro de inventario no encontrado"
        )

    item_db.cantidad = data.cantidad
    item_db.stock_minimo = data.stock_minimo

    db.commit()
    db.refresh(item_db)

    return item_db


@app.delete(
    "/inventario/{id_inventario}",
    response_model=InventarioResponse
)
def eliminar_inventario_endpoint(
    id_inventario: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(
        require_role("Administrador")
    )
):
    item_db = (
        db.query(Inventario)
        .filter(
            Inventario.id == id_inventario
        )
        .first()
    )

    if not item_db:
        raise HTTPException(
            status_code=404,
            detail="Registro de inventario no encontrado"
        )

    # Eliminar movimientos asociados
    # para evitar conflictos de llave foránea
    (
        db.query(MovimientoInventario)
        .filter(
            MovimientoInventario.id_inventario == id_inventario
        )
        .delete(
            synchronize_session=False
        )
    )

    # Eliminar el registro de inventario
    db.delete(item_db)

    db.commit()

    return item_db


# =========================================================
# PEDIDOS
# =========================================================

@app.post(
    "/pedidos",
    response_model=PedidoResponse
)
def crear_pedido_endpoint(
    pedido: PedidoCreate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(
        require_role(
            "Mesero",
            "Administrador"
        )
    )
):
    return crear_pedido(
        db,
        pedido,
        usuario.id
    )


@app.get(
    "/pedidos/activos",
    response_model=List[PedidoResponse]
)
def listar_pedidos_activos(
    id_sede: Optional[int] = None,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    return get_pedidos_activos(
        db,
        id_sede
    )


@app.put(
    "/pedidos/{id_pedido}/cancelar",
    response_model=PedidoResponse
)
def cancelar_pedido_endpoint(
    id_pedido: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(
        require_role(
            "Mesero",
            "Administrador"
        )
    )
):
    return cancelar_pedido(
        db,
        id_pedido,
        usuario.id
    )


# =========================================================
# PAGOS
# =========================================================

@app.post(
    "/pagos",
    response_model=PagoResponse
)
def registrar_pago_endpoint(
    pago: PagoCreate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(
        require_role(
            "Cajero",
            "Administrador"
        )
    )
):
    return registrar_pago(
        db,
        pago,
        usuario.id
    )


# =========================================================
# AUDITORÍA
# =========================================================

@app.get(
    "/auditoria",
    response_model=List[AuditoriaResponse]
)
def listar_auditoria(
    id_sede: Optional[int] = None,
    limit: int = 100,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    return get_auditoria(
        db,
        id_sede,
        limit
    )


# =========================================================
# REPORTES
# =========================================================

@app.get(
    "/reportes/ventas",
    response_model=List[ReporteVentasItem]
)
def reporte_ventas_endpoint(
    id_sede: Optional[int] = None,
    fecha_inicio: Optional[date] = None,
    fecha_fin: Optional[date] = None,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(
        require_role("Administrador")
    )
):
    return reporte_ventas(
        db,
        id_sede,
        fecha_inicio,
        fecha_fin
    )


@app.get(
    "/reportes/inventario",
    response_model=List[ReporteInventarioItem]
)
def reporte_inventario_endpoint(
    id_sede: Optional[int] = None,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(
        require_role("Administrador")
    )
):
    return reporte_inventario(
        db,
        id_sede
    )


# =========================================================
# EJECUCIÓN
# =========================================================

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=True
    )
