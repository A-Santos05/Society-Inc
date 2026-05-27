from tortoise import fields, models

class Campo(models.Model):
    id = fields.UUIDField(pk=True)
    nome = fields.CharField(max_length=100)
    descricao = fields.TextField(null=True)

    class Meta:
        table = "campo"