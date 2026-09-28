import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.config import SessionLocal
from app.models import Usuario, Rol, Sede
from app.utils import get_password_hash


ROLES_BASE = ["Administrador", "Mesero", "Cajero"]


def sembrar_roles(db):
    for nombre in ROLES_BASE:
        existe = db.query(Rol).filter(Rol.nombre == nombre).first()
        if not existe:
            db.add(Rol(nombre=nombre, descripcion=f"Rol {nombre}"))
    db.commit()


def sembrar_sede_default(db):
    sede = db.query(Sede).first()
    if sede:
        return sede
    nueva_sede = Sede(
        nombre="Sede Principal",
        direccion="Por definir",
        telefono="0000000000",
        estado=True
    )
    db.add(nueva_sede)
    db.commit()
    db.refresh(nueva_sede)
    return nueva_sede


def crear_admin():
    db = SessionLocal()

    try:
        sembrar_roles(db)
        sede = sembrar_sede_default(db)

        rol_admin = db.query(Rol).filter(Rol.nombre == "Administrador").first()

        admin_email = "admin@barpolaypunto.com"

        existing_user = db.query(Usuario).filter(
            Usuario.email == admin_email
        ).first()

        if existing_user:
            print("El usuario administrador ya existe.")
            return

        hashed_password = get_password_hash("admin123")

        nuevo_admin = Usuario(
            nombre_completo="Administrador Principal",
            email=admin_email,
            hashed_password=hashed_password,
            id_rol=rol_admin.id,
            id_sede=sede.id,
            estado=True
        )

        db.add(nuevo_admin)
        db.commit()
        db.refresh(nuevo_admin)

        print("===================================")
        print("¡ADMINISTRADOR CREADO!")
        print("===================================")
        print(f"ID: {nuevo_admin.id}")
        print(f"Correo: {admin_email}")
        print("Contraseña: admin123")
        print(f"Rol: {rol_admin.nombre} (id {rol_admin.id})")
        print(f"Sede: {sede.nombre} (id {sede.id})")
        print("===================================")

    except Exception as e:
        print(f"Error al crear el admin: {e}")
        db.rollback()

    finally:
        db.close()


if __name__ == "__main__":
    crear_admin()