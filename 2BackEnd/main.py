import uvicorn
from datetime import date
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel

from app.config import get_db, Base, engine
from app.services import get_user_by_email, create_user, get_sedes, create_sede, update_sede, desactivar_sede
from app.utils import verify_password, create_access_token, logger, get_password_hash
from app.utils.auth_deps import get_current_user, require_role
from app.schemas import (
    UsuarioCreate, UsuarioResponse, Token, LoginRequest, SedeCreate, SedeResponse, SedeUpdate
)
from app.schemas.schemas_operaciones import (
    MesaCreate, MesaResponse, ProductoCreate, ProductoResponse,
    InventarioCreate, InventarioResponse, PedidoCreate, PedidoResponse,
    PagoCreate, PagoResponse, AuditoriaResponse, ReporteVentasItem, ReporteInventarioItem
)
from app.services.services_operaciones import (
    get_mesas, create_mesa, get_productos, create_producto,
    get_inventario_por_sede, registrar_entrada_inventario,
    crear_pedido, get_pedidos_activos, cancelar_pedido, registrar_pago,
    get_auditoria, reporte_ventas, reporte_inventario
)
from app.models.models_service import Usuario

app = FastAPI(title="Sistema de Gestión Integral - Bar Pola y Punto")

# Crea automáticamente cualquier tabla nueva que falte (no borra ni modifica las existentes)
Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    logger.info('¡El backend de Bar Pola y Punto está corriendo exitosamente!')
    return {"mensaje": "¡El backend de Bar Pola y Punto está corriendo exitosamente!._."}


# ==================== AUTENTICACIÓN ====================
@app.post("/auth/login", response_model=Token)
def login(form_data: LoginRequest, db: Session = Depends(get_db)):
    user = get_user_by_email(db, email=form_data.email)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Aseguramos que el rol viaje estrictamente como número entero (ej. 1, 2, 3)
    rol_id = int(user.id_rol) if user.id_rol else 1
    
    # Creamos el token codificando el número en el payload
    access_token = create_access_token(data={"sub": user.email, "role": rol_id})
    
    return {"access_token": access_token, "token_type": "bearer"}

# ==================== SEDES ====================
@app.get("/listar_sedes", response_model=List[SedeResponse])
def listar_sedes(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return get_sedes(db, skip=skip, limit=limit)

@app.post("/crear_sedes", response_model=SedeResponse)
def crear_sede(sede: SedeCreate, db: Session = Depends(get_db)):
    return create_sede(db=db, sede=sede)

@app.put("/sedes/{id_sede}", response_model=SedeResponse)
def editar_sede(id_sede: int, datos: SedeUpdate, db: Session = Depends(get_db),
                 usuario: Usuario = Depends(require_role("Administrador"))):
    sede_actualizada = update_sede(db, id_sede, datos)
    if not sede_actualizada:
        raise HTTPException(status_code=404, detail="Sede no encontrada")
    return sede_actualizada

@app.delete("/sedes/{id_sede}", response_model=SedeResponse)
def eliminar_sede(id_sede: int, db: Session = Depends(get_db),
                    usuario: Usuario = Depends(require_role("Administrador"))):
    sede_desactivada = desactivar_sede(db, id_sede)
    if not sede_desactivada:
        raise HTTPException(status_code=404, detail="Sede no encontrada")
    return sede_desactivada


# ==================== USUARIOS ====================
class PasswordUpdateSchema(BaseModel):
    password: str

@app.get("/usuarios", response_model=List[UsuarioResponse])
def listar_usuarios(db: Session = Depends(get_db), usuario: Usuario = Depends(require_role("Administrador"))):
    """Obtiene la lista completa de usuarios registrados en el sistema."""
    return db.query(Usuario).all()

@app.post("/registrar_usuarios", response_model=UsuarioResponse)
def registrar_usuario(user: UsuarioCreate, db: Session = Depends(get_db)):
    db_user = get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="El correo ya está registrado")
    return create_user(db=db, user=user)

@app.delete("/usuarios/{id_usuario}", response_model=UsuarioResponse)
def eliminar_usuario(id_usuario: int, db: Session = Depends(get_db), usuario: Usuario = Depends(require_role("Administrador"))):
    """Elimina un usuario del sistema por su ID."""
    db_user = db.query(Usuario).filter(Usuario.id == id_usuario).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    db.delete(db_user)
    db.commit()
    return db_user

