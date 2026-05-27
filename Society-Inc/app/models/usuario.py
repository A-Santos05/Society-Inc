from tortoise import fields, models
from enum import Enum

class TipoUsuario(str, Enum):
    JOGADOR = "jogador"
    ADMIN = "admin"

class Usuario(models.Model):
    id = fields.UUIDField(pk=True)
    nome = fields.CharField(max_length=100)
    email = fields.CharField(max_length=255, unique=True)
    senha_hash = fields.CharField(max_length=255)
    tipo = fields.CharEnumField(TipoUsuario, default=TipoUsuario.JOGADOR)
    
    plano = fields.ForeignKeyField("models.Plano", related_name="usuarios", null=True)
    
    criado_em = fields.DatetimeField(auto_now_add=True)
    atualizado_em = fields.DatetimeField(auto_now=True)

    class Meta:
        table = "usuarios"