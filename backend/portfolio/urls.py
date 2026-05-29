
from django.urls import path

from .views import get_portfolio

urlpatterns = [
    path(
        "",
        get_portfolio,
    ),
]
