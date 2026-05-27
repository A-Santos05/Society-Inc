from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.dependencies import get_current_user
from app.crud import crud_agendamento
from app.models.agendamento import Agendamento, StatusAgendamento
from app.models.usuario import TipoUsuario, Usuario
from app.schemas.agendamento import AgendamentoCreate, AgendamentoResponse

router = APIRouter(prefix="/agendamentos", tags=["Agendamentos"])


@router.post("/", response_model=AgendamentoResponse, status_code=status.HTTP_201_CREATED)
async def realizar_agendamento(
    agendamento_in: AgendamentoCreate,
    usuario_atual: Usuario = Depends(get_current_user),
):
    novo_agendamento = await crud_agendamento.criar_agendamento(
        agendamento=agendamento_in,
        usuario_id=usuario_atual.id,
    )

    if novo_agendamento == "campo_inexistente":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campo nao encontrado.",
        )

    if not novo_agendamento:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="O campo selecionado ja possui um agendamento neste horario.",
        )

    return novo_agendamento


@router.get("/", response_model=List[AgendamentoResponse])
async def listar_agendamentos():
    return await crud_agendamento.listar_agendamentos()


@router.patch("/{id}/cancelar", response_model=AgendamentoResponse)
async def cancelar(
    id: UUID,
    usuario_atual: Usuario = Depends(get_current_user),
):
    agendamento = await Agendamento.get_or_none(id=id)

    if not agendamento:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agendamento nao encontrado.",
        )

    if agendamento.usuario_id != usuario_atual.id and usuario_atual.tipo != TipoUsuario.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Voce nao pode cancelar este agendamento.",
        )

    agendamento.status = StatusAgendamento.CANCELADO
    await agendamento.save()

    return agendamento
