from sqlalchemy.orm import Session
from app.models import Sede
from app.schemas import SedeCreate

def get_sedes(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Sede).offset(skip).limit(limit).all()

def create_sede(db: Session, sede: SedeCreate):
    db_sede = Sede(nombre=sede.nombre, direccion=sede.direccion, telefono=sede.telefono)
    db.add(db_sede)
    db.commit()
    db.refresh(db_sede)
    return db_sede