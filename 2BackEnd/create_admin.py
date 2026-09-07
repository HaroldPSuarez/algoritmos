import sys
import os

# Asegurar que reconozca la ruta base
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.database import SessionLocal
from app.models.user import Usuario  # Usamos Usuario tal como está en tu BD
from app.core.security import get_password_hash

def crear_admin():
    db = SessionLocal()
    try:
        admin_email = "admin@barpolaypunto.com"
        existing_user = db.query(Usuario).filter(Usuario.email == admin_email).first()
        
        if existing_user:
            print("El usuario administrador ya existe.")
            return

        hashed_password = get_password_hash("admin123")
        
        nuevo_admin = Usuario(
            nombre="Administrador Principal",
            email=admin_email,
            password=hashed_password,
            id_rol=1,
            id_sede=1,
            activo=True
        )
        
        db.add(nuevo_admin)
        db.commit()
        print("¡Usuario administrador creado exitosamente!")
    except Exception as e:
        print(f"Error al crear el admin: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    crear_admin()