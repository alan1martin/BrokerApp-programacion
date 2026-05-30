
from django.urls import path
from .views import PortfolioDetailView, ExecuteTradeView, TransactionListView, reset_portfolio, get_stock_history 

urlpatterns = [
    path('', PortfolioDetailView.as_view(), name='portfolio-detail'),
    path('trade/', ExecuteTradeView.as_view(), name='execute-trade'), 
    path('transactions/', TransactionListView.as_view(), name='transaction-list'), 
    path('reset/', reset_portfolio, name='reset-portfolio'), 
    path('history/<str:symbol>/', get_stock_history, name='stock-history'),
]
