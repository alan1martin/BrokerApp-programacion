#backend/config/urls.py
from django.contrib import admin
from django.urls import path, include

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from .views import hola

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/hola/', hola),
    path('api/token/', TokenObtainPairView.as_view(),),
    path('api/token/refresh/', TokenRefreshView.as_view(),),
    path("api/portfolio/", include("portfolio.urls"),),
]

from django.urls import (
    path,
    include,
)
