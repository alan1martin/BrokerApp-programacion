
from django.urls import path
from .views import PortfolioDetailView, ExecuteTradeView, TransactionListView 

urlpatterns = [
    path('', PortfolioDetailView.as_view(), name='portfolio-detail'),
    path('trade/', ExecuteTradeView.as_view(), name='execute-trade'), 
    path('transactions/', TransactionListView.as_view(), name='transaction-list'), #Nueva ruta
]