@app.put("/usuarios/{id_usuario}/password", response_model=UsuarioResponse)
def actualizar_password_usuario(id_usuario: int, datos: PasswordUpdateSchema, db: Session = Depends(get_db), usuario: Usuario = Depends(require_role("Administrador"))):
    """Actualiza la contraseña de un usuario específico."""
    db_user = db.query(Usuario).filter(Usuario.id == id_usuario).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    db_user.hashed_password = get_password_hash(datos.password)
    db.commit()
    db.refresh(db_user)
    return db_user


# ==================== MESAS ====================
@app.get("/mesas", response_model=List[MesaResponse])
def listar_mesas(id_sede: int = None, db: Session = Depends(get_db),
                  usuario: Usuario = Depends(get_current_user)):
    return get_mesas(db, id_sede)

@app.post("/mesas", response_model=MesaResponse)
def crear_mesa_endpoint(mesa: MesaCreate, db: Session = Depends(get_db),
                         usuario: Usuario = Depends(require_role("Administrador"))):
    return create_mesa(db, mesa)


# ==================== PRODUCTOS ====================
@app.get("/productos", response_model=List[ProductoResponse])
def listar_productos(db: Session = Depends(get_db),
                      usuario: Usuario = Depends(get_current_user)):
    return get_productos(db)

@app.post("/productos", response_model=ProductoResponse)
def crear_producto_endpoint(producto: ProductoCreate, db: Session = Depends(get_db),
                           usuario: Usuario = Depends(require_role("Administrador"))):
    return create_producto(db, producto)


# ==================== INVENTARIO ====================
@app.get("/inventario/{id_sede}", response_model=List[InventarioResponse])
def listar_inventario(id_sede: int, db: Session = Depends(get_db),
                       usuario: Usuario = Depends(require_role("Administrador"))):
    return get_inventario_por_sede(db, id_sede)

@app.post("/inventario/entrada", response_model=InventarioResponse)
def entrada_inventario(data: InventarioCreate, db: Session = Depends(get_db),
                        usuario: Usuario = Depends(require_role("Administrador"))):
    return registrar_entrada_inventario(db, data, usuario.id)


# ==================== PEDIDOS ====================
@app.post("/pedidos", response_model=PedidoResponse)
def crear_pedido_endpoint(pedido: PedidoCreate, db: Session = Depends(get_db),
                            usuario: Usuario = Depends(require_role("Mesero", "Administrador"))):
    return crear_pedido(db, pedido, usuario.id)

@app.get("/pedidos/activos", response_model=List[PedidoResponse])
def listar_pedidos_activos(id_sede: int = None, db: Session = Depends(get_db),
                            usuario: Usuario = Depends(get_current_user)):
    return get_pedidos_activos(db, id_sede)

@app.put("/pedidos/{id_pedido}/cancelar", response_model=PedidoResponse)
def cancelar_pedido_endpoint(id_pedido: int, db: Session = Depends(get_db),
                            usuario: Usuario = Depends(require_role("Mesero", "Administrador"))):
    return cancelar_pedido(db, id_pedido, usuario.id)


# ==================== PAGOS ====================
@app.post("/pagos", response_model=PagoResponse)
def registrar_pago_endpoint(pago: PagoCreate, db: Session = Depends(get_db),
                           usuario: Usuario = Depends(require_role("Cajero", "Administrador"))):
    return registrar_pago(db, pago, usuario.id)


# ==================== AUDITORÍA ====================
@app.get("/auditoria", response_model=List[AuditoriaResponse])
def listar_auditoria(id_sede: int = None, db: Session = Depends(get_db),
                      usuario: Usuario = Depends(get_current_user)):
    return get_auditoria(db, id_sede)


# ==================== REPORTES ====================
@app.get("/reportes/ventas", response_model=List[ReporteVentasItem])
def obtener_reporte_ventas(id_sede: int = None, fecha_inicio: date = None, fecha_fin: date = None,
                            db: Session = Depends(get_db),
                            usuario: Usuario = Depends(require_role("Administrador"))):
    resultados = reporte_ventas(db, id_sede, fecha_inicio, fecha_fin)
    return [
        {"id_sede": r.id_sede, "fecha": r.fecha, "cantidad_ventas": r.cantidad_ventas, "total_vendido": r.total_vendido}
        for r in resultados
    ]

@app.get("/reportes/inventario", response_model=List[ReporteInventarioItem])
def obtener_reporte_inventario(id_sede: int = None, db: Session = Depends(get_db),
                                usuario: Usuario = Depends(require_role("Administrador"))):
    resultados = reporte_inventario(db, id_sede)
    return [
        {"id_sede": r.id_sede, "nombre": r.nombre, "cantidad": r.cantidad, "stock_minimo": r.stock_minimo}
        for r in resultados
    ]


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000
    )