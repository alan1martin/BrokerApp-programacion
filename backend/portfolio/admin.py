from django.contrib import admin
from .models import Portfolio, Position, Transaction

admin.site.register(Portfolio)
admin.site.register(Position)
admin.site.register(Transaction)