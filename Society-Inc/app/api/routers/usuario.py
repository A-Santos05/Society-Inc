from fastapi import APIRouter, HTTPException, status, Depends
from app.schemas.usuario import UsuarioCreate, UsuarioResponse
from app.crud import crud_usuario
from app.api.dependencies import get_current_user
from app.models.usuario import Usuario

router = APIRouter(prefix="/usuarios", tags=["Usuários"])

@router.post("/registro", response_model=UsuarioResponse, status_code=status.HTTP_201_CREATED)
async def registrar_usuario(usuario_in: UsuarioCreate):
    usuario_existente = await crud_usuario.get_usuario_por_email(email=usuario_in.email)
    if usuario_existente:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Este e-mail já está em uso na plataforma."
        )
        
    novo_usuario = await crud_usuario.criar_usuario(usuario_in)
    return novo_usuario

@router.get("/me", response_model=UsuarioResponse)
async def ler_usuario_logado(usuario_atual: Usuario = Depends(get_current_user)):
    """
    Retorna os dados do usuário atualmente logado.
    Requer o envio do token JWT nos headers (Authorization: Bearer <token>).
    """
    return usuario_atual