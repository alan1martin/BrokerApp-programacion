from django.contrib import admin
from .models import Portfolio, Position, Transaction, Favorite

admin.site.register(Portfolio)
admin.site.register(Position)
admin.site.register(Transaction)
admin.site.register(Favorite)
