import sys
import os

# Asegurar que reconozca la ruta base
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.config import SessionLocal
from app.models import Usuario
from app.utils import get_password_hash


def crear_admin():
    db = SessionLocal()

    try:
        admin_email = "admin@barpolaypunto.com"

        # Verificar si ya existe
        existing_user = db.query(Usuario).filter(
            Usuario.email == admin_email
        ).first()

        if existing_user:
            print("El usuario administrador ya existe.")
            return

        # Encriptar contraseña
        hashed_password = get_password_hash("admin123")

        nuevo_admin = Usuario(
            nombre_completo="Administrador Principal",
            email=admin_email,
            hashed_password=hashed_password,
            id_rol=1,
            id_sede=1,
            estado=True
        )

        db.add(nuevo_admin)
        db.commit()
        db.refresh(nuevo_admin)

        print("===================================")
        print("¡ADMINISTRADOR CREADO!")
        print("===================================")
        print(f"ID: {nuevo_admin.id}")
        print("Correo: admin@barpolaypunto.com")
        print("Contraseña: admin123")
        print("Rol ID: 1")
        print("Sede ID: 1")
        print("===================================")

    except Exception as e:
        print(f"Error al crear el admin: {e}")
        db.rollback()

    finally:
        db.close()


if __name__ == "__main__":
    crear_admin()