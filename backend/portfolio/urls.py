
from django.urls import path
from .views import PortfolioDetailView, ExecuteTradeView 

urlpatterns = [
    path('', PortfolioDetailView.as_view(), name='portfolio-detail'),
    path('trade/', ExecuteTradeView.as_view(), name='execute-trade'), # ➔ NUEVA RUTA
]
