from pydantic import BaseModel, UUID4
from typing import Optional


class CampoCreate(BaseModel):
    nome: str
    descricao: Optional[str] = None


class CampoResponse(BaseModel):
    id: UUID4
    nome: str
    descricao: Optional[str]

    class Config:
        from_attributes = True