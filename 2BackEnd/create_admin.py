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


def inicializar_base_datos():
    db = SessionLocal()

    try:
        sembrar_roles(db)
        sede = sembrar_sede_default(db)

        # Definir los usuarios base que queremos asegurar en el sistema
        usuarios_por_crear = [
            {
                "nombre_completo": "Administrador Principal",
                "email": "admin@barpolaypunto.com",
                "password": "admin123",
                "rol_nombre": "Administrador"
            },
            {
                "nombre_completo": "Mesero de Prueba",
                "email": "mesero@barpolaypunto.com",
                "password": "mesero123",
                "rol_nombre": "Mesero"
            },
            {
                "nombre_completo": "Cajero de Prueba",
                "email": "cajero@barpolaypunto.com",
                "password": "cajero123",
                "rol_nombre": "Cajero"
            }
        ]

        print("===================================")
        print("INICIALIZANDO USUARIOS Y ROLES")
        print("===================================")

        for data in usuarios_por_crear:
            rol = db.query(Rol).filter(Rol.nombre == data["rol_nombre"]).first()
            existing_user = db.query(Usuario).filter(Usuario.email == data["email"]).first()

            if existing_user:
                print(f"-> El usuario {data['email']} ya existe.")
                continue

            hashed_password = get_password_hash(data["password"])
            nuevo_usuario = Usuario(
                nombre_completo=data["nombre_completo"],
                email=data["email"],
                hashed_password=hashed_password,
                id_rol=rol.id,
                id_sede=sede.id,
                estado=True
            )

            db.add(nuevo_usuario)
            db.commit()
            db.refresh(nuevo_usuario)

            print(f"✅ ¡{data['rol_nombre'].upper()} CREADO!")
            print(f"   Correo: {data['email']}")
            print(f"   Contraseña: {data['password']}")
            print(f"   Rol: {rol.nombre} (ID: {rol.id})")
            print("-----------------------------------")

    except Exception as e:
        print(f"Error al sembrar la base de datos: {e}")
        db.rollback()

    finally:
        db.close()


if __name__ == "__main__":
    inicializar_base_datos()