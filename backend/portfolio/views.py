
from rest_framework.decorators import (
    api_view,
    permission_classes,
)

from rest_framework.permissions import (
    IsAuthenticated,
)

from rest_framework.response import Response

from .models import Portfolio
from .serializers import PortfolioSerializer


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_portfolio(request):

    portfolio, created = (
        Portfolio.objects.get_or_create(
            user=request.user
        )
    )

    serializer = PortfolioSerializer(
        portfolio
    )

    return Response(serializer.data)
