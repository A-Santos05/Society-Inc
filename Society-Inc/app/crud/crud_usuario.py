from app.models.usuario import Usuario
from app.schemas.usuario import UsuarioCreate

from app.core.security import get_password_hash 

async def get_usuario_por_email(email: str) -> Usuario | None:
    """Busca um usuario no banco a partir do e-mail."""
    return await Usuario.get_or_none(email=email)

async def criar_usuario(usuario_in: UsuarioCreate) -> Usuario:
    """Gera o hash da senha e persiste o usuario."""
    senha_hasheada = get_password_hash(usuario_in.senha)
    
    usuario_db = await Usuario.create(
        nome=usuario_in.nome,
        email=usuario_in.email,
        senha_hash=senha_hasheada,
        tipo=usuario_in.tipo
    )
    
    return usuario_db
