from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr

from app.core.security import create_access_token, verify_password
from app.crud.crud_usuario import get_usuario_por_email

router = APIRouter(prefix="/auth", tags=["Autenticacao"])


class Login(BaseModel):
    email: EmailStr
    senha: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


@router.post("/login", response_model=TokenResponse)
async def login(data: Login):
    usuario = await get_usuario_por_email(data.email)

    if not usuario or not verify_password(data.senha, usuario.senha_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-mail ou senha invalidos.",
        )

    return {
        "access_token": create_access_token(str(usuario.id)),
        "token_type": "bearer",
    }
