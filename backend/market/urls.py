# market/urls.py
from django.urls import path
from .views import MarketSearchAPIView, AssetDetailAPIView

urlpatterns = [
    path('search/', MarketSearchAPIView.as_view(), name='market-search'),
    path('asset/<str:ticker>/', AssetDetailAPIView.as_view(), name='asset-detail'),
]