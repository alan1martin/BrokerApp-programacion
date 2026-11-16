from django.contrib import admin
from .models import Portfolio, Position, Transaction, Favorite, MarketNews

@admin.register(Portfolio)
class PortfolioAdmin(admin.ModelAdmin):
    list_display = ('account_number', 'user', 'full_name', 'dni', 'cash_balance', 'total_value')
    search_fields = ('account_number', 'user__username', 'user__email', 'full_name', 'dni')
    list_filter = ('user__is_staff', 'user__is_superuser')
    readonly_fields = ('account_number',)

@admin.register(Position)
class PositionAdmin(admin.ModelAdmin):
    list_display = ('portfolio', 'symbol', 'quantity', 'average_price')
    search_fields = ('portfolio__account_number', 'portfolio__user__username', 'symbol')
    list_filter = ('symbol',)

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('id', 'portfolio', 'transaction_type', 'symbol', 'quantity', 'price', 'timestamp')
    search_fields = ('portfolio__account_number', 'portfolio__user__username', 'symbol')
    list_filter = ('transaction_type', 'symbol', 'timestamp')

@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    list_display = ('user', 'symbol', 'created_at')
    search_fields = ('user__username', 'symbol')
    list_filter = ('symbol',)

@admin.register(MarketNews)
class MarketNewsAdmin(admin.ModelAdmin):
    list_display = ('title', 'related_ticker', 'publisher', 'is_active', 'created_at')
    list_filter = ('is_active', 'related_ticker', 'publisher')
    search_fields = ('title', 'summary', 'related_ticker')
    list_editable = ('is_active',)
