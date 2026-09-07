from pydantic import BaseModel
from typing import Optional

class SedeCreate(BaseModel):
    nombre: str
    direccion: str
    telefono: Optional[str] = None

class SedeResponse(SedeCreate):
    id: int
    estado: bool

    class Config:
        from_attributes = True