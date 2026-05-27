from pydantic import BaseModel, EmailStr, UUID4
from datetime import datetime
from typing import Optional
from app.models.usuario import TipoUsuario

class UsuarioCreate(BaseModel):
    nome: str
    email: EmailStr
    senha: str
    tipo: TipoUsuario = TipoUsuario.JOGADOR

class UsuarioResponse(BaseModel):
    id: UUID4
    nome: str
    email: EmailStr
    tipo: TipoUsuario
    criado_em: datetime
    atualizado_em: datetime

    class Config:
        from_attributes = True