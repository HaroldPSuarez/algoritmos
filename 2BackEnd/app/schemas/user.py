from pydantic import BaseModel, EmailStr
from typing import Optional

class UsuarioCreate(BaseModel):
    nombre_completo: str
    email: EmailStr
    password: str
    id_rol: int
    id_sede: Optional[int] = None

class UsuarioResponse(BaseModel):
    id: int
    nombre_completo: str
    email: str
    estado: bool
    id_rol: int
    id_sede: Optional[int] = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str