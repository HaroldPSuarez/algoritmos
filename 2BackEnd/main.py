import uvicorn
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
# from app.api.auth import router as auth_router  # <- corregido
from sqlalchemy.orm import Session
from app.config import get_db
from app.services import get_user_by_email, create_user, get_sedes, create_sede
from app.utils import verify_password, create_access_token
# from app.schemas.user import LoginRequest, Token
from app.schemas import UsuarioCreate, UsuarioResponse, Token, LoginRequest, SedeCreate, SedeResponse

# from sqlalchemy.orm import Session
# from app.db.database import get_db
# from app.schemas.user import UsuarioCreate, UsuarioResponse
# from app.crud.crud_user import create_user, get_user_by_email

# from app.db.database import get_db
# from app.schemas.sede import SedeCreate, SedeResponse
# from app.crud.crud_sede import get_sedes, create_sede
from typing import List
from app.utils import logger
app = FastAPI()

# router = APIRouter(prefix="/auth", tags=["Autenticación"])


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    logger.info('¡El backend de Bar Pola y Punto está corriendo exitosamente!')
    return {"mensaje": "¡El backend de Bar Pola y Punto está corriendo exitosamente!._."}

# app.include_router(auth_router)

@app.post("/auth/login", response_model=Token)
def login(form_data: LoginRequest, db: Session = Depends(get_db)):
    user = get_user_by_email(db, email=form_data.email)
    logger.info(f'Se toman los datos del usuario: {user}')
    if not user or not verify_password(form_data.password, user.hashed_password):
        logger.info("No se verificó datos de usuario")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": user.email, "role": user.id_rol})
    logger.info(f'El acceso se crea: {access_token}')
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/listar_sedes", response_model=List[SedeResponse])
def listar_sedes(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return get_sedes(db, skip=skip, limit=limit)

@app.post("/crear_sedes", response_model=SedeResponse)
def crear_sede(sede: SedeCreate, db: Session = Depends(get_db)):
    return create_sede(db=db, sede=sede)

@app.post("/registrar_usuarios", response_model=UsuarioResponse)
def registrar_usuario(user: UsuarioCreate, db: Session = Depends(get_db)):
    db_user = get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="El correo ya está registrado")
    return create_user(db=db, user=user)

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000
    )