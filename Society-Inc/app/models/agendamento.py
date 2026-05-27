from tortoise import fields, models
from enum import Enum

class StatusAgendamento(str, Enum):
    PENDENTE = "pendente"
    CONFIRMADO = "confirmado"
    CANCELADO = "cancelado"

class Agendamento(models.Model):
    id = fields.UUIDField(pk=True)
    # Relacionamentos (ForeignKeys)
    usuario = fields.ForeignKeyField('models.Usuario', related_name='agendamentos')
    campo = fields.ForeignKeyField('models.Campo', related_name='agendamentos')
    plano = fields.ForeignKeyField(
    'models.Plano',
    related_name='agendamentos',
    null=True
)
    data_hora_inicio = fields.DatetimeField()
    data_hora_fim = fields.DatetimeField()
    status = fields.CharEnumField(StatusAgendamento, default=StatusAgendamento.PENDENTE)

    class Meta:
        table = "agendamento"