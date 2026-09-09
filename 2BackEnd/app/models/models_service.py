from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.config  import Base

class Sede(Base):
    __tablename__ = "sedes"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    direccion = Column(String(200), nullable=False)
    telefono = Column(String(20), nullable=True)
    estado = Column(Boolean, default=True)
    usuarios = relationship("Usuario", back_populates="sede")

class Rol(Base):
    __tablename__ = "roles"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(50), unique=True, nullable=False)
    descripcion = Column(String(200), nullable=True)
    usuarios = relationship("Usuario", back_populates="rol")

class Usuario(Base):
    __tablename__ = "usuarios"
    id = Column(Integer, primary_key=True, index=True)
    nombre_completo = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    estado = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    id_rol = Column(Integer, ForeignKey("roles.id"), nullable=False)
    id_sede = Column(Integer, ForeignKey("sedes.id"), nullable=True)

    rol = relationship("Rol", back_populates="usuarios")
    sede = relationship("Sede", back_populates="usuarios")