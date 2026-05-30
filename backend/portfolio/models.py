from django.db import models
from django.contrib.auth.models import User

# --- 1. MODELO PORTFOLIO (UNO SOLO Y CON EL CASH BALANCE) ---
class Portfolio(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="portfolio")
    cash_balance = models.DecimalField(max_digits=15, decimal_places=2, default=10000.00)
    total_value = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)

    def __str__(self):
        return f"Portfolio de {self.user.username}"

    @property
    def calculated_total_value(self):
        total_acciones = sum(pos.quantity * pos.average_price for pos in self.positions.all())
        return total_acciones + self.cash_balance


# --- 2. MODELO POSITION ---
class Position(models.Model):
    portfolio = models.ForeignKey(Portfolio, on_delete=models.CASCADE, related_name="positions")
    symbol = models.CharField(max_length=10)
    quantity = models.DecimalField(max_digits=15, decimal_places=6, default=0.00)
    average_price = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)

    def __str__(self):
        return f"{self.symbol} - {self.quantity} para {self.portfolio.user.username}"


# --- 3. MODELO TRANSACTION ---
class Transaction(models.Model):
    TRANSACTION_TYPES = [
        ('BUY', 'Compra'),
        ('SELL', 'Venta'),
    ]

    portfolio = models.ForeignKey(Portfolio, on_delete=models.CASCADE, related_name="transactions")
    symbol = models.CharField(max_length=10)
    transaction_type = models.CharField(max_length=4, choices=TRANSACTION_TYPES)
    quantity = models.DecimalField(max_digits=15, decimal_places=6)
    price = models.DecimalField(max_digits=15, decimal_places=2)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.transaction_type} {self.quantity} {self.symbol} a ${self.price} ({self.portfolio.user.username})"