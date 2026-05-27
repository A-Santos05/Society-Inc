from fastapi import APIRouter, status
from typing import List

from app.schemas.campo import CampoCreate, CampoResponse
from app.crud import crud_campo

router = APIRouter(prefix="/campos", tags=["Campos"])


@router.post("/", response_model=CampoResponse, status_code=status.HTTP_201_CREATED)
async def criar_campo(campo_in: CampoCreate):
    return await crud_campo.criar_campo(campo_in)


@router.get("/", response_model=List[CampoResponse])
async def listar_campos():
    return await crud_campo.listar_campos()