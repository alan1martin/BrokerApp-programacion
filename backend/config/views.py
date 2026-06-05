from rest_framework.decorators import api_view, permission_classes # 🎯 Importamos permission_classes
from rest_framework.permissions import AllowAny # 🎯 Importamos AllowAny
from rest_framework.response import Response

@api_view(["GET"])
@permission_classes([AllowAny]) # Forzamos que sea un endpoint público y libre de tokens
def hola(request):
    return Response({
        "mensaje": "Hola React!"
    })