from datetime import datetime

from pydantic import BaseModel, UUID4, model_validator

from app.models.agendamento import StatusAgendamento


class AgendamentoCreate(BaseModel):
    campo_id: UUID4
    data_hora_inicio: datetime
    data_hora_fim: datetime

    @model_validator(mode="after")
    def validar_horario(self):
        if self.data_hora_fim <= self.data_hora_inicio:
            raise ValueError("O horario de termino deve ser posterior ao horario de inicio.")
        return self


class AgendamentoResponse(BaseModel):
    id: UUID4
    usuario_id: UUID4
    campo_id: UUID4
    data_hora_inicio: datetime
    data_hora_fim: datetime
    status: StatusAgendamento

    class Config:
        from_attributes = True
