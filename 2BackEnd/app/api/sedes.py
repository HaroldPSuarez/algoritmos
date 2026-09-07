from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.schemas.sede import SedeCreate, SedeResponse
from app.crud.crud_sede import get_sedes, create_sede

router = APIRouter(prefix="/sedes", tags=["Sedes"])

@router.get("/", response_model=List[SedeResponse])
def listar_sedes(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return get_sedes(db, skip=skip, limit=limit)

@router.post("/", response_model=SedeResponse)
def crear_sede(sede: SedeCreate, db: Session = Depends(get_db)):
    return create_sede(db=db, sede=sede)