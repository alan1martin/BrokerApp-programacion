#backend/portfolio/urls.py
from django.urls import path
from .views import ( 
    PortfolioDetailView, 
    ExecuteTradeView, 
    TransactionListView, 
    reset_portfolio, 
    get_stock_history, 
    DepositWithdrawCashView, 
    AssetCompositionView, 
    MarketQuotesView, 
    get_portfolio_news )

urlpatterns = [
    path('', PortfolioDetailView.as_view(), name='portfolio-detail'),
    path('trade/', ExecuteTradeView.as_view(), name='execute-trade'), 
    path('transactions/', TransactionListView.as_view(), name='transaction-list'), 
    path('reset/', reset_portfolio, name='reset-portfolio'), 
    path('history/<str:symbol>/', get_stock_history, name='stock-history'),
    path('cash/', DepositWithdrawCashView.as_view(), name='deposit-withdraw-cash'),
    path('composition/', AssetCompositionView.as_view(), name='asset-composition'),
    path('market-quotes/', MarketQuotesView.as_view(), name='market-quotes'),
    path('news/', get_portfolio_news, name='portfolio-news')
]
