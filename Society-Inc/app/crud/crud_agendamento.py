from datetime import datetime
from uuid import UUID

from tortoise.transactions import in_transaction

from app.models.agendamento import Agendamento, StatusAgendamento
from app.models.campo import Campo
from app.schemas.agendamento import AgendamentoCreate


async def verificar_disponibilidade(campo_id: UUID, inicio: datetime, fim: datetime) -> bool:
    """
    Verifica conflito no mesmo campo.
    Overlap: (inicio_existente < fim_novo) and (fim_existente > inicio_novo).
    """
    conflito = await (
        Agendamento.filter(
            campo_id=campo_id,
            data_hora_inicio__lt=fim,
            data_hora_fim__gt=inicio,
        )
        .exclude(status=StatusAgendamento.CANCELADO)
        .exists()
    )

    return not conflito


async def criar_agendamento(agendamento: AgendamentoCreate, usuario_id: UUID):
    async with in_transaction():
        campo_existe = await Campo.filter(id=agendamento.campo_id).exists()
        if not campo_existe:
            return "campo_inexistente"

        disponivel = await verificar_disponibilidade(
            campo_id=agendamento.campo_id,
            inicio=agendamento.data_hora_inicio,
            fim=agendamento.data_hora_fim,
        )

        if not disponivel:
            return None

        return await Agendamento.create(
            usuario_id=usuario_id,
            campo_id=agendamento.campo_id,
            data_hora_inicio=agendamento.data_hora_inicio,
            data_hora_fim=agendamento.data_hora_fim,
            status=StatusAgendamento.PENDENTE,
        )


async def listar_agendamentos():
    return await Agendamento.all().order_by("-data_hora_inicio")
