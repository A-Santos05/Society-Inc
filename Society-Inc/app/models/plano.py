from tortoise import fields, models

class Plano(models.Model):
    id = fields.UUIDField(pk=True)
    nome = fields.CharField(max_length=100)
    valor = fields.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        table = "plano"