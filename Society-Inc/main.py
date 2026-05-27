from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from tortoise.contrib.fastapi import register_tortoise

from app.api.auth import router as auth_router
from app.api.routers import agendamento, campo, usuario
from app.core.config import ALLOWED_ORIGINS, DATABASE_URL

app = FastAPI(title="Society-Inc API")


@app.get("/")
async def rota_raiz():
    return {"mensagem": "O servidor FastAPI esta rodando e pronto para receber codigo!"}


app.include_router(usuario.router)
app.include_router(campo.router)
app.include_router(agendamento.router)
app.include_router(auth_router)
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


register_tortoise(
    app,
    db_url=DATABASE_URL,
    modules={
        "models": [
            "app.models.agendamento",
            "app.models.usuario",
            "app.models.campo",
            "app.models.plano",
        ]
    },
    generate_schemas=True,
    add_exception_handlers=True,
)
