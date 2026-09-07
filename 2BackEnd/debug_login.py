# debug_login.py — colócalo en la raíz de 2BackEnd
from app.db.database import SessionLocal
from app.db.models import Usuario
from app.core.security import verify_password

db = SessionLocal()
user = db.query(Usuario).filter(Usuario.email == "admin@barpolaypunto.com").first()

if not user:
    print("❌ Usuario NO encontrado")
else:
    print(f"✅ Usuario encontrado: {user.email}")
    print(f"Hash guardado: {user.hashed_password}")
    print(f"Longitud del hash: {len(user.hashed_password)}")
    resultado = verify_password("admin123", user.hashed_password)
    print(f"¿Password coincide?: {resultado}")

db.close()