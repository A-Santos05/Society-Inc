from app.models.campo import Campo
from app.schemas.campo import CampoCreate


async def criar_campo(campo_in: CampoCreate):
    campo = await Campo.create(
        nome=campo_in.nome,
        descricao=campo_in.descricao
    )

    return campo


async def listar_campos():
    return await Campo.all()