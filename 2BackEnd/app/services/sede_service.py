from sqlalchemy.orm import Session
from app.models import Sede
from app.schemas import SedeCreate, SedeUpdate

def get_sedes(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Sede).offset(skip).limit(limit).all()

def create_sede(db: Session, sede: SedeCreate):
    db_sede = Sede(nombre=sede.nombre, direccion=sede.direccion, telefono=sede.telefono)
    db.add(db_sede)
    db.commit()
    db.refresh(db_sede)
    return db_sede

def update_sede(db: Session, id_sede: int, datos: SedeUpdate):
    db_sede = db.query(Sede).filter(Sede.id == id_sede).first()
    if not db_sede:
        return None
    if datos.nombre is not None:
        db_sede.nombre = datos.nombre
    if datos.direccion is not None:
        db_sede.direccion = datos.direccion
    if datos.telefono is not None:
        db_sede.telefono = datos.telefono
    if datos.estado is not None:
        db_sede.estado = datos.estado
    db.commit()
    db.refresh(db_sede)
    return db_sede

def desactivar_sede(db: Session, id_sede: int):
    db_sede = db.query(Sede).filter(Sede.id == id_sede).first()
    if not db_sede:
        return None
    db_sede.estado = False
    db.commit()
    db.refresh(db_sede)
    return db_sede