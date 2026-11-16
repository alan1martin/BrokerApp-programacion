from django.db import models
from django.contrib.auth.models import User

# --- 1. MODELO PORTFOLIO (CUENTA COMITENTE Y CASH BALANCE) ---
class Portfolio(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="portfolio")
    account_number = models.CharField(max_length=20, unique=True, blank=True, verbose_name="Número de Cuenta Comitente")
    dni = models.CharField(max_length=20, blank=True, null=True, db_index=True, verbose_name="DNI")
    full_name = models.CharField(max_length=150, blank=True, verbose_name="Nombre Completo")
    cash_balance = models.DecimalField(max_digits=15, decimal_places=2, default=10000.00)
    total_value = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)

    def save(self, *args, **kwargs):
        if not self.account_number:
            last_portfolio = Portfolio.objects.exclude(account_number='').order_by('-id').first()
            if last_portfolio and last_portfolio.account_number:
                digits = ''.join(filter(str.isdigit, last_portfolio.account_number))
                next_number = int(digits) + 1 if digits else Portfolio.objects.count() + 1
            else:
                next_number = 1
            
            # Formato con prefijo incluido: CC N° 00001
            self.account_number = f"CC N° {next_number:05d}"
            
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Cuenta {self.account_number} ({self.full_name or self.user.username})"

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

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['portfolio', 'symbol'], name='unique_portfolio_position')
        ]

    def __str__(self):
        return f"{self.symbol} - {self.quantity} para {self.portfolio.user.username}"


# --- 3. MODELO TRANSACTION ---
class Transaction(models.Model):
    TRANSACTION_TYPES = [
        ('BUY', 'Compra'),
        ('SELL', 'Venta'),
        ('DEP', 'Depósito'),
        ('WIT', 'Retiro'),
    ]

    portfolio = models.ForeignKey(Portfolio, on_delete=models.CASCADE, related_name="transactions")
    symbol = models.CharField(max_length=10)
    transaction_type = models.CharField(max_length=4, choices=TRANSACTION_TYPES)
    quantity = models.DecimalField(max_digits=15, decimal_places=6)
    price = models.DecimalField(max_digits=15, decimal_places=2)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.transaction_type} {self.quantity} {self.symbol} a ${self.price} ({self.portfolio.user.username})"


# --- 4. MODELO FAVORITE ---
class Favorite(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="favorites")
    symbol = models.CharField(max_length=10)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['user', 'symbol'], name='unique_user_favorite')
        ]

    def __str__(self):
        return f"{self.user.username} - {self.symbol}"


# --- 5. MODELO MARKETNEWS (Noticias del Dashboard administrables desde Django Admin) ---
class MarketNews(models.Model):
    title = models.CharField(max_length=255, verbose_name="Título")
    summary = models.TextField(blank=True, verbose_name="Resumen")
    link = models.URLField(blank=True, default="", verbose_name="Enlace de la Noticia")
    publisher = models.CharField(max_length=100, default="Peak News", verbose_name="Medio / Publicador")
    related_ticker = models.CharField(max_length=20, default="MERCADO", verbose_name="Ticker / Activo")
    is_active = models.BooleanField(default=True, verbose_name="Activa")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de Creación")

    class Meta:
        verbose_name = "Noticia del Mercado"
        verbose_name_plural = "Noticias del Mercado"
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.related_ticker}] {self.title}"