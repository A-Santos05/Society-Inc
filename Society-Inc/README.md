# Society Inc

MVP para gestao de campos society com API em FastAPI e frontend em React/Vite.

## Funcionalidades

- Cadastro de usuarios com senha criptografada.
- Login com token assinado.
- Sessao autenticada via `Authorization: Bearer <token>`.
- Cadastro e listagem de campos.
- Criacao de agendamentos com validacao de conflito de horario.
- Cancelamento de agendamentos pelo proprio usuario ou por admin.
- Frontend responsivo para conta, campos, reservas e agenda operacional.

## Backend

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

A API sobe em `http://127.0.0.1:8000`.

Variaveis opcionais:

```bash
set SECRET_KEY=sua-chave-secreta
set DATABASE_URL=sqlite://db.sqlite3
set ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

## Frontend

```bash
npm install
npm run dev
```

O app sobe em `http://localhost:5173`.

Para apontar para outra API:

```bash
set VITE_API_URL=http://127.0.0.1:8000
```

## Rotas principais

- `POST /usuarios/registro`
- `POST /auth/login`
- `GET /usuarios/me`
- `POST /campos/`
- `GET /campos/`
- `POST /agendamentos/`
- `GET /agendamentos/`
- `PATCH /agendamentos/{id}/cancelar`

## Observacoes

O banco padrao e SQLite local com criacao automatica de schemas pelo Tortoise ORM. Para producao, troque `SECRET_KEY`, restrinja `ALLOWED_ORIGINS`, use migracoes e configure um banco persistente.
