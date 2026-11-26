# backend/config/urls.py
from django.contrib import admin
from django.urls import path, include

from rest_framework_simplejwt.views import (
    TokenRefreshView,
)

from .views import hola
from portfolio.views import (
    get_favorites, 
    toggle_favorite, 
    register_user, 
    CustomTokenObtainPairView,
    get_current_user_profile,
    logout_user
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/hola/', hola),
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/logout/', logout_user, name='logout_user'),
    path('api/register/', register_user, name='register_user'),
    path('api/user/me/', get_current_user_profile, name='current_user_profile'),
    path("api/portfolio/", include("portfolio.urls")),
    path("api/market/", include("market.urls")),
    # Soporte para la ruta de favoritos llamada por el frontend en /api/markets/favorites/
    path("api/markets/favorites/", get_favorites, name='market-favorites'),
    path("api/markets/favorites/toggle/", toggle_favorite, name='market-favorites-toggle'),
]
