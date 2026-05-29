
from django.db import models
from django.contrib.auth.models import User

class Portfolio(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="portfolio")
    total_value = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)

    def __str__(self):
        return f"Portfolio de {self.user.username}"
    
    @property
    def calculated_total_value(self):
        # Sumamos (cantidad * precio_promedio) de cada posición que tenga este portfolio
        total = sum(pos.quantity * pos.average_price for pos in self.positions.all())
        return total    

# ➔ AGREGÁ ESTO ACÁ ABAJO:
class Position(models.Model):
    portfolio = models.ForeignKey(Portfolio, on_delete=models.CASCADE, related_name="positions")
    symbol = models.CharField(max_length=10)  # Ej: 'AAPL', 'BTC', 'MELI'
    quantity = models.DecimalField(max_digits=12, decimal_places=6)  # Permite fracciones (útil para criptos)
    average_price = models.DecimalField(max_digits=12, decimal_places=2)  # Precio promedio de compra
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        # Evita que el mismo portafolio tenga la misma acción duplicada en filas distintas
        unique_together = ('portfolio', 'symbol') 

    def __str__(self):
        return f"{self.symbol} - {self.quantity} @ {self.average_price} (Portfolio: {self.portfolio.user.username})"
    