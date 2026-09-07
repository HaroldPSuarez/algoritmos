from sqlalchemy.orm import Session
from app.db.models import Usuario
from app.schemas.user import UsuarioCreate
from app.core.security import get_password_hash

def get_user_by_email(db: Session, email: str):
    return db.query(Usuario).filter(Usuario.email == email).first()

def create_user(db: Session, user: UsuarioCreate):
    hashed_password = get_password_hash(user.password)
    db_user = Usuario(
        nombre_completo=user.nombre_completo,
        email=user.email,
        hashed_password=hashed_password,
        id_rol=user.id_rol,
        id_sede=user.id_sede
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user